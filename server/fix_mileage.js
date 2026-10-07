const fs = require('fs');
const path = require('path');

const carsPath = path.join(__dirname, 'data', 'cars.json');
const cars = JSON.parse(fs.readFileSync(carsPath, 'utf8'));

cars.forEach(car => {
    if (car.variants) {
        car.variants.forEach(v => {
            if (v.mileage && v.mileage !== 'N/A') {
                const match = v.mileage.match(/([0-9.]+)\s*(kmpl|km\/kg|km\/charge)/i);
                if (match) {
                    v.mileage = match[0];
                }
            }
        });
    }
});

fs.writeFileSync(carsPath, JSON.stringify(cars, null, 2), 'utf8');
console.log('Fixed mileage exact formats.');
