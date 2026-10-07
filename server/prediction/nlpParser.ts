/**
 * Advanced NLP Parser v2 — Deep linguistic analysis for CarMachi prediction engine
 * 
 * Improvements over v1:
 * - Multi-pattern budget parsing (handles "around 10-12L", "budget is 15 lakhs", "₹10L", etc.)
 * - Compound negation handling ("I don't want a Tata or Maruti")
 * - Comparative intent detection ("better than Creta", "similar to Nexon")
 * - Lifestyle context extraction (road conditions, climate, family structure)
 * - Implicit priority inference from compound phrases
 * - Synonym expansion for body types, fuel types, and features
 */

export interface ParsedQuery {
    budgetMin?: number;
    budgetMax?: number;
    fuelPreference?: string;
    bodyType?: string;
    transmission?: string;
    priorities: string[];
    dailyDrivingKm?: number;
    usageType?: string;
    familySize?: number;
    seatingCapacity?: number;
    firstCar?: boolean;
    city?: string;
    state?: string;
    excludedBrands: string[];
    preferredBrands: string[];
    excludedBody?: string;
    excludedFuel?: string;
    comparisonCars: string[];  // NEW: "better than Creta" → ['Creta']
    jevAnalysis: {
        wantsSafe: boolean;
        wantsFast: boolean;
        wantsEconomy: boolean;
        wantsSUV: boolean;
        wantsComfort: boolean;    // NEW
        wantsTech: boolean;       // NEW
        wantsOffroad: boolean;    // NEW
        wantsCompact: boolean;    // NEW
    };
    contextSignals: {            // NEW
        terrain: string;
        climate: string;
        usagePattern: string;
        passengerProfile: string;
        parkingConstraint: string;
    };
}

// ─── BRAND DATABASE ───
const BRAND_MAP: Record<string, string> = {
    'maruti': 'Maruti Suzuki', 'maruti suzuki': 'Maruti Suzuki', 'suzuki': 'Maruti Suzuki',
    'hyundai': 'Hyundai', 'tata': 'Tata', 'mahindra': 'Mahindra',
    'kia': 'Kia', 'toyota': 'Toyota', 'honda': 'Honda',
    'volkswagen': 'Volkswagen', 'vw': 'Volkswagen', 
    'skoda': 'Skoda', 'mg': 'MG', 'renault': 'Renault',
    'nissan': 'Nissan', 'citroen': 'Citroen', 'jeep': 'Jeep',
    'bmw': 'BMW', 'mercedes': 'Mercedes-Benz', 'audi': 'Audi',
    'land rover': 'Land Rover', 'volvo': 'Volvo', 'lexus': 'Lexus',
};
const BRAND_KEYS = Object.keys(BRAND_MAP);

// ─── CAR NAME DATABASE (for comparison intent) ───
const CAR_NAMES = [
    'alto', 'wagonr', 'wagon r', 'swift', 'baleno', 'dzire', 'brezza', 'fronx', 'jimny', 'invicto', 'ertiga', 'xl6', 'grand vitara', 'ciaz',
    'i10', 'i20', 'venue', 'creta', 'verna', 'alcazar', 'tucson', 'exter', 'aura',
    'punch', 'altroz', 'nexon', 'harrier', 'safari', 'tiago', 'tigor', 'curvv',
    'xuv300', 'xuv700', 'thar', 'bolero', 'scorpio', 'scorpio n', 'xuv400', 'be 6',
    'seltos', 'sonet', 'carens', 'syros', 'ev6',
    'innova', 'fortuner', 'glanza', 'urban cruiser', 'hyryder', 'camry',
    'city', 'amaze', 'elevate', 'wr-v',
    'virtus', 'taigun', 'kushaq', 'slavia',
    'hector', 'astor', 'gloster', 'comet', 'windsor',
    'magnite', 'kicks', 'x-trail',
];

