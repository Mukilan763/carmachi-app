import { Router } from 'express';
import { runPrediction } from '../prediction/predictionEngine';
import { getLocationFactors } from '../prediction/locationFactors';
import { advancedNaturalLanguageParser } from '../prediction/nlpParser';
import { dataStore } from '../dataStore';

const router = Router();

router.post('/', async (req, res) => {
    try {
        let input = req.body;
        
        if (input.textQuery) {
            input = advancedNaturalLanguageParser(input.textQuery, input);
        }

        const cars = dataStore.getCars() || [];
        const reviews = dataStore.getReviews() || {};
        const serviceNetwork = dataStore.getServiceNetwork() || {};
        
        const locationFactors = getLocationFactors(input.city || '', input.state || '');

        const results = await runPrediction(input, cars, locationFactors, reviews, serviceNetwork);
        
        res.json({
            parsedInput: input,
            results
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
});

router.get('/factors/:city', (req, res) => {
    const city = req.params.city;
    const state = req.query.state as string || '';
    try {
        const factors = getLocationFactors(city, state);
        res.json(factors);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
