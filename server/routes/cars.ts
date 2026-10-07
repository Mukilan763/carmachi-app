import { Router } from 'express';
import { dataStore } from '../dataStore';

const router = Router();

router.get('/', (req, res) => {
    const cars = dataStore.getCars();
    const { brand, bodyType, fuel, budgetMin, budgetMax, transmission, search, sort } = req.query;
    
    let filtered = cars;
    if (brand) filtered = filtered.filter((c: any) => c.brand.toLowerCase() === (brand as string).toLowerCase());
    if (bodyType) filtered = filtered.filter((c: any) => c.bodyType.toLowerCase() === (bodyType as string).toLowerCase());
    if (fuel) filtered = filtered.filter((c: any) => c.variants && c.variants.some((v: any) => v.fuelType.toLowerCase() === (fuel as string).toLowerCase()));
    if (transmission) filtered = filtered.filter((c: any) => c.variants && c.variants.some((v: any) => v.transmission.toLowerCase() === (transmission as string).toLowerCase()));
    if (budgetMin || budgetMax) {
        const min = budgetMin ? Number(budgetMin) : 0;
        const max = budgetMax ? Number(budgetMax) : Infinity;
        filtered = filtered.filter((c: any) => {
            const pMin = c.priceRange?.min ?? c.priceMin ?? 0;
            const pMax = c.priceRange?.max ?? c.priceMax ?? Infinity;
            return pMin <= max && pMax >= min;
        });
    }
    if (search) {
        const q = (search as string).toLowerCase();
        filtered = filtered.filter((c: any) => c.name.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q));
    }

    if (sort === 'priceAsc') {
        filtered.sort((a: any, b: any) => (a.priceRange?.min ?? a.priceMin ?? 0) - (b.priceRange?.min ?? b.priceMin ?? 0));
    } else if (sort === 'priceDesc') {
        filtered.sort((a: any, b: any) => (b.priceRange?.max ?? b.priceMax ?? 0) - (a.priceRange?.max ?? a.priceMax ?? 0));
    }

    res.json(filtered);
});

router.get('/brands', (req, res) => {
    const cars = dataStore.getCars();
    const brands: Record<string, number> = {};
    cars.forEach((c: any) => {
        brands[c.brand] = (brands[c.brand] || 0) + 1;
    });
    res.json(brands);
});

router.get('/search', (req, res) => {
    const cars = dataStore.getCars();
    const q = req.query.q as string;
    if (!q) return res.json([]);
    
    const searchLower = q.toLowerCase();
    const results = cars.filter((c: any) => 
        c.name.toLowerCase().includes(searchLower) ||
        c.brand.toLowerCase().includes(searchLower) ||
        (c.tags && c.tags.some((t: string) => t.toLowerCase().includes(searchLower)))
    );
    res.json(results);
});

router.get('/:id', (req, res) => {
    const cars = dataStore.getCars();
    const car = cars.find((c: any) => c.id === req.params.id);
    if (!car) {
        return res.status(404).json({ message: "Car not found" });
    }
    res.json(car);
});

export default router;