// ─── CITY DATABASE ───
const CITY_MAP: Record<string, { name: string; state: string }> = {
    'mumbai': { name: 'Mumbai', state: 'Maharashtra' },
    'delhi': { name: 'Delhi', state: 'Delhi' },
    'new delhi': { name: 'Delhi', state: 'Delhi' },
    'bangalore': { name: 'Bangalore', state: 'Karnataka' },
    'bengaluru': { name: 'Bangalore', state: 'Karnataka' },
    'hyderabad': { name: 'Hyderabad', state: 'Telangana' },
    'chennai': { name: 'Chennai', state: 'Tamil Nadu' },
    'kolkata': { name: 'Kolkata', state: 'West Bengal' },
    'pune': { name: 'Pune', state: 'Maharashtra' },
    'ahmedabad': { name: 'Ahmedabad', state: 'Gujarat' },
    'jaipur': { name: 'Jaipur', state: 'Rajasthan' },
    'lucknow': { name: 'Lucknow', state: 'Uttar Pradesh' },
    'chandigarh': { name: 'Chandigarh', state: 'Chandigarh' },
    'kochi': { name: 'Kochi', state: 'Kerala' },
    'coimbatore': { name: 'Coimbatore', state: 'Tamil Nadu' },
    'noida': { name: 'Noida', state: 'Uttar Pradesh' },
    'gurgaon': { name: 'Gurgaon', state: 'Haryana' },
    'gurugram': { name: 'Gurgaon', state: 'Haryana' },
    'indore': { name: 'Indore', state: 'Madhya Pradesh' },
    'bhopal': { name: 'Bhopal', state: 'Madhya Pradesh' },
    'nagpur': { name: 'Nagpur', state: 'Maharashtra' },
    'visakhapatnam': { name: 'Visakhapatnam', state: 'Andhra Pradesh' },
    'vizag': { name: 'Visakhapatnam', state: 'Andhra Pradesh' },
    'patna': { name: 'Patna', state: 'Bihar' },
    'vadodara': { name: 'Vadodara', state: 'Gujarat' },
    'surat': { name: 'Surat', state: 'Gujarat' },
    'trivandrum': { name: 'Trivandrum', state: 'Kerala' },
    'thiruvananthapuram': { name: 'Trivandrum', state: 'Kerala' },
    'mysore': { name: 'Mysore', state: 'Karnataka' },
    'mysuru': { name: 'Mysore', state: 'Karnataka' },
    'mangalore': { name: 'Mangalore', state: 'Karnataka' },
    'goa': { name: 'Goa', state: 'Goa' },
    'ranchi': { name: 'Ranchi', state: 'Jharkhand' },
    'dehradun': { name: 'Dehradun', state: 'Uttarakhand' },
    'shimla': { name: 'Shimla', state: 'Himachal Pradesh' },
    'poonamallee': { name: 'Poonamallee', state: 'Tamil Nadu' },
    'poonamalle': { name: 'Poonamallee', state: 'Tamil Nadu' },
};

// ─── SIGNAL KEYWORDS ───
const SAFETY_KEYWORDS = /\b(?:safe|safety|build quality|ncap|sturdy|strong body|crash|airbag|protect|secure|accident|child seat|isofix|adas|abs|ebd|esc|traction control)\b/;
const PERFORMANCE_KEYWORDS = /\b(?:fast|performance|quick|power|powerful|enthusiast|fun.?to.?drive|speed|acceleration|turbo|sport|sporty|racing|drift|horsepower|bhp|torque|kick)\b/;
const ECONOMY_KEYWORDS = /\b(?:mileage|fuel.?efficient|economy|cheap.?to.?run|daily.?commute|city.?drive|running.?cost|low.?cost|affordable|kmpl|km.?per|save.?fuel|budget.?friendly|pocket.?friendly)\b/;
const COMFORT_KEYWORDS = /\b(?:comfort|comfortable|smooth|ride.?quality|suspension|cushion|ac|air.?conditioning|noise|silent|quiet|vibration|seats|lumbar|ventilated|heated|plush|luxury)\b/;
const TECH_KEYWORDS = /\b(?:features|tech|technology|touchscreen|infotainment|apple.?carplay|android.?auto|connected|ota|hud|360.?camera|wireless|sunroof|panoramic|digital|instrument|cluster|adas|cruise.?control)\b/;
const OFFROAD_KEYWORDS = /\b(?:offroad|off.?road|rough.?road|pothole|bad.?road|village|4wd|4x4|awd|all.?wheel|ground.?clearance|water.?wading|mud|gravel|terrain|mountain|hill|trek)\b/;
const COMPACT_KEYWORDS = /\b(?:compact|small|tiny|mini|narrow.?lane|parking|tight.?space|easy.?to.?park|city.?car|manoeuvre|maneuver|turning.?radius|short)\b/;

