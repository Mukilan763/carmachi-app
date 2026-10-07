/**
 * Prediction Engine v2 — Two-Stage Cascade Architecture
 * 
 * Stage 1 (Hard Gatekeeper): Deterministic filtering on budget, fuel, body, brand, seating.
 *   → Narrows 150 cars to ~10-20 candidates in <1ms.
 * 
 * Stage 2 (Semantic Ranker): TF-IDF cosine similarity + context-aware scoring.
 *   → Ranks candidates by semantic relevance to user's natural language query.
 * 
 * Final scoring blends:
 *   - 40% Deterministic factors (VFM, service, resale, mileage, safety, performance)
 *   - 35% Semantic relevance (how well the car's profile matches the user's intent)
 *   - 25% Context bonuses (terrain, climate, passenger profile, lifestyle fit)
 */

import { SemanticSearchEngine, buildCarProfile } from './semanticEngine';
import { SemanticCache } from './semanticCache';

// ─── Singleton instances (initialized once, reused across requests) ───
let semanticEngine: SemanticSearchEngine | null = null;
let lastCarCount = 0;
const queryCache = new SemanticCache(10); // 10-minute TTL

export interface PredictionInput {
    city: string;
    state?: string;
    budgetMin?: number;
    budgetMax?: number;
    fuelPreference?: string;
    bodyType?: string;
    transmission?: string;
    priorities?: string[];
    dailyDrivingKm?: number;
    usageType?: string;
    familySize?: number;
    seatingCapacity?: number;
    firstCar?: boolean;
    textQuery?: string;
    excludedBrands?: string[];
    preferredBrands?: string[];
    comparisonCars?: string[];
    excludedBody?: string;
    excludedFuel?: string;
    jevAnalysis?: any;
    contextSignals?: any;
}

// ─── Brand reputation scores (based on Indian market research) ───
const BRAND_RESALE: Record<string, number> = {
    'Toyota': 95, 'Maruti Suzuki': 92, 'Hyundai': 86, 'Honda': 84,
    'Mahindra': 82, 'Kia': 80, 'Tata': 78, 'Skoda': 75,
    'Volkswagen': 75, 'MG': 72, 'Renault': 68, 'Nissan': 66,
    'Citroen': 65, 'Jeep': 70,
};
const BRAND_SERVICE_DEFAULT: Record<string, number> = {
    'Maruti Suzuki': 45, 'Hyundai': 28, 'Tata': 24, 'Mahindra': 20,
    'Toyota': 18, 'Honda': 16, 'Kia': 15, 'MG': 12,
    'Skoda': 10, 'Volkswagen': 10, 'Renault': 8, 'Nissan': 6,
};
const BRAND_SAFETY: Record<string, number> = {
    'Tata': 95, 'Volkswagen': 93, 'Skoda': 92, 'Toyota': 88,
    'Mahindra': 88, 'Hyundai': 85, 'Kia': 85, 'Honda': 84,
    'MG': 82, 'Maruti Suzuki': 74, 'Renault': 72, 'Nissan': 72,
};

// ─── Context-aware scoring modifiers ───
const TERRAIN_BODY_BONUS: Record<string, Record<string, number>> = {
    'offroad': { 'SUV': 15, 'Hatchback': -10, 'Sedan': -15, 'MUV': 5 },
    'city':    { 'Hatchback': 10, 'Sedan': 5, 'SUV': -5 },
    'highway': { 'Sedan': 10, 'SUV': 5, 'Hatchback': -5 },
    'mixed':   {},
};
const CLIMATE_FUEL_BONUS: Record<string, Record<string, number>> = {
    'hot':     { 'Diesel': 5 },
    'rainy':   {},
    'cold':    { 'Petrol': 5, 'Diesel': -5 },
    'moderate': {},
};

/**
 * Extract numeric value from strings like "113.18bhp@6300rpm" or "143 Nm"
 */
function extractNumber(str: string | undefined): number {
    if (!str) return 0;
    const m = str.match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : 0;
}

