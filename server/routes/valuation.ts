import { Router } from 'express';
import { predictResaleValue, getDepreciationCurve } from '../prediction/resalePredictor';
import fs from 'fs';
import path from 'path';

const router = Router();

const getFuelPrices = () => {
    try {
        const p = path.resolve(__dirname, '../data/fuelPrices.json');
        if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
        const fallback = path.join(process.cwd(), 'server', 'data', 'fuelPrices.json');
        if (fs.existsSync(fallback)) return JSON.parse(fs.readFileSync(fallback, 'utf-8'));
    } catch (e) {
        console.error("Error reading fuelPrices.json:", e);
    }
    return {};
};

const getCars = () => {
    try {
        const p = path.resolve(__dirname, '../data/cars.json');
        if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
        const fallback = path.join(process.cwd(), 'server', 'data', 'cars.json');
        if (fs.existsSync(fallback)) return JSON.parse(fs.readFileSync(fallback, 'utf-8'));
    } catch (e) {
        console.error("Error reading cars.json:", e);
    }
    return [];
};

router.post('/resale', (req, res) => {
    try {
        const { carId, variantId, yearOfPurchase, kilometersDriven, city, condition, originalPrice, brand, segment, fuelType } = req.body;
        
        let price = Number(originalPrice);
        let carBrand = brand;
        let carSegment = segment;
        let carFuel = fuelType;

        // If carId is provided, look up details from cars.json
        if (carId) {
            const cars = getCars();
            const car = cars.find((c: any) => c.id === carId);
            if (car) {
                carBrand = carBrand || car.brand;
                carSegment = carSegment || car.segment;
                if (variantId && car.variants) {
                    const variant = car.variants.find((v: any) => v.id === variantId);
                    if (variant) {
                        price = price || variant.priceExShowroom;
                        carFuel = carFuel || variant.fuelType;
                    }
                }
                if (!price && car.priceRange) {
                    price = (car.priceRange.min + car.priceRange.max) / 2;
                }
            }
        }

        price = price || 1000000;
        const currentYear = new Date().getFullYear();
        const purchaseYear = Number(yearOfPurchase) || (currentYear - 3);
        const yearsOld = Math.max(0, currentYear - purchaseYear);
        const kms = Number(kilometersDriven) || (yearsOld * 12000);

        const result = predictResaleValue(
            price, 
            carBrand || 'Maruti Suzuki', 
            carSegment || 'SUV', 
            carFuel || 'Petrol', 
            city || 'Bangalore', 
            yearsOld,
            kms,
            condition || 'Good'
        );

        const curve = getDepreciationCurve(
            price,
            carBrand || 'Maruti Suzuki',
            carSegment || 'SUV',
            carFuel || 'Petrol',
            city || 'Bangalore'
        );
        
        res.json({
            ...result,
            depreciationCurve: curve
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/running-cost', (req, res) => {
    try {
        const { city, dailyKm, mileage, fuelType, state, annualInsurance, annualMaintenance } = req.body;
        
        const kmPerDay = Number(dailyKm) || 30;
        const monthlyKm = kmPerDay * 30;
        const annualKm = kmPerDay * 365;
        const kmpl = Number(mileage) || 18.0;

        // Determine fuel rate
        const fuelPrices = getFuelPrices();
        const stateKey = state || 'Karnataka';
        const statePrices = fuelPrices[stateKey] || fuelPrices['Maharashtra'] || { petrol: 102.0, diesel: 90.0, cng: 82.0 };
        
        let fuelRate = statePrices.petrol || 102.0;
        if (fuelType === 'Diesel') fuelRate = statePrices.diesel || 90.0;
        else if (fuelType === 'CNG') fuelRate = statePrices.cng || 82.0;
        else if (fuelType === 'Electric') fuelRate = 8.0; // ₹8 per unit, ~₹1.2 per km

        let monthlyFuelCost = 0;
        if (fuelType === 'Electric') {
            monthlyFuelCost = Math.round(monthlyKm * 1.35); // ~₹1.35/km for EV
        } else {
            monthlyFuelCost = Math.round((monthlyKm / kmpl) * fuelRate);
        }

        const insurance = Number(annualInsurance) || Math.round(kmPerDay > 50 ? 28000 : 22000);
        const maintenance = Number(annualMaintenance) || Math.round(fuelType === 'Electric' ? 6000 : 12000);
        const miscYearly = 6000; // parking, tolls, wash

        const totalYearlyCost = (monthlyFuelCost * 12) + insurance + maintenance + miscYearly;
        const costPerKm = Number((totalYearlyCost / annualKm).toFixed(2));

        res.json({
            fuelCostPerMonth: monthlyFuelCost,
            fuelCostPerYear: monthlyFuelCost * 12,
            insurancePerYear: insurance,
            maintenancePerYear: maintenance,
            miscPerYear: miscYearly,
            totalPerMonth: Math.round(totalYearlyCost / 12),
            totalPerYear: totalYearlyCost,
            costPerKm,
            fuelRateUsed: fuelRate,
            fiveYearTotalCost: totalYearlyCost * 5
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
