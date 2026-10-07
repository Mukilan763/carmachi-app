import axios from 'axios';
import * as cheerio from 'cheerio';

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-IN,en;q=0.5',
};

async function testSpecsPage() {
    // Test ZigWheels specs page
    const url = 'https://www.zigwheels.com/newcars/Tata/Nexon/specifications';
    console.log('Fetching:', url);
    try {
        const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        const $ = cheerio.load(res.data);
        console.log('Title:', $('title').text());
        console.log('Page size:', res.data.length);

        // Check for specs table
        $('table').each((i, el) => {
            const caption = $(el).find('caption, thead th').first().text().trim();
            console.log(`\nTable ${i}: ${caption || 'No caption'}`);
            $(el).find('tr').slice(0, 5).each((_, tr) => {
                const cells = $(tr).find('td, th').map((__, c) => $(c).text().trim()).get();
                if (cells.length > 0) console.log('  ', cells.join(' | '));
            });
        });
        
        // Check for spec sections / divs
        const specSections: string[] = [];
        $('[class*="spec"], [class*="Spec"], [id*="spec"]').each((i, el) => {
            if (i < 3) specSections.push($(el).text().trim().substring(0, 200));
        });
        if (specSections.length > 0) {
            console.log('\n--- Spec sections found ---');
            specSections.forEach(s => console.log(s));
        }

        // Check JSON-LD for more detailed data
        $('script[type="application/ld+json"]').each((i, el) => {
            try {
                const json = JSON.parse($(el).text());
                if (json['@type'] === 'Car' || json['@type'] === 'Product') {
                    // Look for engine, dimensions, etc.
                    console.log('\n--- JSON-LD Data ---');
                    const keys = Object.keys(json);
                    keys.forEach(k => {
                        const val = json[k];
                        if (typeof val === 'string' || typeof val === 'number') {
                            console.log(`  ${k}: ${val}`);
                        } else if (typeof val === 'object' && !Array.isArray(val)) {
                            console.log(`  ${k}: ${JSON.stringify(val)}`);
                        }
                    });
                }
            } catch {}
        });

        // Also check for variant tables (price list usually has all variants)
        const variantUrl = 'https://www.zigwheels.com/newcars/Tata/Nexon/price';
        console.log('\n\nFetching variants page:', variantUrl);
        const varRes = await axios.get(variantUrl, { headers: HEADERS, timeout: 15000 });
        const $v = cheerio.load(varRes.data);
        console.log('Variants page size:', varRes.data.length);

        // Look for variant JSON-LD
        $v('script[type="application/ld+json"]').each((i, el) => {
            try {
                const json = JSON.parse($v(el).text());
                if (json.offers || json['@type'] === 'Car') {
                    console.log('\n--- Variants JSON-LD ---');
                    if (json.offers) {
                        const offers = Array.isArray(json.offers) ? json.offers : [json.offers];
                        console.log(`Found ${offers.length} offers/variants`);
                        offers.slice(0, 3).forEach((o: any, i: number) => {
                            console.log(`  Variant ${i}: ${JSON.stringify(o).substring(0, 300)}`);
                        });
                    }
                }
            } catch {}
        });

    } catch (e: any) {
        console.log('Failed:', e.message);
    }
}

testSpecsPage();
