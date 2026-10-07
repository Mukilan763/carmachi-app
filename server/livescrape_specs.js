const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const carsPath = path.join(__dirname, 'data', 'cars.json');
let cars = JSON.parse(fs.readFileSync(carsPath, 'utf8'));

const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Build a URL slug for a car for ZigWheels
 */
function getSlug(car) {
    let model = car.name.replace(car.brand, '').trim().replace(/\s+/g, '-');
    if (car.brand === 'Maruti Suzuki') {
        model = car.name.replace('Maruti Suzuki', '').replace('Maruti', '').replace('Suzuki', '').trim().replace(/\s+/g, '-');
    } else if (car.brand === 'MG') {
        model = car.name.replace('MG ', '').trim().replace(/\s+/g, '-');
    } else if (car.brand === 'Land Rover') {
        model = car.name.replace('Land Rover ', '').trim().replace(/\s+/g, '-');
    }

    let brandSlug = car.brand.replace(/\s+/g, '-');
    if (brandSlug === 'MG') brandSlug = 'MG-Motor';

    return { brandSlug, model };
}

/**
 * Scrape the /specifications page and return a map of:
 *   { "1497 cc": { power, torque, mileage }, "1493 cc": { power, torque, mileage }, ... }
 * Also returns fallback { power, torque, mileage, battery, evRange } for the whole car.
 */
async function scrapeSpecsMap(car) {
    try {
        const { brandSlug, model } = getSlug(car);
        const url = `https://www.zigwheels.com/newcars/${brandSlug}/${model}/specifications`;

        const res = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
            timeout: 12000
        });

        const $ = cheerio.load(res.data);

        // We read spec rows sequentially. Each new "Engine Displacement" row starts a new engine block.
        // We accumulate power/torque/mileage from the rows above each displacement row.

        const engineSpecs = []; // Array of { cc, power, torque, mileage, fuelType }
        let fallback = { power: null, torque: null, mileage: null, battery: null, evRange: null };

        let curPower = null, curTorque = null, curMileage = null, curFuel = null;

        $('table tr').each((i, el) => {
            const cells = $(el).find('td');
            if (cells.length < 2) return;
            const key = $(cells[0]).text().trim().toLowerCase();
            const val = $(cells[1]).text().trim();
            if (!val) return;

            if (key.includes('max power')) {
                curPower = val;
                if (!fallback.power) fallback.power = val;
            }
            if (key.includes('max torque')) {
                curTorque = val;
                if (!fallback.torque) fallback.torque = val;
            }
            if (key === 'fuel type') { // Strict match for fuel type to avoid catching "secondary fuel type" unless needed
                curFuel = val;
            } else if (key === 'secondary fuel type' && val.toLowerCase() === 'cng') {
                curFuel = 'CNG';
            } else if (key.includes('fuel type') && val.toLowerCase().includes('cng')) {
                curFuel = 'CNG';
            } else if (key.includes('fuel type') && !curFuel) {
                curFuel = val;
            }

            if (key.includes('mileage') || key.includes('fuel efficiency') || key.includes('range (arai)')) {
                if (val.toLowerCase().includes('km/charge') || val.toLowerCase().includes('km range')) {
                    fallback.evRange = val;
                } else {
                    curMileage = val;
                    if (!fallback.mileage) fallback.mileage = val;
                }
            }
            if (key.includes('battery capacity')) {
                fallback.battery = val;
            }
            if (key === 'engine displacement' || key === 'displacement') {
                if (val && val !== 'N/A') {
                    engineSpecs.push({
                        cc: val,
                        power: curPower,
                        torque: curTorque,
                        mileage: curMileage,
                        fuelType: curFuel,
                    });
                }
                curPower = null; curTorque = null; curMileage = null; curFuel = null;
            }
        });

        // Second pass: fill in missing fields for the most recently pushed spec for that cc
        curPower = null; curTorque = null; curMileage = null; curFuel = null;
        let lastSpecIndex = -1;
        
        $('table tr').each((i, el) => {
            const cells = $(el).find('td');
            if (cells.length < 2) return;
            const key = $(cells[0]).text().trim().toLowerCase();
            const val = $(cells[1]).text().trim();
            if (!val) return;

            if (key === 'engine displacement' || key === 'displacement') {
                // Find the spec block corresponding to this row (in order)
                lastSpecIndex++;
            }
            
            if (lastSpecIndex >= 0 && lastSpecIndex < engineSpecs.length) {
                const spec = engineSpecs[lastSpecIndex];
                
                if (key.includes('max power') && !spec.power) spec.power = val;
                if (key.includes('max torque') && !spec.torque) spec.torque = val;
                if ((key.includes('mileage') || key.includes('fuel efficiency')) && !spec.mileage) spec.mileage = val;
                
                if (key === 'fuel type' && !spec.fuelType) spec.fuelType = val;
                if (key === 'secondary fuel type' && val.toLowerCase() === 'cng') spec.fuelType = 'CNG';
                if (key.includes('fuel type') && val.toLowerCase().includes('cng')) spec.fuelType = 'CNG';
            }
        });

        return { engineSpecs, fallback };
    } catch (e) {
        return null;
    }
}

