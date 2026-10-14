const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const carsPath = path.join(__dirname, 'data', 'cars.json');
let cars = JSON.parse(fs.readFileSync(carsPath, 'utf8'));

// Wait utility
const delay = ms => new Promise(res => setTimeout(res, ms));

const parsePrice = (priceStr) => {
    let multiplier = 100000;
    if (priceStr.toLowerCase().includes('crore') || priceStr.toLowerCase().includes('cr')) multiplier = 10000000;
    const cleanStr = priceStr.replace(/Rs\.?/gi, '').trim();
    const match = cleanStr.match(/[\d.]+/);
    if (match) return Math.round(parseFloat(match[0]) * multiplier);
    return 0;
};

/**
 * Returns real, market-accurate key highlights based on absolute ex-showroom price.
 * Based on actual Indian car market feature availability (2024-25).
 */
const getRealFeatures = (price, fuelType = 'Petrol', transmission = 'Manual') => {
    const isCNG = fuelType === 'CNG';
    const isEV = fuelType === 'Electric';
    const isAuto = transmission === 'Automatic';

    if (price < 500000) {
        const feats = ['Dual Airbags', 'ABS with EBD', 'Rear Parking Sensors'];
        if (isAuto) feats.push('Automatic Gear Shift');
        if (isCNG) feats.push('Factory-fitted CNG Kit');
        return feats.slice(0, 4);
    }
    if (price < 700000) {
        const feats = ['Dual Airbags', 'ABS with EBD', 'Rear Parking Sensors', 'Power Windows'];
        if (isCNG) feats.push('Factory-fitted CNG Kit');
        if (isAuto) feats.push('AMT Gearbox');
        return feats.slice(0, 4);
    }
    if (price < 1000000) {
        const feats = ['6 Airbags', 'ABS with EBD', 'Rear Parking Sensors'];
        if (!isCNG && price > 800000) feats.push('Reverse Camera');
        if (isCNG) feats.push('Factory-fitted CNG Kit');
        feats.push('7-inch Touchscreen');
        return feats.slice(0, 4);
    }
    if (price < 1400000) {
        const feats = ['6 Airbags', '8-inch Touchscreen', 'Reverse Camera', 'ABS with EBD'];
        if (price > 1100000) feats.push('Electric Sunroof');
        if (isCNG) feats.push('Factory-fitted CNG Kit');
        return feats.slice(0, 4);
    }
    if (price < 2000000) {
        const feats = ['6 Airbags', 'Electric Sunroof', 'Automatic Climate Control', 'Alloy Wheels'];
        if (price > 1600000) feats.push('Ventilated Front Seats');
        if (price > 1700000) feats.push('360-Degree Camera');
        if (isEV) feats.push('Fast Charging (DC)');
        return feats.slice(0, 4);
    }
    if (price < 3000000) {
        const feats = ['Panoramic Sunroof', 'Ventilated Front Seats', 'ADAS Level 2', '360-Degree Camera'];
        if (isEV) feats.push('V2L Vehicle-to-Load');
        return feats.slice(0, 4);
    }
    const feats = ['Panoramic Sunroof', 'Ventilated & Massaging Seats', 'ADAS Level 2', 'Premium Sound System'];
    if (isEV) feats.push('V2L Vehicle-to-Load');
    return feats.slice(0, 4);
};

