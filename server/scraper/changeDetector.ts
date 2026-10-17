import axios from 'axios';
import * as cheerio from 'cheerio';
import path from 'path';
import fs from 'fs';
import { runBackgroundScrape } from './backgroundManager';
import { dataStore } from '../dataStore';

const SERVER_ROOT = path.resolve(__dirname, '..');
const CARS_PATH = path.resolve(SERVER_ROOT, 'data', 'cars.json');

let detectorInterval: ReturnType<typeof setInterval> | null = null;
let isChecking = false;

// Track last known market signature to avoid redundant scraping
let lastMarketSignature = '';

/**
 * Probes Indian automotive news & price revision feeds for changes.
 * Checks for:
 * 1. Price revision announcements or discounts
 * 2. Newly launched production car models or variant introductions
 */
export async function checkForMarketChanges(): Promise<{ changed: boolean; reason?: string; models?: string[] }> {
    if (isChecking) return { changed: false, reason: 'Check already in progress' };
    isChecking = true;

    try {
        console.log('[ChangeDetector] Probing market for price revisions and new model launches...');
        
        // Probe ZigWheels / CarWale latest updates feed
        const feedUrl = 'https://www.zigwheels.com/newcars';
        const res = await axios.get(feedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
            },
            timeout: 12000
        });

        const $ = cheerio.load(res.data);
        const headlines: string[] = [];

        // Extract latest launch car titles and price highlights
        $('a.fnt-16, h2, h3, .gsc_col-xs-12 a').each((i, el) => {
            const text = $(el).text().replace(/\s+/g, ' ').trim();
            if (text.length > 5 && text.length < 80 && (
                text.toLowerCase().includes('lakh') || 
                text.toLowerCase().includes('launched') || 
                text.toLowerCase().includes('price') ||
                text.toLowerCase().includes('edition')
            )) {
                headlines.push(text);
            }
        });

        const currentSignature = headlines.slice(0, 15).join('|');

        if (!lastMarketSignature) {
            lastMarketSignature = currentSignature;
            console.log('[ChangeDetector] Baseline market signature established.');
            return { changed: false, reason: 'Initial baseline set' };
        }

        if (currentSignature && currentSignature !== lastMarketSignature) {
            console.log('[ChangeDetector] 🚨 Market change detected in live automotive feed!');
            lastMarketSignature = currentSignature;
            return { 
                changed: true, 
                reason: 'Price revision or model launch detected in automotive feed.',
                models: headlines.slice(0, 5)
            };
        }

        console.log('[ChangeDetector] Market check complete. All car models and pricing are up-to-date.');
        return { changed: false, reason: 'No new changes detected' };

    } catch (error: any) {
        console.warn('[ChangeDetector] Market probe warning (non-fatal):', error.message);
        return { changed: false, reason: error.message };
    } finally {
        isChecking = false;
    }
}

/**
 * Updates a single car's variants and live pricing on-demand without full re-scrape.
 */
