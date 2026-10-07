const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const carsPath = path.join(__dirname, '../data/cars.json');
let cars = [];
if (fs.existsSync(carsPath)) {
    cars = JSON.parse(fs.readFileSync(carsPath, 'utf8'));
}

const BRANDS = [
    'maruti-suzuki', 'hyundai', 'tata', 'mahindra', 'toyota', 
    'kia', 'honda', 'mg', 'skoda', 'volkswagen', 'renault', 'nissan'
];

const delay = ms => new Promise(res => setTimeout(res, ms));

async function discoverCars() {
    console.log('[Discovery] Scanning for newly launched cars...');
    let addedCount = 0;

    for (const brand of BRANDS) {
        try {
            console.log(`[Discovery] Scanning brand: ${brand}`);
            const url = `https://www.carwale.com/${brand}-cars/`;
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            
            // Typical CarWale structure for car listings
            $('h3').each((i, el) => {
                const title = $(el).text().trim();
                // Filter out non-car headings
                if (!title || title.length < 4 || title.includes('?') || title.toLowerCase().includes('upcoming')) return;
                
                // Check if we already have it
                const normalizedTitle = title.toLowerCase();
                const exists = cars.some(c => c.name.toLowerCase() === normalizedTitle || normalizedTitle.includes(c.name.toLowerCase()));
                
                if (!exists) {
                    // Make sure it contains the brand name (basic validation)
                    const brandFormatted = brand.replace('-', ' ');
                    if (normalizedTitle.includes(brandFormatted) || title.split(' ').length >= 2) {
                        
                        let displayBrand = brandFormatted.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                        if (displayBrand === 'Mg') displayBrand = 'MG';
                        
                        // Infer body type roughly
                        let bodyType = 'SUV';
                        if (normalizedTitle.includes('sedan') || normalizedTitle.includes('dzire') || normalizedTitle.includes('city') || normalizedTitle.includes('slavia') || normalizedTitle.includes('virtus')) bodyType = 'Sedan';
                        else if (normalizedTitle.includes('hatchback') || normalizedTitle.includes('swift') || normalizedTitle.includes('i20') || normalizedTitle.includes('alto') || normalizedTitle.includes('tiago')) bodyType = 'Hatchback';

                        const newCar = {
                            id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                            name: title,
                            brand: displayBrand,
                            bodyType: bodyType,
                            priceRange: { min: 700000, max: 1500000 }, // Will be overwritten by Phase 1
                            images: [],
                            variants: [],
                            description: `The newly discovered ${title} by ${displayBrand}.`,
                            overallRating: 4.5,
                            scrapedAt: new Date().toISOString()
                        };

                        cars.push(newCar);
                        addedCount++;
                        console.log(`[Discovery] Found NEW car: ${title}`);
                    }
                }
            });

            await delay(1500 + Math.random() * 1000);
        } catch (error) {
            console.error(`[Discovery] Failed to scan ${brand}:`, error.message);
        }
    }

    if (addedCount > 0) {
        fs.writeFileSync(carsPath, JSON.stringify(cars, null, 2));
        console.log(`[Discovery] Successfully added ${addedCount} new cars to database!`);
    } else {
        console.log('[Discovery] No new cars found. Database is up to date.');
    }
}

discoverCars();
