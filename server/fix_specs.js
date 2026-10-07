const fs = require('fs');
const path = require('path');

const carsPath = path.join(__dirname, 'data', 'cars.json');
let cars = JSON.parse(fs.readFileSync(carsPath, 'utf8'));

// Common engines mapping
const ENGINE_MAP = [
    // Hyundai / Kia
    { id: '1497_p', cc: '1497 cc', fuel: 'Petrol', power: '113 bhp', torque: '144 Nm' },
    { id: '1482_p', cc: '1482 cc', fuel: 'Petrol', power: '158 bhp', torque: '253 Nm' }, 
    { id: '1493_d', cc: '1493 cc', fuel: 'Diesel', power: '114 bhp', torque: '250 Nm' },
    { id: '1197_p_hy', cc: '1197 cc', fuel: 'Petrol', brand: 'Hyundai', power: '82 bhp', torque: '114 Nm' }, 
    { id: '1197_c_hy', cc: '1197 cc', fuel: 'CNG', brand: 'Hyundai', power: '68 bhp', torque: '95 Nm' }, 
    { id: '998_p_hy', cc: '998 cc', fuel: 'Petrol', brand: 'Hyundai', power: '118 bhp', torque: '172 Nm' }, 
    { id: '1999_p_hy', cc: '1999 cc', fuel: 'Petrol', brand: 'Hyundai', power: '154 bhp', torque: '192 Nm' }, 
    
    // Maruti Suzuki
    { id: '1197_c_ms', cc: '1197 cc', fuel: 'CNG', brand: 'Maruti Suzuki', power: '76 bhp', torque: '98.5 Nm' },
    { id: '1197_p_ms', cc: '1197 cc', fuel: 'Petrol', brand: 'Maruti Suzuki', power: '89 bhp', torque: '113 Nm' }, 
    { id: '1462_c_ms', cc: '1462 cc', fuel: 'CNG', brand: 'Maruti Suzuki', power: '87 bhp', torque: '121.5 Nm' },
    { id: '1462_p_ms', cc: '1462 cc', fuel: 'Petrol', brand: 'Maruti Suzuki', power: '102 bhp', torque: '137 Nm' }, 
    { id: '1490_p_ms', cc: '1490 cc', fuel: 'Petrol', brand: 'Maruti Suzuki', power: '91 bhp', torque: '122 Nm' }, 
    { id: '998_c_ms', cc: '998 cc', fuel: 'CNG', brand: 'Maruti Suzuki', power: '56 bhp', torque: '82 Nm' },
    { id: '998_p_ms', cc: '998 cc', fuel: 'Petrol', brand: 'Maruti Suzuki', power: '66 bhp', torque: '89 Nm' }, 
    { id: '1198_p_ms', cc: '1198 cc', fuel: 'Petrol', brand: 'Maruti Suzuki', power: '80 bhp', torque: '112 Nm' }, 
    
    // Tata
    { id: '1199_c_ta', cc: '1199 cc', fuel: 'CNG', brand: 'Tata', power: '72 bhp', torque: '103 Nm' }, 
    { id: '1199_p_ta', cc: '1199 cc', fuel: 'Petrol', brand: 'Tata', power: '87 bhp', torque: '115 Nm' }, 
    { id: '1199_p_ta_t', cc: '1199 cc', fuel: 'Petrol', brand: 'Tata', turbo: true, power: '118 bhp', torque: '170 Nm' }, 
    { id: '1497_d_ta', cc: '1497 cc', fuel: 'Diesel', brand: 'Tata', power: '113 bhp', torque: '260 Nm' }, 
    { id: '1956_d_ta', cc: '1956 cc', fuel: 'Diesel', brand: 'Tata', power: '168 bhp', torque: '350 Nm' }, 
    
    // Mahindra
    { id: '2184_d_ma', cc: '2184 cc', fuel: 'Diesel', brand: 'Mahindra', power: '173 bhp', torque: '370 Nm' }, 
    { id: '1997_p_ma', cc: '1997 cc', fuel: 'Petrol', brand: 'Mahindra', power: '197 bhp', torque: '380 Nm' }, 
    { id: '1497_d_ma', cc: '1497 cc', fuel: 'Diesel', brand: 'Mahindra', power: '115 bhp', torque: '300 Nm' }, 
    { id: '1197_p_ma', cc: '1197 cc', fuel: 'Petrol', brand: 'Mahindra', power: '109 bhp', torque: '200 Nm' }, 
    
    // Toyota
    { id: '1490_p_to', cc: '1490 cc', fuel: 'Petrol', brand: 'Toyota', power: '91 bhp', torque: '122 Nm' }, 
    { id: '1197_c_to', cc: '1197 cc', fuel: 'CNG', brand: 'Toyota', power: '76 bhp', torque: '98.5 Nm' },
    { id: '1462_c_to', cc: '1462 cc', fuel: 'CNG', brand: 'Toyota', power: '87 bhp', torque: '121.5 Nm' },
    { id: '1462_p_to', cc: '1462 cc', fuel: 'Petrol', brand: 'Toyota', power: '102 bhp', torque: '137 Nm' }, 
    { id: '1987_p_to', cc: '1987 cc', fuel: 'Petrol', brand: 'Toyota', power: '184 bhp', torque: '188 Nm' }, 
    { id: '1987_p_to_na', cc: '1987 cc', fuel: 'Petrol', brand: 'Toyota', turbo: false, hybrid: false, power: '173 bhp', torque: '209 Nm' }, 
    { id: '2755_d_to', cc: '2755 cc', fuel: 'Diesel', brand: 'Toyota', power: '201 bhp', torque: '500 Nm' }, 
    
    // Honda
    { id: '1498_p_ho', cc: '1498 cc', fuel: 'Petrol', brand: 'Honda', power: '119 bhp', torque: '145 Nm' }, 
    { id: '1498_p_ho_h', cc: '1498 cc', fuel: 'Petrol', brand: 'Honda', hybrid: true, power: '125 bhp', torque: '253 Nm' }, 
];

cars.forEach(car => {
    if (car.variants) {
        car.variants.forEach(v => {
            if (!v.engine) return;
            
            const isHybrid = v.name.toLowerCase().includes('hybrid') || car.name.toLowerCase().includes('hybrid');
            const isTurbo = car.name.includes('Nexon') || car.name.includes('Altroz Racer'); // rough tata
            
            // Find matched spec
            let matchedSpec = null;
            
            for (let spec of ENGINE_MAP) {
                if (v.engine.includes(spec.cc) && v.fuelType === spec.fuel) {
                    // Check brand
                    if (spec.brand && spec.brand !== car.brand) continue;
                    
                    // Check special conditions
                    if (spec.hybrid !== undefined && spec.hybrid !== isHybrid) continue;
                    if (spec.turbo !== undefined && spec.turbo !== isTurbo) continue;
                    
                    matchedSpec = spec;
                    break;
                }
            }
            
            if (matchedSpec) {
                // Overwrite with correct specs
                v.power = matchedSpec.power;
                v.torque = matchedSpec.torque;
            }
        });
    }
});

fs.writeFileSync(carsPath, JSON.stringify(cars, null, 2), 'utf8');
console.log('Fixed variant-specific power and torque using smart dictionary!');
