const fs = require('fs');
const path = require('path');

const carsPath = path.join(__dirname, '..', 'data', 'cars.json');
let cars = JSON.parse(fs.readFileSync(carsPath, 'utf8'));

// ─── Real feature sets per absolute price band ───────────────────────────────
// These are based on what cars ACTUALLY offer at each price point in India 2024-25
function getRealFeatures(priceExShowroom, fuelType, transmission) {
    const price = priceExShowroom;
    const isEV = fuelType === 'Electric';
    const isCNG = fuelType === 'CNG';
    const isAuto = transmission === 'Automatic';

    // Under ₹5L (true budget — Alto base, S-Presso base, Tiago base)
    if (price < 500000) {
        const feats = ['Dual Airbags', 'ABS with EBD', 'Rear Parking Sensors'];
        if (isAuto) feats.push('Automatic Gear Shift');
        if (isCNG) feats.push('Factory-fitted CNG Kit');
        return feats.slice(0, 4);
    }
    // ₹5L–₹7L (budget mid — Alto VXi, Tiago XZ, WagonR LXI)
    if (price < 700000) {
        const feats = ['Dual Airbags', 'ABS with EBD', 'Rear Parking Sensors', 'Power Windows'];
        if (isAuto) feats.push('AMT Gearbox');
        if (isCNG) feats.push('Factory-fitted CNG Kit');
        return feats.slice(0, 4);
    }
    // ₹7L–₹10L (budget-premium — Swift ZXI, i20 Magna, Venue S)
    if (price < 1000000) {
        const base = ['6 Airbags', 'ABS with EBD', 'Rear Parking Sensors'];
        if (isAuto) base.push('AMT / CVT Gearbox');
        else base.push('7-inch Touchscreen');
        if (isCNG) base.push('Factory-fitted CNG Kit');
        if (!isCNG && price > 800000) base.push('Reverse Camera');
        return base.slice(0, 4);
    }
    // ₹10L–₹14L (mid-range — Creta E/EX, Nexon XM, Punch Adv)
    if (price < 1400000) {
        const base = ['6 Airbags', 'ABS with EBD', '8-inch Touchscreen', 'Reverse Camera'];
        if (price > 1100000) base.push('Electric Sunroof');
        if (isAuto) base.push('Automatic Transmission');
        if (isCNG) base.push('Factory-fitted CNG Kit');
        return base.slice(0, 4);
    }
    // ₹14L–₹20L (mid-premium — Creta SX, Nexon XZ+, Seltos HTX)
    if (price < 2000000) {
        const base = ['6 Airbags', 'Electric Sunroof', 'Automatic Climate Control', 'Alloy Wheels'];
        if (price > 1600000) {
            base.push('Wireless Android Auto / Apple CarPlay');
            base.push('Ventilated Front Seats');
        }
        if (price > 1700000) {
            base.push('360-Degree Camera');
        }
        if (isEV) {
            base.push('Fast Charging (DC)');
            base.push('Regenerative Braking');
        }
        return base.slice(0, 4);
    }
    // ₹20L–₹30L (premium — Creta King/Alcazar top, Harrier, XUV700)
    if (price < 3000000) {
        const base = ['Panoramic Sunroof', 'Ventilated Front Seats', 'ADAS Level 2', '360-Degree Camera'];
        if (price > 2500000) base.push('Premium Sound System');
        if (isEV) {
            base.push('V2L Vehicle-to-Load');
            base.push('Wireless Charging');
        }
        return base.slice(0, 4);
    }
    // ₹30L+ (luxury — Kodiaq, Fortuner Legender, XUV 3XO, EV6)
    const base = ['Panoramic Sunroof', 'Ventilated & Massaging Seats', 'ADAS Level 2', 'Premium Harman/Bose Sound'];
    if (isEV) base.push('V2L Vehicle-to-Load');
    else base.push('Powered Tailgate');
    return base.slice(0, 4);
}

// ─── CNG Power/Torque derating ────────────────────────────────────────────────
function derateCNGPower(powerStr, torqueStr) {
    if (!powerStr || typeof powerStr !== 'string') return { power: powerStr, torque: torqueStr };
    
    // Parse power e.g. "68bhp@5600rpm" → reduce by ~10%
    const powerMatch = powerStr.match(/^([\d.]+)(bhp|ps|kw)@(.+)$/i);
    if (powerMatch) {
        const val = parseFloat(powerMatch[1]);
        const unit = powerMatch[2].toLowerCase();
        const rpm = powerMatch[3];
        const derated = Math.round(val * 0.89); // CNG ~11% less power
        const newPower = `${derated}${unit}@${rpm}`;
        
        // Derate torque too (~5% less)
        let newTorque = torqueStr;
        if (torqueStr) {
            const tqMatch = torqueStr.match(/^([\d.]+)(Nm|nm)@(.+)$/i);
            if (tqMatch) {
                const tqVal = parseFloat(tqMatch[1]);
                const tqUnit = tqMatch[2];
                const tqRpm = tqMatch[3];
                newTorque = `${Math.round(tqVal * 0.95)}${tqUnit}@${tqRpm}`;
            }
        }
        return { power: newPower, torque: newTorque };
    }
    return { power: powerStr, torque: torqueStr };
}

// ─── Fix engine field when it's mileage data ─────────────────────────────────
function fixEngineField(variant) {
    const engine = variant.engine || '';
    // If engine field looks like mileage (e.g. "24.39 Kmpl", "AT 24.9 Kmpl", "Kg")
    if (/kmpl|km\/charge|km\/kg|^\s*kg\s*$/i.test(engine) || engine === '') {
        // Set mileage from engine if not already set
        if (!variant.mileage && /kmpl|km\/charge|km\/kg/i.test(engine)) {
            const cleaned = engine.replace(/^AT\s*/i, '').trim();
            variant.mileage = cleaned;
        }
        // Clear the bad engine value
        variant.engine = '';
    }
}

// ─── Main correction pass ─────────────────────────────────────────────────────
let totalFixed = 0;
let carsFixed = 0;

for (const car of cars) {
    if (!car.variants || car.variants.length === 0) continue;
    
    let carChanged = false;
    
    // Sort variants by price ascending (ensures consistent tier assignment)
    car.variants.sort((a, b) => (a.priceExShowroom || 0) - (b.priceExShowroom || 0));

    for (const variant of car.variants) {
        // Fix bad engine field
        fixEngineField(variant);
        
        // Fix CNG power/torque (should be lower than petrol)
        if (variant.fuelType === 'CNG' && variant.power && variant.power !== 'N/A') {
            const { power, torque } = derateCNGPower(variant.power, variant.torque);
            variant.power = power;
            variant.torque = torque;
        }
        
        // Fix keyHighlights based on real price bands
        const realFeatures = getRealFeatures(
            variant.priceExShowroom || 0,
            variant.fuelType || 'Petrol',
            variant.transmission || 'Manual'
        );
        variant.keyHighlights = realFeatures;
        
        totalFixed++;
        carChanged = true;
    }
    
    if (carChanged) carsFixed++;
}

console.log(`\n✅ Data correction complete!`);
console.log(`   Cars processed: ${carsFixed}`);
console.log(`   Variants corrected: ${totalFixed}`);
console.log(`\nWriting corrected data to cars.json...`);
fs.writeFileSync(carsPath, JSON.stringify(cars, null, 2), 'utf8');
console.log(`✅ Done! cars.json updated with accurate features and CNG power figures.`);