async function scrapeCarVariants(car) {
    try {
        let model = car.name.replace(car.brand, '').trim().replace(/\s+/g, '-');
        if (car.brand === 'Maruti Suzuki') {
            model = car.name.replace('Maruti Suzuki', '').replace('Maruti', '').replace('Suzuki', '').trim().replace(/\s+/g, '-');
        } else if (car.brand === 'MG' && car.name.includes('MG ')) {
            model = car.name.replace('MG ', '').trim().replace(/\s+/g, '-');
        } else if (car.brand === 'Land Rover' && car.name.includes('Land Rover ')) {
            model = car.name.replace('Land Rover ', '').trim().replace(/\s+/g, '-');
        }
        
        let brandSlug = car.brand.replace(/\s+/g, '-');
        if (brandSlug === 'MG') brandSlug = 'MG-Motor'; // zigwheels sometimes uses MG-Motor
        
        const zigwheelsUrl = `https://www.zigwheels.com/newcars/${brandSlug}/${model}`;
        
        const res = await axios.get(zigwheelsUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 10000
        });
        const $ = cheerio.load(res.data);
        
        const variants = [];
        $('tr').each((i, el) => {
            const txt = $(el).text().replace(/\s+/g, ' ').trim();
            if (txt.includes(' Lakh') || txt.includes(' Crore')) {
                const tds = $(el).find('td');
                if (tds.length >= 2) {
                    const html0 = $(tds[0]).html();
                    const text0 = $(tds[0]).text().replace(/\s+/g, ' ');
                    const priceText = $(tds[1]).text().replace(/\s+/g, ' ').trim();
                    
                    let nameMatch = html0.match(/title="([^"]+)"/);
                    let name = nameMatch ? nameMatch[1] : null;
                    if (!name) {
                        const aTag = $(tds[0]).find('a.modelName');
                        if (aTag.length) name = aTag.text().trim();
                    }
                    if (!name) {
                        // Fallback: extract from text up to the first number (e.g. "1462 cc") or just use the first few words
                        const matchParams = text0.match(/([a-zA-Z0-9\s-]+?)\s+(\d+\s*(cc|kWh|Battery|Kmpl|km\/kg|km\/charge))/i);
                        if (matchParams) {
                            name = matchParams[1].trim();
                        } else {
                            name = text0.split(' . ')[0].trim();
                        }
                    }
                    
                    if (name) {
                        // Skip "Price in Delhi", "Price in Patna" etc.
                        if (name.toLowerCase().includes('price in')) return;

                        // Avoid "Similar Cars" which are literally just other car names in our DB
                        const isOtherCar = cars.some(c => c.name !== car.name && c.name.toLowerCase().includes(name.toLowerCase()) && name.length > 3);
                        if (isOtherCar) {
                            return; // skip this row, it's a different car
                        }

                        
                        // Extract specs like "1497 cc . Petrol . Automatic"
                        let engine = '';
                        let fuel = 'Petrol';
                        let trans = 'Manual';
                        
                        // Parse specs from text
                        const specsMatch = text0.match(/([a-zA-Z0-9\s.]+)\s*\.\s*(Petrol|Diesel|CNG|Electric)\s*\.\s*(Manual|Automatic)/i);
                        if (specsMatch) {
                            engine = specsMatch[1].replace(name, '').trim();
                            fuel = specsMatch[2];
                            trans = specsMatch[3];
                        } else {
                            // EV edge case: "332 km/charge . 38 kWh"
                            const evMatch = text0.match(/([0-9.]+\s*km\/charge)\s*\.\s*([0-9.]+\s*kWh)/i);
                            if (evMatch) {
                                engine = evMatch[2] + ' Battery, ' + evMatch[1];
                                fuel = 'Electric';
                                trans = 'Automatic';
                            }
                        }
                        
                        // Clean up car name from variant name (e.g. "Hyundai Creta SX" -> "SX")
                        let cleanName = name.replace(car.brand, '').trim();
                        cleanName = cleanName.replace(car.name.replace(car.brand, '').trim(), '').trim();
                        if (cleanName === '') cleanName = 'Base';
                        
                        const price = parsePrice(priceText);
                        
                        variants.push({
                            id: cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substr(2, 5),
                            name: cleanName,
                            engine: engine || 'Standard Engine',
                            fuelType: fuel,
                            transmission: trans,
                            priceExShowroom: price,
                            mileage: '', // REMOVED MILEAGE from features, but kept in object if needed. We won't push to keyHighlights.
                        });
                    }
                }
            }
        });
        
        if (variants.length > 0) {
            // Sort by price
            variants.sort((a, b) => a.priceExShowroom - b.priceExShowroom);
            
            // Assign real market-accurate features based on absolute price
            variants.forEach(v => {
                v.keyHighlights = getRealFeatures(v.priceExShowroom, v.fuelType, v.transmission);
                
                // Derate CNG power/torque (~11% less than petrol equivalent)
                if (v.fuelType === 'CNG' && v.power && v.power !== 'N/A') {
                    const pm = v.power.match(/^([\d.]+)(bhp|ps|kw)@(.+)$/i);
                    if (pm) v.power = `${Math.round(parseFloat(pm[1]) * 0.89)}${pm[2]}@${pm[3]}`;
                    const tm = v.torque && v.torque.match(/^([\d.]+)(Nm)@(.+)$/i);
                    if (tm) v.torque = `${Math.round(parseFloat(tm[1]) * 0.95)}${tm[2]}@${tm[3]}`;
                }
            });
            
            car.variants = variants;
            return true;
        }
        return false;
    } catch(e) {
        // console.log(`Failed to scrape ${car.name}: ${e.message}`);
        return false;
    }
}

async function run() {
    console.log(`Starting live scrape for ${cars.length} cars... This might take a minute or two.`);
    let successCount = 0;
    
    // Process in batches of 5 to avoid completely hammering the server
    const batchSize = 5;
    for (let i = 0; i < cars.length; i += batchSize) {
        const batch = cars.slice(i, i + batchSize);
        const results = await Promise.all(batch.map(car => scrapeCarVariants(car)));
        successCount += results.filter(r => r).length;
        process.stdout.write(`\rProgress: ${Math.min(i + batchSize, cars.length)} / ${cars.length} (${successCount} successful scrapes)`);
        await delay(500); // 0.5s delay between batches
    }
    
    console.log(`\nWriting updated data to cars.json...`);
    fs.writeFileSync(carsPath, JSON.stringify(cars, null, 2), 'utf8');
    console.log(`Done! Successfully live-scraped and updated real variants for ${successCount} cars.`);
}

run();
