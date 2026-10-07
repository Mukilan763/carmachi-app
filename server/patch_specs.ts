import * as fs from 'fs';
import * as path from 'path';

const dbPath = path.join(__dirname, 'data', 'cars.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const turboCandidates = ['Hyundai Creta', 'Kia Seltos', 'Hyundai Venue', 'Kia Sonet', 'Tata Nexon', 'Volkswagen Taigun', 'Skoda Kushaq', 'Renault Kiger', 'Nissan Magnite', 'Mahindra XUV300', 'Hyundai Verna', 'Skoda Slavia', 'Volkswagen Virtus'];

for (const car of db) {
    if (turboCandidates.includes(car.name)) {
        // Find petrol variants
        const petrolVariants = car.variants.filter((v: any) => v.fuelType === 'Petrol' && !v.name.includes('Turbo'));
        for (const pv of petrolVariants) {
            // Duplicate to create a turbo variant
            const turboVariant = JSON.parse(JSON.stringify(pv));
            turboVariant.id = turboVariant.id + '-turbo';
            turboVariant.name = 'Turbo ' + turboVariant.name;
            turboVariant.power = (parseInt(turboVariant.power) + 25) + ' bhp'; // bump power
            turboVariant.torque = (parseInt(turboVariant.torque) + 50) + ' Nm'; // bump torque
            turboVariant.priceExShowroom += 120000; // Turbo premium
            turboVariant.keyHighlights.push('Turbocharged Engine');
            
            // Add to car
            car.variants.push(turboVariant);
        }
    }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Successfully injected Turbo engine options!');
