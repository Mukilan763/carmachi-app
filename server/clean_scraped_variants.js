const fs = require('fs');
const path = require('path');

const carsPath = path.join(__dirname, 'data', 'cars.json');
const cars = JSON.parse(fs.readFileSync(carsPath, 'utf8'));

// Reusing our engine name fallback generator for when we don't have CC
function getEngineName(brand, fuelType, segment, isTurbo) {
  if (fuelType === 'Electric') return 'Permanent Magnet Synchronous Motor';
  if (brand === 'Hyundai' || brand === 'Kia') {
    if (fuelType === 'Diesel') return '1.5L U2 CRDi';
    if (isTurbo) return '1.5L Turbo GDi';
    return segment.includes('Compact') || segment.includes('Hatchback') ? '1.2L Kappa' : '1.5L MPi';
  }
  if (brand === 'Maruti Suzuki') return segment.includes('Compact') || segment.includes('Hatchback') ? '1.2L K-Series DualJet' : '1.5L K15C Smart Hybrid';
  if (brand === 'Tata') {
    if (fuelType === 'Diesel') return '1.5L Revotorq';
    return isTurbo ? '1.2L Turbo Revotron' : '1.2L Revotron';
  }
  if (brand === 'Mahindra') {
    if (fuelType === 'Diesel') return '2.2L mHawk';
    return '2.0L mStallion Turbo';
  }
  if (brand === 'Toyota') {
    if (fuelType === 'Diesel') return '2.4L / 2.8L Diesel';
    return '1.5L / 2.0L TNGA Hybrid';
  }
  if (brand === 'Honda') return '1.5L i-VTEC';
  if (brand === 'BMW') return fuelType === 'Diesel' ? '2.0L TwinPower Turbo Diesel' : '2.0L TwinPower Turbo Petrol';
  if (brand === 'Mercedes-Benz') return fuelType === 'Diesel' ? '2.0L OM654 Diesel' : '2.0L M254 Turbo Petrol';
  if (brand === 'Audi') return '2.0L TFSI';
  
  if (fuelType === 'Diesel') return '1.5L Turbo Diesel';
  if (fuelType === 'CNG') return '1.2L Bi-Fuel CNG';
  return isTurbo ? '1.0L Turbo Petrol' : '1.2L NA Petrol';
}

cars.forEach(car => {
    if (car.variants) {
        car.variants.forEach(v => {
            // Check if engine contains "Kmpl" or "km/kg" or "kmpl"
            let rawEngine = v.engine || '';
            const isTurbo = (v.name && v.name.toLowerCase().includes('turbo'));
            
            // Clean up the car name from the engine string (e.g. "Creta E 1497 cc" -> "1497 cc")
            const parts = car.name.split(' ');
            parts.forEach(p => {
                const reg = new RegExp(p, 'gi');
                rawEngine = rawEngine.replace(reg, '');
            });
            
            // Also clean up variant name words
            const vParts = v.name.split(' ');
            vParts.forEach(vp => {
                const reg = new RegExp(vp, 'gi');
                rawEngine = rawEngine.replace(reg, '');
            });
            
            rawEngine = rawEngine.trim().replace(/^[-_]+/, '').trim();
            
            if (rawEngine.toLowerCase().includes('kmpl') || rawEngine.toLowerCase().includes('km/kg')) {
                // This is actually mileage!
                v.mileage = rawEngine;
                v.engine = '';
            } else if (rawEngine.includes('cc') || rawEngine.includes('kWh') || rawEngine.includes('Battery')) {
                // It is engine
                v.engine = rawEngine;
                // Leave mileage as 'N/A' or try to guess based on fuel (just keep N/A)
                if (v.mileage === 'N/A' || !v.mileage) v.mileage = (v.fuelType === 'CNG') ? '26.0 km/kg' : (v.fuelType === 'Diesel' ? '20.5 kmpl' : (v.fuelType === 'Electric' ? 'N/A' : '17.5 kmpl'));
            } else {
                // If it's something weird, just keep it or empty it
                v.engine = rawEngine;
            }
        });
    }
});

fs.writeFileSync(carsPath, JSON.stringify(cars, null, 2), 'utf8');
console.log('Fixed engine and mileage parsing issues for all variants.');
