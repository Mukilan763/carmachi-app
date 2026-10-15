/**
 * fix_engine_fields.js
 * 
 * Backfills empty/incorrect engine fields across all cars.
 * 
 * Logic:
 * - Petrol / Diesel / CNG / Mild Hybrid / Strong Hybrid → uses car.engineCC
 * - Electric → extracts kWh from variant name, or uses EV_BATTERY_LOOKUP table
 * 
 * Safe to re-run — won't overwrite already-correct values.
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/cars.json');

// ─── Known EV battery sizes (kWh) per model ──────────────────────────────────
const EV_BATTERY_LOOKUP = {
  'Hyundai IONIQ 5': '72.6 kWh Battery',
  'Tata Nexon EV': null,          // variant name has MR/LR — handle specially
  'Kia EV6': '77.4 kWh Battery',
  'MG ZS EV': '50.3 kWh Battery',
  'BYD Atto 3': '60.48 kWh Battery',
  'Tata Tiago EV': null,          // has 19/24 kWh in name
  'Tata Tigor EV': '26 kWh Battery',
  'Mahindra XUV400 EV': null,     // has kWh in variant name
  'MG Comet EV': '17.3 kWh Battery',
  'Tata Curvv EV': null,          // has kWh in variant name (55/79 kWh)
  'Citroen eC3': '29.2 kWh Battery',
  'MG Windsor EV': '38 kWh Battery',
  'Kia EV9': '99.8 kWh Battery',
  'BMW i4': '83.9 kWh Battery',
  'Volvo C40 Recharge': '82 kWh Battery',
  'Porsche Taycan': '93.4 kWh Battery',
};

// Nexon EV sub-range mapping by variant name keywords
const NEXON_EV_RANGE = {
  'MR': '30.2 kWh Battery',
  'LR': '40.5 kWh Battery',
};

// Tiago EV sub-range mapping
const TIAGO_EV_RANGE = {
  '19': '19.2 kWh Battery',
  '24': '24 kWh Battery',
};

// Curvv EV sub-range
const CURVV_EV_RANGE = {
  '55': '55 kWh Battery',
  '79': '79 kWh Battery',
};

// XUV400 EV sub-range
const XUV400_EV_RANGE = {
  '34.5': '34.5 kWh Battery',
  '39.4': '39.4 kWh Battery',
};

function resolveEVBattery(carName, variantName) {
  // 1. Check if the variant name already contains kWh
  const kwhMatch = variantName.match(/(\d+\.?\d*)\s*kWh/i);
  if (kwhMatch) {
    return `${kwhMatch[1]} kWh Battery`;
  }

  // 2. Model-specific sub-range logic
  const lcVariant = variantName.toLowerCase();

  if (carName.includes('Nexon EV')) {
    if (lcVariant.includes('lr')) return NEXON_EV_RANGE['LR'];
    if (lcVariant.includes('mr')) return NEXON_EV_RANGE['MR'];
    return '30.2 kWh Battery'; // default to MR
  }

  if (carName.includes('Tiago EV')) {
    if (lcVariant.includes('24')) return TIAGO_EV_RANGE['24'];
    return TIAGO_EV_RANGE['19'];
  }

  if (carName.includes('Curvv EV')) {
    if (lcVariant.includes('79')) return CURVV_EV_RANGE['79'];
    return CURVV_EV_RANGE['55'];
  }

  if (carName.includes('XUV400')) {
    if (lcVariant.includes('39')) return XUV400_EV_RANGE['39.4'];
    return XUV400_EV_RANGE['34.5'];
  }

  // 3. Lookup table by model name
  for (const [modelKey, battery] of Object.entries(EV_BATTERY_LOOKUP)) {
    if (carName.includes(modelKey) && battery) {
      return battery;
    }
  }

  return null; // unknown — leave empty
}

function isBadEngineValue(engine) {
  if (!engine || engine.trim() === '') return true;
  const lower = engine.toLowerCase();
  // mileage data mistakenly in engine field
  if (lower.includes('kmpl') || lower.includes('km/l') || lower.includes('km/kg')) return true;
  if (lower.match(/^\d+\.?\d*\s*kg$/i)) return true;
  return false;
}

function main() {
  const cars = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  let backfilled = 0;
  let evFilled = 0;
  let alreadyOk = 0;
  let unknown = 0;

  for (const car of cars) {
    if (!Array.isArray(car.variants)) continue;

    for (const variant of car.variants) {
      const fuelType = variant.fuelType || car.fuelType || '';
      const isElectric = fuelType === 'Electric' || fuelType === 'EV';

      if (isElectric) {
        if (isBadEngineValue(variant.engine)) {
          const battery = resolveEVBattery(car.name, variant.name || '');
          if (battery) {
            variant.engine = battery;
            evFilled++;
          } else {
            unknown++;
          }
        } else {
          alreadyOk++;
        }
      } else {
        // Petrol / Diesel / CNG / Hybrid
        if (isBadEngineValue(variant.engine)) {
          const src = car.engineCC; // e.g. "998 cc" or "1197"
          if (src) {
            const ccStr = String(src).trim();
            // Normalise: ensure it ends with " cc"
            variant.engine = ccStr.endsWith('cc') ? ccStr : `${ccStr} cc`;
            backfilled++;
          } else {
            unknown++;
          }
        } else {
          alreadyOk++;
        }
      }
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(cars, null, 2));

  console.log('=== Engine Field Fix Complete ===');
  console.log(`  ICE/CNG backfilled : ${backfilled}`);
  console.log(`  EV battery filled  : ${evFilled}`);
  console.log(`  Already correct    : ${alreadyOk}`);
  console.log(`  Unknown (skipped)  : ${unknown}`);
  console.log(`  Total variants     : ${backfilled + evFilled + alreadyOk + unknown}`);
}

main();
