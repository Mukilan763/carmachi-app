import fs from 'fs';
import path from 'path';

export interface LocationFactors {
    city: string;
    state: string;
    tier: number;
    terrain: string;
    trafficDensity: string;
    climate: string;
    fuelPrices: Record<string, number>;
    electricityRate: number;
}

const readJson = (filename: string) => {
    try {
        const p = path.resolve(__dirname, `../data/${filename}`);
        if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
        const fallback = path.join(process.cwd(), 'server', 'data', filename);
        if (fs.existsSync(fallback)) return JSON.parse(fs.readFileSync(fallback, 'utf-8'));
    } catch (e) {
        console.error(`Error reading ${filename}:`, e);
    }
    return null;
};

export function getLocationFactors(city: string, state?: string): LocationFactors {
    const cities: any[] = readJson('cities.json') || [];
    const fuelPrices: Record<string, any> = readJson('fuelPrices.json') || {};

    // Find city data (case-insensitive)
    const cityData = cities.find(
        c => c.name.toLowerCase() === city.toLowerCase()
    );

    const resolvedState = state || cityData?.state || 'Maharashtra';
    const stateFuel = fuelPrices[resolvedState] || fuelPrices['Maharashtra'] || { petrol: 102.0, diesel: 90.0, cng: 82.0 };

    return {
        city: cityData?.name || city,
        state: resolvedState,
        tier: cityData?.tier || 2,
        terrain: cityData?.terrain || 'flat',
        trafficDensity: cityData?.trafficDensity || 'moderate',
        climate: cityData?.climateType || 'moderate',
        fuelPrices: {
            Petrol: stateFuel.petrol || 102.0,
            Diesel: stateFuel.diesel || 90.0,
            CNG: stateFuel.cng || 82.0
        },
        electricityRate: cityData?.electricityRate || 8.0
    };
}
