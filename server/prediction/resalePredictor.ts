import fs from 'fs';
import path from 'path';

export interface ResaleResult {
    estimatedResaleValue: number;
    depreciationPercentage: number;
    range: [number, number];
    originalPrice: number;
    yearsOld: number;
    brandMultiplier: number;
    segmentRetention: number;
    cityFactor: number;
    tips: string[];
}

export interface DepreciationPoint {
    year: number;
    value: number;
    percentage: number;
}

const getResaleData = () => {
    try {
        const p = path.resolve(__dirname, '../data/resaleFactors.json');
        if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
        const fallback = path.join(process.cwd(), 'server', 'data', 'resaleFactors.json');
        if (fs.existsSync(fallback)) return JSON.parse(fs.readFileSync(fallback, 'utf-8'));
    } catch (e) {
        console.error("Error reading resaleFactors.json:", e);
    }
    return null;
};

export function predictResaleValue(
    originalPrice: number, 
    brand: string, 
    segment: string, 
    fuelType: string, 
    city: string, 
    yearsOld: number,
    kilometersDriven?: number,
    condition?: string
): ResaleResult {
    const factors = getResaleData();
    const brandMultipliers = factors?.brandMultipliers || {};
    const segmentRetention = factors?.segmentRetention || {};
    const fuelTypeAdjustment = factors?.fuelTypeAdjustment || {};
    const cityDemandFactor = factors?.cityDemandFactor || {};

    const brandMul = brandMultipliers[brand] || 1.0;
    
    // Segment base retention at year 1, 2, 3, 5
    const seg = segmentRetention[segment] || segmentRetention['SUV'] || { year1: 85, year2: 75, year3: 66, year5: 50 };
    
    let baseRetention = 100;
    if (yearsOld <= 1) {
        baseRetention = seg.year1;
    } else if (yearsOld <= 2) {
        baseRetention = seg.year2;
    } else if (yearsOld <= 3) {
        baseRetention = seg.year3;
    } else if (yearsOld <= 5) {
        baseRetention = seg.year5;
    } else {
        baseRetention = Math.max(20, seg.year5 - (yearsOld - 5) * 6);
    }

    // Fuel adjustment
    const fuelAdj = fuelTypeAdjustment[fuelType] || 1.0;

    // City demand factor
    const cityFac = cityDemandFactor[city] || 1.0;

    // Condition adjustment
    let conditionMul = 1.0;
    if (condition === 'Excellent') conditionMul = 1.05;
    else if (condition === 'Good') conditionMul = 1.0;
    else if (condition === 'Average') conditionMul = 0.93;
    else if (condition === 'Below Average' || condition === 'Poor') conditionMul = 0.85;

    // Kilometer adjustment: typical is 12,000 km/year in India
    let kmMul = 1.0;
    if (kilometersDriven && yearsOld > 0) {
        const expectedKm = yearsOld * 12000;
        const diffKm = kilometersDriven - expectedKm;
        if (diffKm > 0) {
            kmMul = Math.max(0.85, 1 - (diffKm / 100000) * 0.08);
        } else {
            kmMul = Math.min(1.06, 1 + (Math.abs(diffKm) / 50000) * 0.04);
        }
    }

    // Final effective retention percentage
    let effectiveRetention = (baseRetention / 100) * brandMul * fuelAdj * cityFac * conditionMul * kmMul;
    effectiveRetention = Math.min(0.96, Math.max(0.15, effectiveRetention));

    const estimatedResaleValue = Math.round(originalPrice * effectiveRetention);
    const depreciationPercentage = Math.round((1 - effectiveRetention) * 100);

    const tips = [
        "Maintain documented service stamps at authorized dealerships to protect up to 10% value.",
        `In ${city || 'metro cities'}, cars with spotless service records and original paint command a premium.`,
        fuelType === 'Diesel' ? "Ensure periodic DPF cleaning and emissions certifications are up to date." : "Regular oil changes and throttle body cleaning keep engine compression high.",
        "Fix minor dents and paint scratches before listing for sale to improve first impression."
    ];

    return {
        estimatedResaleValue,
        depreciationPercentage,
        range: [Math.round(estimatedResaleValue * 0.94), Math.round(estimatedResaleValue * 1.06)],
        originalPrice,
        yearsOld,
        brandMultiplier: brandMul,
        segmentRetention: baseRetention,
        cityFactor: cityFac,
        tips
    };
}

export function getDepreciationCurve(
    originalPrice: number, 
    brand: string, 
    segment: string, 
    fuelType: string, 
    city: string
): DepreciationPoint[] {
    const curve: DepreciationPoint[] = [];
    for (let yr = 1; yr <= 7; yr++) {
        const res = predictResaleValue(originalPrice, brand, segment, fuelType, city, yr);
        curve.push({
            year: yr,
            value: res.estimatedResaleValue,
            percentage: 100 - res.depreciationPercentage
        });
    }
    return curve;
}