/**
 * Determine the persona from parsed priorities and context
 */
function detectPersona(input: PredictionInput): string {
    const priorities = input.priorities || [];
    const jev = input.jevAnalysis || {};
    const ctx = input.contextSignals || {};

    // Weighted persona scoring
    const scores: Record<string, number> = { Family: 0, Enthusiast: 0, Economy: 0, Comfort: 0, Balanced: 5 };

    if (jev.wantsSafe) scores.Family += 3;
    if (jev.wantsFast) scores.Enthusiast += 5;
    if (jev.wantsEconomy) scores.Economy += 5;
    if (jev.wantsComfort) scores.Comfort += 4;
    if (jev.wantsSUV) scores.Family += 2;
    if (jev.wantsOffroad) scores.Enthusiast += 2;

    if (ctx.passengerProfile === 'family_large' || ctx.passengerProfile === 'family_small') scores.Family += 4;
    if (ctx.passengerProfile === 'elderly') scores.Comfort += 3;
    if (ctx.usagePattern === 'commercial') scores.Economy += 4;
    if (ctx.usagePattern === 'daily_commute') scores.Economy += 2;
    if (ctx.terrain === 'offroad') scores.Enthusiast += 2;
    if (ctx.terrain === 'highway') scores.Comfort += 2;

    if (priorities.includes('safety')) scores.Family += 2;
    if (priorities.includes('performance')) scores.Enthusiast += 3;
    if (priorities.includes('mileage')) scores.Economy += 3;
    if (priorities.includes('comfort')) scores.Comfort += 3;

    if (input.familySize && input.familySize >= 4) scores.Family += 3;
    if (input.firstCar) scores.Economy += 2;

    // Return highest scoring persona
    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * STAGE 1: Hard Deterministic Filter
 * Removes cars that absolutely don't match the math constraints.
 */
function hardFilter(cars: any[], input: PredictionInput): any[] {
    const minBudget = Number(input.budgetMin) || 0;
    const maxBudget = Number(input.budgetMax) || Infinity;
    const flexMaxBudget = maxBudget * 1.15; // 15% flex

    return cars.filter(c => {
        // Excluded brands
        if (input.excludedBrands?.length && input.excludedBrands.some(b =>
            c.brand.toLowerCase().includes(b.toLowerCase())
        )) return false;

        // Excluded body type
        if (input.excludedBody && c.bodyType?.toLowerCase() === input.excludedBody.toLowerCase()) return false;

        // Seating capacity
        const requiredSeats = input.seatingCapacity || input.familySize || 0;
        if (requiredSeats && c.seatingCapacity < requiredSeats) return false;

        // Body type preference
        if (input.bodyType && input.bodyType !== 'Any') {
            if (c.bodyType?.toLowerCase() !== input.bodyType.toLowerCase()) return false;
        }

        // Budget (soft: allow 15% over)
        const pMin = c.priceRange?.min ?? 0;
        const pMax = c.priceRange?.max ?? Infinity;
        if (pMin > flexMaxBudget || pMax < minBudget) return false;

        // Fuel preference / exclusion
        if (input.fuelPreference && input.fuelPreference !== 'Any') {
            const hasFuel = c.variants?.some((v: any) =>
                v.fuelType?.toLowerCase() === input.fuelPreference?.toLowerCase()
            );
            if (!hasFuel) return false;
        }
        if (input.excludedFuel) {
            const hasOtherFuel = c.variants?.some((v: any) =>
                v.fuelType?.toLowerCase() !== input.excludedFuel?.toLowerCase()
            );
            if (!hasOtherFuel) return false;
        }

        // Transmission
        if (input.transmission && input.transmission !== 'Any') {
            const hasTrans = c.variants?.some((v: any) =>
                v.transmission?.toLowerCase() === input.transmission?.toLowerCase()
            );
            if (!hasTrans) return false;
        }

        return true;
    });
}

/**
 * Find the best matching variant for the user's preferences within budget
 */
function findBestVariant(car: any, input: PredictionInput): any {
    let candidates = car.variants || [];

    if (input.fuelPreference && input.fuelPreference !== 'Any') {
        const fuelFiltered = candidates.filter((v: any) =>
            v.fuelType?.toLowerCase() === input.fuelPreference?.toLowerCase()
        );
        if (fuelFiltered.length > 0) candidates = fuelFiltered;
    }

    if (input.transmission && input.transmission !== 'Any') {
        const transFiltered = candidates.filter((v: any) =>
            v.transmission?.toLowerCase() === input.transmission?.toLowerCase()
        );
        if (transFiltered.length > 0) candidates = transFiltered;
    }

    const maxBudget = Number(input.budgetMax) || Infinity;
    const minBudget = Number(input.budgetMin) || 0;

    const inBudget = candidates.filter((v: any) =>
        v.priceExShowroom <= maxBudget && v.priceExShowroom >= minBudget
    );

    // Pick highest trim within budget (best features for the money)
    return inBudget.length > 0
        ? inBudget[inBudget.length - 1]
        : (candidates[0] || car.variants?.[0]);
}

/**
 * Compute deterministic factor scores for a car+variant combo
 */
function computeFactors(car: any, variant: any, input: PredictionInput, locationFactors: any, reviews: any, serviceNetwork: any) {
    const userCity = input.city || 'Bangalore';
    const dailyKm = Number(input.dailyDrivingKm) || 30;
    const maxBudget = Number(input.budgetMax) || Infinity;

    // Service Network (0-100)
    const brandCenters = serviceNetwork?.[car.brand]?.[userCity] ||
        serviceNetwork?.[userCity]?.[car.brand] ||
        BRAND_SERVICE_DEFAULT[car.brand] || 10;
    const serviceScore = Math.min(100, Math.round((brandCenters / 40) * 100));

    // Resale (0-100)
    const resaleScore = BRAND_RESALE[car.brand] || 70;

    // Running Cost / Mileage (0-100)
    const mileageNum = extractNumber(variant?.mileage) || 18;
    let runningCostScore = 75;
    if (variant?.fuelType === 'Electric') runningCostScore = 95;
    else if (variant?.fuelType === 'CNG') runningCostScore = 90;
    else if (mileageNum >= 25) runningCostScore = 95;
    else if (mileageNum >= 22) runningCostScore = 88;
    else if (mileageNum >= 18) runningCostScore = 80;
    else if (mileageNum >= 14) runningCostScore = 70;
    else runningCostScore = 60;

    // Safety (0-100) — brand-level + airbag count
    let safetyScore = BRAND_SAFETY[car.brand] || 74;
    const airbags = variant?.airbags || 2;
    if (airbags >= 6) safetyScore = Math.max(safetyScore, 90);
    else if (airbags >= 4) safetyScore = Math.max(safetyScore, 85);

    // Performance (0-100)
    let powerNum = extractNumber(variant?.power);
    let torqueNum = extractNumber(variant?.torque);
    if (powerNum === 0 && torqueNum === 0) {
        const ccMatch = variant?.engine?.match(/(\d+)/);
        const cc = ccMatch ? parseInt(ccMatch[1]) : 1200;
        powerNum = Math.round(cc * 0.08);
        torqueNum = Math.round(cc * 0.12);
    }
    let performanceScore = Math.min(98, Math.max(55, Math.round((powerNum * 0.6 + torqueNum * 0.4) / 160 * 85)));
    if (variant?.fuelType === 'Electric') performanceScore = Math.min(100, performanceScore + 15);

    // Reliability (0-100)
    const carReviews = reviews?.[car.id] || {};
    const reliabilityScore = Math.round((carReviews.reliability || 4.2) * 20);

    // User Reviews (0-100)
    const reviewScore = Math.round((car.overallRating || 4.2) * 20);

    // Value for Money (0-100)
    let vfmScore = Math.round((carReviews.valueForMoney || 4.1) * 20);
    const pMin = car.priceRange?.min ?? 0;
    if (pMin > maxBudget) {
        const overagePct = (pMin - maxBudget) / maxBudget;
        vfmScore = Math.max(40, vfmScore - Math.round(overagePct * 200));
    }

    // Running cost calculation
    const fuelType = variant?.fuelType || 'Petrol';
    const fuelRate = locationFactors?.fuelPrices?.[fuelType] || (fuelType === 'Diesel' ? 90 : fuelType === 'CNG' ? 85 : 102);
    const monthlyKm = dailyKm * 30;
    const monthlyFuel = fuelType === 'Electric'
        ? Math.round(monthlyKm * 1.3)
        : Math.round((monthlyKm / Math.max(8, mileageNum)) * fuelRate);
    const costPerKm = Number((monthlyFuel / monthlyKm + 0.95).toFixed(2));

    return {
        serviceScore, resaleScore, runningCostScore, safetyScore,
        performanceScore, reliabilityScore, reviewScore, vfmScore,
        mileageNum, powerNum, torqueNum, airbags, brandCenters,
        fuelType, monthlyFuel, costPerKm, mileage: variant?.mileage || `${mileageNum} kmpl`,
    };
}

/**
 * MAIN PREDICTION FUNCTION — Two-Stage Cascade
 */
export async function runPrediction(
    input: PredictionInput,
    cars: any[],
    locationFactors: any,
    reviews: any,
    serviceNetwork: any
): Promise<any[]> {
    const startTime = Date.now();

    // ═══════════════════════════════════════════════════
    // CHECK SEMANTIC CACHE
    // ═══════════════════════════════════════════════════
    const cacheKey = JSON.stringify({
        q: input.textQuery, b: input.budgetMax, f: input.fuelPreference,
        bt: input.bodyType, t: input.transmission, c: input.city,
    });
    const cached = queryCache.get(cacheKey);
    if (cached) {
        console.log(`[CACHE HIT] Returned in ${Date.now() - startTime}ms`);
        return cached;
    }

    // ═══════════════════════════════════════════════════
    // INITIALIZE/REFRESH SEMANTIC ENGINE (lazy singleton)
    // ═══════════════════════════════════════════════════
    if (!semanticEngine || cars.length !== lastCarCount) {
        console.log(`[SEMANTIC] Building TF-IDF index for ${cars.length} cars...`);
        semanticEngine = new SemanticSearchEngine(cars);
        lastCarCount = cars.length;
        console.log(`[SEMANTIC] Index built in ${Date.now() - startTime}ms`);
    }

    // ═══════════════════════════════════════════════════
    // DETECT PERSONA
    // ═══════════════════════════════════════════════════
    const persona = detectPersona(input);
    console.log(`[PERSONA] Detected: ${persona}`);

    // ═══════════════════════════════════════════════════
    // STAGE 1: HARD FILTER (deterministic, <1ms)
    // ═══════════════════════════════════════════════════
    let filteredCars = hardFilter(cars, input);
    console.log(`[STAGE 1] Hard filter: ${cars.length} → ${filteredCars.length} candidates`);

    // Fallback: if too restrictive, relax body type
    if (filteredCars.length < 3) {
        const relaxedInput = { ...input, bodyType: undefined };
        filteredCars = hardFilter(cars, relaxedInput);
        console.log(`[STAGE 1] Relaxed filter: ${filteredCars.length} candidates`);
    }
    // Fallback: if still too few, just use budget filter
    if (filteredCars.length < 3) {
        filteredCars = cars.filter(c => {
            const pMin = c.priceRange?.min ?? 0;
            return pMin <= (Number(input.budgetMax) || Infinity) * 1.15;
        });
    }
    if (filteredCars.length === 0) filteredCars = cars.slice(0, 15);

    // ═══════════════════════════════════════════════════
    // STAGE 2: SEMANTIC RANKING (TF-IDF cosine similarity)
    // ═══════════════════════════════════════════════════
    const queryText = input.textQuery || '';
    let semanticScores: Map<any, number> = new Map();

    if (queryText.length > 5) {
        // Get semantic ranking for all cars
        const semanticResults = semanticEngine.search(queryText, cars.length);
        for (const { car, score } of semanticResults) {
            semanticScores.set(car, score);
        }
    }

    // ═══════════════════════════════════════════════════
    // SCORE EACH CANDIDATE
    // ═══════════════════════════════════════════════════
    const jev = input.jevAnalysis || {};
    const ctx = input.contextSignals || {};

    const results = filteredCars.map(car => {
        const recommendedVariant = findBestVariant(car, input);
        const factors = computeFactors(car, recommendedVariant, input, locationFactors, reviews, serviceNetwork);

        // ─── Dynamic Weight Adjustment based on persona ───
        let w = { vfm: 0.18, service: 0.12, resale: 0.12, running: 0.14, safety: 0.12, perf: 0.08, reliability: 0.12, reviews: 0.06, comfort: 0.06 };

        if (persona === 'Family') {
            w.safety += 0.10; w.service += 0.05; w.perf -= 0.05; w.vfm -= 0.05; w.comfort += 0.05;
        } else if (persona === 'Enthusiast') {
            w.perf += 0.15; w.running -= 0.05; w.vfm -= 0.05; w.service -= 0.05;
        } else if (persona === 'Economy') {
            w.running += 0.12; w.vfm += 0.08; w.perf -= 0.08; w.resale -= 0.04; w.comfort -= 0.04; w.service -= 0.04;
        } else if (persona === 'Comfort') {
            w.comfort += 0.10; w.reliability += 0.05; w.perf -= 0.05; w.running -= 0.05; w.vfm -= 0.05;
        }

        // Priority-based fine-tuning
        if (input.priorities?.includes('safety')) { w.safety += 0.06; w.perf -= 0.03; w.vfm -= 0.03; }
        if (input.priorities?.includes('mileage')) { w.running += 0.06; w.perf -= 0.03; w.resale -= 0.03; }
        if (input.priorities?.includes('performance')) { w.perf += 0.08; w.running -= 0.04; w.vfm -= 0.04; }
        if (input.priorities?.includes('resaleValue')) { w.resale += 0.06; w.perf -= 0.03; }
        if (input.priorities?.includes('serviceNetwork')) { w.service += 0.06; w.vfm -= 0.03; }

        // ─── Deterministic Score (40%) ───
        const detScore = (
            factors.vfmScore * w.vfm +
            factors.serviceScore * w.service +
            factors.resaleScore * w.resale +
            factors.runningCostScore * w.running +
            factors.safetyScore * w.safety +
            factors.performanceScore * w.perf +
            factors.reliabilityScore * w.reliability +
            factors.reviewScore * w.reviews +
            factors.reviewScore * w.comfort // comfort approximated by user reviews
        );

        // ─── Semantic Score (35%) ───
        const rawSemantic = semanticScores.get(car) || 0;
        const semanticScore = rawSemantic * 100; // normalize 0-1 to 0-100

        // ─── Context Bonuses (25%) ───
        let contextBonus = 0;

        // Terrain-body alignment
        const terrainBonuses = TERRAIN_BODY_BONUS[ctx.terrain] || {};
        contextBonus += terrainBonuses[car.bodyType] || 0;

        // Climate-fuel alignment
        const climateBonuses = CLIMATE_FUEL_BONUS[ctx.climate] || {};
        contextBonus += climateBonuses[factors.fuelType] || 0;

        // JEV penalties for mismatch
        if (jev.wantsSUV && car.bodyType !== 'SUV') contextBonus -= 15;
        if (jev.wantsSafe && factors.safetyScore < 78) contextBonus -= 10;
        if (jev.wantsFast && factors.performanceScore < 72) contextBonus -= 10;
        if (jev.wantsEconomy && factors.runningCostScore < 78) contextBonus -= 10;
        if (jev.wantsCompact && car.bodyType === 'SUV') contextBonus -= 8;
        if (jev.wantsOffroad && car.bodyType !== 'SUV') contextBonus -= 12;

        // Preferred brand bonus
        if (input.preferredBrands?.some(b => car.brand.toLowerCase().includes(b))) {
            contextBonus += 12;
        }

        // Comparison car bonus: if user mentions a competitor, boost cars in the same segment/price
        if (input.comparisonCars?.length) {
            const compCar = cars.find(c => input.comparisonCars!.some(cn => c.name.toLowerCase().includes(cn)));
            if (compCar && car.segment === compCar.segment) contextBonus += 8;
        }

        // First car bonus for forgiving, easy-to-drive cars
        if (input.firstCar) {
            if (car.bodyType === 'Hatchback' || car.bodyType === 'Sedan') contextBonus += 5;
            if (factors.powerNum < 100) contextBonus += 3; // Not too powerful for a beginner
        }

        // Elderly passenger comfort bonus
        if (ctx.passengerProfile === 'elderly') {
            if (car.bodyType === 'SUV' || car.bodyType === 'MUV') contextBonus += 5; // Easy ingress
        }

        // ─── FINAL BLENDED SCORE ───
        const totalScore = (detScore * 0.40) + (semanticScore * 0.35) + ((70 + contextBonus) * 0.25);

        // Generate recommendation text
        const priorityText = input.priorities?.length ? `aligning with your priorities: ${input.priorities.join(', ')}` : 'providing an optimal ownership experience';
        const personaText = persona !== 'Balanced' ? ` Ideal for a ${persona}-oriented buyer.` : '';
        const whyRecommended = `The ${car.name} (${recommendedVariant?.name || 'Recommended Trim'}) scores ${Math.round(totalScore)}/100 for ${input.city || 'your city'} driving, ${priorityText}.${personaText} With ${factors.brandCenters} service centers nearby, ${recommendedVariant?.mileage || 'competitive'} fuel efficiency, and a ${factors.resaleScore}% resale retention — it's a strong contender.`;

        return {
            car,
            recommendedVariant,
            overallScore: Math.min(99, Math.max(60, Math.round(totalScore))),
            persona,
            semanticRelevance: Math.round(rawSemantic * 100),
            whyRecommended,
            keyHighlights: recommendedVariant?.keyHighlights || car.prosAndCons?.pros || ['Touchscreen Infotainment', 'Dual Airbags', 'Rear Parking Sensors'],
            specialFeatures: recommendedVariant?.features || [
                { name: 'Touchscreen Display', category: 'technology', isHighlight: true },
                { name: 'ABS with EBD', category: 'safety', isHighlight: true },
                { name: 'Automatic Climate Control', category: 'comfort', isHighlight: false },
            ],
            runningCost: {
                monthlyFuel: factors.monthlyFuel,
                costPerKm: factors.costPerKm,
                mileage: factors.mileage,
            },
            factors: {
                serviceNetwork: factors.serviceScore,
                resaleValue: factors.resaleScore,
                runningCost: factors.runningCostScore,
                safety: factors.safetyScore,
                performance: factors.performanceScore,
                engineLongevity: factors.reliabilityScore,
                userReviews: factors.reviewScore,
                valueForMoney: factors.vfmScore,
            },
            radarScores: {
                safety: Math.round(factors.safetyScore / 10),
                economy: Math.round(factors.runningCostScore / 10),
                performance: Math.round(factors.performanceScore / 10),
                comfort: Math.round(factors.reviewScore / 10),
                value: Math.round(factors.vfmScore / 10),
            },
        };
    });

    results.sort((a, b) => b.overallScore - a.overallScore);
    const topResults = results.slice(0, 8);

    // Cache the result
    queryCache.set(cacheKey, topResults);

    const elapsed = Date.now() - startTime;
    console.log(`[PREDICTION] Completed in ${elapsed}ms — Top result: ${topResults[0]?.car?.name} (${topResults[0]?.overallScore})`);

    return topResults;
}
