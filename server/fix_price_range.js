const fs = require('fs');
const path = require('path');

const carsPath = path.join(__dirname, 'data', 'cars.json');
let cars = JSON.parse(fs.readFileSync(carsPath, 'utf8'));

cars.forEach(car => {
    if (car.variants && car.variants.length > 0) {
        // filter out valid prices
        const prices = car.variants
            .map(v => v.priceExShowroom)
            .filter(p => p && typeof p === 'number' && p > 0);
            
        if (prices.length > 0) {
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            car.priceRange = { min, max };
        }
    }
});

fs.writeFileSync(carsPath, JSON.stringify(cars, null, 2), 'utf8');
console.log('Fixed priceRange for all cars based on variant prices!');