const TERRAIN_SIGNALS: Record<string, string[]> = {
    'city': ['city', 'traffic', 'urban', 'signal', 'metro', 'town', 'office', 'commute', 'parking'],
    'highway': ['highway', 'expressway', 'long drive', 'road trip', 'touring', 'interstate', 'cruise'],
    'offroad': ['offroad', 'off road', 'rough road', 'pothole', 'bad road', 'village', 'mud', 'hill', 'mountain', 'trek', 'ghat', 'gravel'],
    'mixed': ['both', 'city and highway', 'all purpose', 'versatile'],
};

const CLIMATE_SIGNALS: Record<string, string[]> = {
    'hot': ['summer', 'heat', 'hot', 'scorching', 'ac important', 'rajasthan', 'gujarat'],
    'rainy': ['monsoon', 'rain', 'rainy', 'flood', 'water', 'wet', 'slippery', 'kerala', 'mumbai rain', 'chennai rain'],
    'cold': ['snow', 'cold', 'winter', 'hill station', 'shimla', 'manali', 'ladakh', 'kashmir', 'dehradun'],
    'moderate': ['moderate', 'pleasant', 'bangalore weather'],
};

const USAGE_SIGNALS: Record<string, string[]> = {
    'daily_commute': ['daily', 'office', 'commute', 'everyday', 'work', 'school', 'routine', 'regular'],
    'weekend': ['weekend', 'occasional', 'leisure', 'outing', 'picnic'],
    'long_trips': ['road trip', 'long drive', 'highway', 'touring', 'travel', 'outstation', 'interstate'],
    'commercial': ['uber', 'ola', 'cab', 'taxi', 'commercial', 'fleet', 'rental'],
};

const PASSENGER_SIGNALS: Record<string, string[]> = {
    'solo': ['alone', 'solo', 'single', 'bachelor', 'myself'],
    'couple': ['couple', 'wife', 'husband', 'partner', 'two of us', 'girlfriend'],
    'family_small': ['family', 'small family', 'kids', 'child', 'children', 'baby', 'toddler', 'family of 3', 'family of 4'],
    'family_large': ['big family', 'large family', 'joint family', '6 people', '7 people', '7 seater', '8 seater', 'three rows', 'third row'],
    'elderly': ['parents', 'elderly', 'old parents', 'senior citizen', 'grandparents', 'mother', 'father', 'dad', 'mom', 'grandfather', 'grandmother'],
};

/**
 * Advanced NLP Parser v2
 */
