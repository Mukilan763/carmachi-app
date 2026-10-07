const fs = require('fs');
const path = require('path');

const carsPath = path.join(__dirname, 'data', 'cars.json');
let cars = JSON.parse(fs.readFileSync(carsPath, 'utf8'));

let totalRemoved = 0;
cars.forEach(car => {
    if (!car.variants) return;
    const before = car.variants.length;
    car.variants = car.variants.filter(v => {
        const n = (v.name || '').toLowerCase();
        return !n.includes('price in') && !n.includes('most expensive') && !n.includes('lowest price');
    });
    totalRemoved += before - car.variants.length;

    // Recalculate priceRange from clean variants
    const prices = car.variants.map(v => v.priceExShowroom).filter(p => p && p > 0);
    if (prices.length > 0) {
        car.priceRange = { min: Math.min(...prices), max: Math.max(...prices) };
    }
});

fs.writeFileSync(carsPath, JSON.stringify(cars, null, 2), 'utf8');
console.log(`Done! Removed ${totalRemoved} fake "Price in [city]" variants from cars.json.`);