export async function updateSingleCar(carNameOrId: string): Promise<{ success: boolean; carName?: string; variantsCount?: number; message?: string }> {
    try {
        const cars = dataStore.getCars();
        const norm = carNameOrId.toLowerCase().trim();
        const car = cars.find((c: any) => 
            c.id === norm || 
            c.name.toLowerCase() === norm ||
            c.name.toLowerCase().includes(norm)
        );

        if (!car) {
            return { success: false, message: `Car '${carNameOrId}' not found in database.` };
        }

        console.log(`[ChangeDetector] Triggering targeted live update for: ${car.name}...`);
        
        let model = car.name.replace(car.brand, '').trim().replace(/\s+/g, '-');
        if (car.brand === 'Maruti Suzuki') {
            model = car.name.replace('Maruti Suzuki', '').replace('Maruti', '').replace('Suzuki', '').trim().replace(/\s+/g, '-');
        } else if (car.brand === 'MG' && car.name.includes('MG ')) {
            model = car.name.replace('MG ', '').trim().replace(/\s+/g, '-');
        }
        
        const brandSlug = car.brand.replace(/\s+/g, '-');
        const zigwheelsUrl = `https://www.zigwheels.com/newcars/${brandSlug}/${model}`;

        const res = await axios.get(zigwheelsUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 10000
        });

        const $ = cheerio.load(res.data);
        const variants: any[] = [];

        $('tr').each((i, el) => {
            const txt = $(el).text().replace(/\s+/g, ' ').trim();
            if (txt.includes(' Lakh') || txt.includes(' Crore')) {
                const tds = $(el).find('td');
                if (tds.length >= 2) {
                    const text0 = $(tds[0]).text().replace(/\s+/g, ' ');
                    const priceText = $(tds[1]).text().replace(/\s+/g, ' ').trim();
                    
                    let name = $(tds[0]).find('a.modelName').text().trim() || text0.split(' . ')[0].trim();
                    if (name && !name.toLowerCase().includes('price in')) {
                        let cleanName = name.replace(car.brand, '').replace(car.name.replace(car.brand, '').trim(), '').trim() || 'Base';
                        
                        let mult = priceText.toLowerCase().includes('crore') ? 10000000 : 100000;
                        let match = priceText.match(/[\d.]+/);
                        let price = match ? Math.round(parseFloat(match[0]) * mult) : 0;

                        let fuel = 'Petrol';
                        if (text0.match(/diesel/i)) fuel = 'Diesel';
                        else if (text0.match(/cng/i)) fuel = 'CNG';
                        else if (text0.match(/electric|ev|battery/i)) fuel = 'Electric';

                        let trans = text0.match(/automatic|amt|cvt|dct/i) ? 'Automatic' : 'Manual';
                        let engine = car.engineCC ? (fuel === 'Electric' ? `${car.engineCC} kWh Battery` : `${car.engineCC} cc`) : 'Standard Engine';

                        variants.push({
                            id: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 6)}`,
                            name: cleanName,
                            engine,
                            fuelType: fuel,
                            transmission: trans,
                            priceExShowroom: price,
                            mileage: ''
                        });
                    }
                }
            }
        });

        if (variants.length > 0) {
            variants.sort((a, b) => a.priceExShowroom - b.priceExShowroom);
            car.variants = variants;
            car.priceRange = {
                min: variants[0].priceExShowroom,
                max: variants[variants.length - 1].priceExShowroom
            };
            car.scrapedAt = new Date().toISOString();

            // Save back to cars.json
            fs.writeFileSync(CARS_PATH, JSON.stringify(cars, null, 2), 'utf8');
            dataStore.reloadCars();

            console.log(`[ChangeDetector] Successfully updated ${variants.length} variants for ${car.name}.`);
            return { 
                success: true, 
                carName: car.name, 
                variantsCount: variants.length, 
                message: `Updated ${car.name} with ${variants.length} latest variants.` 
            };
        }

        return { success: false, message: `Could not parse new variants for ${car.name}.` };

    } catch (err: any) {
        console.error(`[ChangeDetector] Single car update failed for ${carNameOrId}:`, err.message);
        return { success: false, message: err.message };
    }
}

/**
 * Initializes continuous market change monitoring.
 * Default check every 60 minutes.
 */
export function startContinuousChangeDetector(intervalMinutes: number = 60) {
    if (detectorInterval) clearInterval(detectorInterval);

    console.log(`[ChangeDetector] ⚡ Continuous change detector active: Checking every ${intervalMinutes} minutes.`);

    // Run first check after 30 seconds
    setTimeout(async () => {
        const check = await checkForMarketChanges();
        if (check.changed) {
            console.log(`[ChangeDetector] Change detected on startup probe (${check.reason}). Activating live scraper...`);
            runBackgroundScrape(`Auto-Detected Change: ${check.reason}`);
        }
    }, 30000);

    // Schedule periodic interval
    detectorInterval = setInterval(async () => {
        const check = await checkForMarketChanges();
        if (check.changed) {
            console.log(`[ChangeDetector] Activating live scraper due to detected market change: ${check.reason}`);
            runBackgroundScrape(`Auto-Detected Change: ${check.reason}`);
        }
    }, intervalMinutes * 60 * 1000);
}