export const advancedNaturalLanguageParser = (text: string, existingInput: any): ParsedQuery => {
    const input: ParsedQuery = {
        ...existingInput,
        priorities: existingInput?.priorities || [],
        excludedBrands: existingInput?.excludedBrands || [],
        preferredBrands: existingInput?.preferredBrands || [],
        comparisonCars: [],
        jevAnalysis: {
            wantsSafe: false, wantsFast: false, wantsEconomy: false, wantsSUV: false,
            wantsComfort: false, wantsTech: false, wantsOffroad: false, wantsCompact: false,
        },
        contextSignals: {
            terrain: 'mixed', climate: 'moderate', usagePattern: 'daily_commute',
            passengerProfile: 'solo', parkingConstraint: 'normal',
        },
    };

    const lowerText = text.toLowerCase().replace(/[.,!?]/g, ' ').replace(/\s+/g, ' ').trim();
    const words = lowerText.split(' ');

    // ═══════════════════════════════════════════════════
    // 1. BUDGET PARSING (most comprehensive)
    // ═══════════════════════════════════════════════════
    // "10 to 15 lakhs", "10-12l", "₹10-15L"
    const rangeMatch = lowerText.match(/(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:lakh|l\b|lacs|lac)/);
    if (rangeMatch) {
        input.budgetMin = Number(rangeMatch[1]) * 100000;
        input.budgetMax = Number(rangeMatch[2]) * 100000;
    } else {
        // "under 15 lakhs", "max 10l", "within 12L", "budget 15 lakh", "15l budget"
        const budgetPatterns = [
            /(?:under|below|max|within|upto|up to|around|about|budget\s*(?:is|of)?|price\s*(?:range)?)\s*(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)\s*(?:lakh|l\b|lacs|lac)/,
            /(\d+(?:\.\d+)?)\s*(?:lakh|l\b|lacs|lac)\s*(?:budget|max|range)/,
            /(?:₹|rs\.?\s*)(\d+(?:\.\d+)?)\s*(?:lakh|l\b|lacs|lac)/,
        ];
        for (const pattern of budgetPatterns) {
            const m = lowerText.match(pattern);
            if (m) {
                const val = Number(m[1]) * 100000;
                if (lowerText.match(/(?:around|about|close\s*to|approximately|~)/)) {
                    input.budgetMin = Math.max(0, val - 300000);
                    input.budgetMax = val + 300000;
                } else if (lowerText.match(/(?:above|over|more than|minimum|at least|starting)/)) {
                    input.budgetMin = val;
                } else {
                    input.budgetMax = val;
                }
                break;
            }
        }
        // Raw number fallback: "under 1500000"
        if (!input.budgetMax && !input.budgetMin) {
            const numMatch = lowerText.match(/(?:under|below|max|upto|up to)\s*(?:₹|rs\.?\s*)?(\d{5,})/);
            if (numMatch) input.budgetMax = Number(numMatch[1]);
        }
    }

    // ═══════════════════════════════════════════════════
    // 2. NEGATION HANDLING (compound-aware)
    // ═══════════════════════════════════════════════════
    // "I don't want Tata or Maruti", "no diesel or cng", "exclude hyundai and kia"
    const negationPatterns = [
        /(?:no|not|don'?t\s*want|exclude|avoid|without|hate|dislike|never)\s+([\w\s]+?)(?:\s*(?:and|or|,)\s+([\w]+))?(?:\s|$)/g,
    ];
    for (const pattern of negationPatterns) {
        let match;
        while ((match = pattern.exec(lowerText)) !== null) {
            const terms = [match[1]?.trim(), match[2]?.trim()].filter(Boolean);
            for (const term of terms) {
                if (!term) continue;
                const brandKey = BRAND_KEYS.find(b => term.includes(b));
                if (brandKey) input.excludedBrands.push(brandKey);

                if (/electric|ev/.test(term)) input.excludedFuel = 'Electric';
                if (/diesel/.test(term)) input.excludedFuel = 'Diesel';
                if (/cng/.test(term)) input.excludedFuel = 'CNG';
                if (/petrol/.test(term)) input.excludedFuel = 'Petrol';
                if (/manual/.test(term)) input.transmission = 'Automatic';
                if (/automatic|amt|cvt/.test(term)) input.transmission = 'Manual';
                if (/suv/.test(term)) input.excludedBody = 'SUV';
                if (/sedan/.test(term)) input.excludedBody = 'Sedan';
                if (/hatchback/.test(term)) input.excludedBody = 'Hatchback';
            }
        }
    }

    // ═══════════════════════════════════════════════════
    // 3. BRAND PREFERENCES
    // ═══════════════════════════════════════════════════
    const preferPatterns = /(?:prefer|only|like|want|love|fan of|go with|considering)\s+([\w\s]+?)(?:\s*(?:and|or|,)\s+([\w]+))?(?:\s|cars|car|brand|$)/g;
    let prefMatch;
    while ((prefMatch = preferPatterns.exec(lowerText)) !== null) {
        [prefMatch[1], prefMatch[2]].filter(Boolean).forEach(term => {
            if (!term) return;
            const brandKey = BRAND_KEYS.find(b => term.trim().includes(b));
            if (brandKey && !input.excludedBrands.includes(brandKey)) {
                input.preferredBrands.push(brandKey);
            }
        });
    }
    // Detect standalone brand mentions
    BRAND_KEYS.forEach(b => {
        if (lowerText.includes(b) && !input.excludedBrands.includes(b) && !input.preferredBrands.includes(b)) {
            // Check it's not part of a negation
            const idx = lowerText.indexOf(b);
            const before = lowerText.slice(Math.max(0, idx - 20), idx);
            if (!/(?:no|not|don'?t|exclude|avoid|without|hate)/.test(before)) {
                input.preferredBrands.push(b);
            }
        }
    });

    // ═══════════════════════════════════════════════════
    // 4. COMPARISON INTENT ("better than Creta", "vs Nexon")
    // ═══════════════════════════════════════════════════
    const compPatterns = [
        /(?:better than|vs|versus|compared to|alternative to|instead of|replace|upgrade from)\s+([\w\s]+)/g,
    ];
    for (const pattern of compPatterns) {
        let m;
        while ((m = pattern.exec(lowerText)) !== null) {
            const carName = CAR_NAMES.find(cn => m[1].includes(cn));
            if (carName) input.comparisonCars.push(carName);
        }
    }

    // ═══════════════════════════════════════════════════
    // 5. SEATING CAPACITY
    // ═══════════════════════════════════════════════════
    const seatMatch = lowerText.match(/(\d+)\s*(?:seater|seats|seat|passenger)/);
    if (seatMatch) {
        input.seatingCapacity = Number(seatMatch[1]);
    }
    const familySizeMatch = lowerText.match(/family\s*of\s*(\d+)/);
    if (familySizeMatch) input.familySize = Number(familySizeMatch[1]);
    if (lowerText.match(/(?:big family|large family|joint family|7 people|8 people)/)) {
        input.familySize = input.familySize || 7;
        input.seatingCapacity = input.seatingCapacity || 7;
    }
    if (lowerText.match(/(?:small family|nuclear|family of 4|4 people)/)) {
        input.familySize = input.familySize || 4;
    }

    // ═══════════════════════════════════════════════════
    // 6. BODY TYPE (with synonym expansion)
    // ═══════════════════════════════════════════════════
    if (/\b(?:suv|crossover|sport utility)\b/.test(lowerText) && input.excludedBody !== 'SUV') input.bodyType = 'SUV';
    else if (/\b(?:sedan|saloon|notchback)\b/.test(lowerText) && input.excludedBody !== 'Sedan') input.bodyType = 'Sedan';
    else if (/\b(?:hatchback|hatch|small car)\b/.test(lowerText) && input.excludedBody !== 'Hatchback') input.bodyType = 'Hatchback';
    else if (/\b(?:mpv|muv|people carrier|people mover|minivan)\b/.test(lowerText) && input.excludedBody !== 'MUV') input.bodyType = 'MUV';
    else if (/\b(?:coupe|sports car|two door)\b/.test(lowerText)) input.bodyType = 'Coupe';
    else if (/\b(?:pickup|pick up|truck)\b/.test(lowerText)) input.bodyType = 'Pickup';

    // ═══════════════════════════════════════════════════
    // 7. FUEL PREFERENCE (with synonym expansion)
    // ═══════════════════════════════════════════════════
    if (/\b(?:petrol|gasoline)\b/.test(lowerText) && input.excludedFuel !== 'Petrol') input.fuelPreference = 'Petrol';
    else if (/\b(?:diesel)\b/.test(lowerText) && input.excludedFuel !== 'Diesel') input.fuelPreference = 'Diesel';
    else if (/\b(?:cng|bi-?fuel)\b/.test(lowerText) && input.excludedFuel !== 'CNG') input.fuelPreference = 'CNG';
    else if (/\b(?:ev|electric|battery|zero emission)\b/.test(lowerText) && input.excludedFuel !== 'Electric') input.fuelPreference = 'Electric';
    else if (/\b(?:hybrid|strong hybrid|mild hybrid)\b/.test(lowerText)) input.fuelPreference = 'Hybrid';

    // ═══════════════════════════════════════════════════
    // 8. TRANSMISSION
    // ═══════════════════════════════════════════════════
    if (/\b(?:automatic|auto|amt|cvt|dct|torque converter|imt)\b/.test(lowerText) && input.transmission !== 'Manual') {
        input.transmission = 'Automatic';
    } else if (/\b(?:manual|stick|mt)\b/.test(lowerText) && input.transmission !== 'Automatic') {
        input.transmission = 'Manual';
    }

    // ═══════════════════════════════════════════════════
    // 9. DEEP LIFESTYLE/CONTEXT ANALYSIS (JEV signals)
    // ═══════════════════════════════════════════════════
    if (SAFETY_KEYWORDS.test(lowerText)) {
        input.jevAnalysis.wantsSafe = true;
        if (!input.priorities.includes('safety')) input.priorities.push('safety');
    }
    if (PERFORMANCE_KEYWORDS.test(lowerText)) {
        input.jevAnalysis.wantsFast = true;
        if (!input.priorities.includes('performance')) input.priorities.push('performance');
    }
    if (ECONOMY_KEYWORDS.test(lowerText)) {
        input.jevAnalysis.wantsEconomy = true;
        if (!input.priorities.includes('mileage')) input.priorities.push('mileage');
    }
    if (COMFORT_KEYWORDS.test(lowerText)) {
        input.jevAnalysis.wantsComfort = true;
        if (!input.priorities.includes('comfort')) input.priorities.push('comfort');
    }
    if (TECH_KEYWORDS.test(lowerText)) {
        input.jevAnalysis.wantsTech = true;
        if (!input.priorities.includes('features')) input.priorities.push('features');
    }
    if (OFFROAD_KEYWORDS.test(lowerText)) {
        input.jevAnalysis.wantsOffroad = true;
        input.jevAnalysis.wantsSUV = true; // offroad implies SUV
        if (!input.priorities.includes('ground_clearance')) input.priorities.push('ground_clearance');
    }
    if (COMPACT_KEYWORDS.test(lowerText)) {
        input.jevAnalysis.wantsCompact = true;
    }
    if (/\bsuv\b/.test(lowerText)) {
        input.jevAnalysis.wantsSUV = true;
    }

    // ═══════════════════════════════════════════════════
    // 10. CONTEXT SIGNALS (terrain, climate, usage, passengers)
    // ═══════════════════════════════════════════════════
    for (const [signal, keywords] of Object.entries(TERRAIN_SIGNALS)) {
        if (keywords.some(kw => lowerText.includes(kw))) {
            input.contextSignals.terrain = signal;
            break;
        }
    }
    for (const [signal, keywords] of Object.entries(CLIMATE_SIGNALS)) {
        if (keywords.some(kw => lowerText.includes(kw))) {
            input.contextSignals.climate = signal;
            break;
        }
    }
    for (const [signal, keywords] of Object.entries(USAGE_SIGNALS)) {
        if (keywords.some(kw => lowerText.includes(kw))) {
            input.contextSignals.usagePattern = signal;
            break;
        }
    }
    for (const [signal, keywords] of Object.entries(PASSENGER_SIGNALS)) {
        if (keywords.some(kw => lowerText.includes(kw))) {
            input.contextSignals.passengerProfile = signal;
            break;
        }
    }
    if (COMPACT_KEYWORDS.test(lowerText) || /\b(?:narrow|tight)\b/.test(lowerText)) {
        input.contextSignals.parkingConstraint = 'tight';
    }

    // ═══════════════════════════════════════════════════
    // 11. IMPLICIT PRIORITY INFERENCE FROM CONTEXT
    // ═══════════════════════════════════════════════════
    // Elderly passengers → comfort + smooth ride + easy ingress
    if (input.contextSignals.passengerProfile === 'elderly') {
        if (!input.priorities.includes('comfort')) input.priorities.push('comfort');
        input.jevAnalysis.wantsComfort = true;
    }
    // Rainy climate → safety + traction
    if (input.contextSignals.climate === 'rainy') {
        if (!input.priorities.includes('safety')) input.priorities.push('safety');
        input.jevAnalysis.wantsSafe = true;
    }
    // Offroad terrain → ground clearance + SUV
    if (input.contextSignals.terrain === 'offroad') {
        if (!input.bodyType) input.bodyType = 'SUV';
        input.jevAnalysis.wantsSUV = true;
    }
    // Commercial usage → mileage + low running cost
    if (input.contextSignals.usagePattern === 'commercial') {
        if (!input.priorities.includes('mileage')) input.priorities.push('mileage');
        input.jevAnalysis.wantsEconomy = true;
        if (!input.fuelPreference) input.fuelPreference = 'CNG'; // Ola/Uber drivers prefer CNG
    }
    // Large family → 7-seater
    if (input.contextSignals.passengerProfile === 'family_large') {
        input.seatingCapacity = input.seatingCapacity || 7;
        if (!input.bodyType) input.bodyType = 'SUV';
    }
    // First car
    if (/\b(?:first car|new driver|beginner|learner|just got license|first time)\b/.test(lowerText)) {
        input.firstCar = true;
        // First car buyers prioritize ease of driving and value
        if (!input.priorities.includes('safety')) input.priorities.push('safety');
    }

    // ═══════════════════════════════════════════════════
    // 12. DAILY DRIVING KM
    // ═══════════════════════════════════════════════════
    const kmMatch = lowerText.match(/(\d+)\s*(?:km|kilo|kilometer)/);
    if (kmMatch) input.dailyDrivingKm = Number(kmMatch[1]);

    // ═══════════════════════════════════════════════════
    // 13. CITY DETECTION
    // ═══════════════════════════════════════════════════
    for (const [key, cityData] of Object.entries(CITY_MAP)) {
        if (lowerText.includes(key)) {
            input.city = cityData.name;
            input.state = cityData.state;
            break;
        }
    }

    // ═══════════════════════════════════════════════════
    // 14. DEDUPLICATE
    // ═══════════════════════════════════════════════════
    input.preferredBrands = [...new Set(input.preferredBrands)];
    input.excludedBrands = [...new Set(input.excludedBrands)];
    input.priorities = [...new Set(input.priorities)];
    // Remove any brand that appears in both preferred and excluded
    input.preferredBrands = input.preferredBrands.filter(b => !input.excludedBrands.includes(b));

    return input;
};