/**
 * Find matching spec from the array
 */
function findSpecForEngine(engineStr, engineSpecs, variantFuelType) {
    if (!engineStr) return null;

    let bestMatch = null;
    
    // Attempt extracting CC
    const ccMatch = engineStr.match(/(\d{3,4}(?:\.\d+)?\s*cc)/i);
    if (ccMatch) {
        const cc = ccMatch[1].trim();
        const ccNum = cc.replace(' cc', '').trim();
        
        // Filter specs that match this CC
        const matchingSpecs = engineSpecs.filter(s => s.cc.includes(ccNum));
        
        if (matchingSpecs.length > 0) {
            // Prefer the one that matches fuelType
            bestMatch = matchingSpecs.find(s => {
                if (!s.fuelType || !variantFuelType) return false;
                // e.g. "CNG" matches "CNG"
                return s.fuelType.toLowerCase().includes(variantFuelType.toLowerCase()) || 
                       variantFuelType.toLowerCase().includes(s.fuelType.toLowerCase());
            });
            
            // If no exact fuel match, just take the first one with matching CC
            if (!bestMatch) {
                bestMatch = matchingSpecs[0];
            }
        }
    }

    // kWh match for EVs
    if (!bestMatch) {
        const kwhMatch = engineStr.match(/(\d+(?:\.\d+)?\s*kWh)/i);
        if (kwhMatch) {
            const kwh = kwhMatch[1].trim();
            bestMatch = engineSpecs.find(s => s.cc && s.cc.toLowerCase().includes(kwh.toLowerCase()));
        }
    }

    return bestMatch;
}

async function processcar(car) {
    const result = await scrapeSpecsMap(car);
    if (!result) return false;

    const { engineSpecs, fallback } = result;

    // Update root car fields with the first available spec
    if (fallback.power) car.power = fallback.power;
    if (fallback.torque) car.torque = fallback.torque;
    if (fallback.mileage) car.mileage = fallback.mileage;
    if (fallback.evRange) car.evRange = fallback.evRange;

    if (car.variants) {
        car.variants.forEach(v => {
            // Match this variant to the correct engine spec block
            const spec = findSpecForEngine(v.engine, engineSpecs, v.fuelType);

            if (spec) {
                if (spec.power) v.power = spec.power;
                if (spec.torque) v.torque = spec.torque;
                // Only update mileage if not already set from variant scrape
                if (spec.mileage && (!v.mileage || v.mileage === 'N/A')) v.mileage = spec.mileage;
            } else {
                // Use car-level fallback if variant has no specific match
                if (!v.power || v.power === 'N/A') v.power = fallback.power || 'N/A';
                if (!v.torque || v.torque === 'N/A') v.torque = fallback.torque || 'N/A';
                if ((!v.mileage || v.mileage === 'N/A') && fallback.mileage) v.mileage = fallback.mileage;
            }

            // Fix engine string if it has junk prefix (e.g. "Disl 1493 cc" → "1493 cc")
            if (v.engine) {
                const ccMatch = v.engine.match(/(\d{3,4}(?:\.\d+)?\s*cc)/i);
                if (ccMatch && v.engine !== ccMatch[1].trim()) {
                    v.engine = ccMatch[1].trim();
                }
                const kwhMatch = v.engine.match(/(\d+(?:\.\d+)?\s*kWh)/i);
                if (kwhMatch && !v.engine.match(/^\d/)) {
                    v.engine = kwhMatch[1].trim() + ' Battery';
                }
            }

            // EV range as mileage
            if (v.fuelType === 'Electric' && fallback.evRange && (!v.mileage || v.mileage === 'N/A')) {
                v.mileage = fallback.evRange;
            }
            // EV battery as engine
            if (v.fuelType === 'Electric' && fallback.battery && (!v.engine || !v.engine.includes('kWh'))) {
                v.engine = `${fallback.battery} Battery`;
            }
        });
    }

    return true;
}

async function run() {
    console.log(`\n🔍 Smart per-engine specs scrape for ${cars.length} cars...\n`);
    let successCount = 0;

    const batchSize = 8;
    for (let i = 0; i < cars.length; i += batchSize) {
        const batch = cars.slice(i, i + batchSize);
        const results = await Promise.all(batch.map(car => processcar(car)));
        successCount += results.filter(r => r).length;
        process.stdout.write(`\rProgress: ${Math.min(i + batchSize, cars.length)} / ${cars.length}  (${successCount} scraped)`);
        await delay(400);
    }

    console.log(`\n\nWriting updated data to cars.json...`);
    fs.writeFileSync(carsPath, JSON.stringify(cars, null, 2), 'utf8');
    console.log(`✅ Done! Per-engine power/torque corrected for ${successCount} cars.`);
}

run();
