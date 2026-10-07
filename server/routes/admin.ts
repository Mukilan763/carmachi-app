import { Router } from 'express';
import { runBackgroundScrape } from '../scraper/backgroundManager';
import { dataStore } from '../dataStore';

const router = Router();

// Endpoint to trigger live scraping
router.post('/trigger-scrape', (req, res) => {
    const result = runBackgroundScrape('Manual Admin Trigger');
    res.json(result);
});

// Endpoint to get scraper status and last update time
router.get('/status', (req, res) => {
    res.json({
        lastUpdate: new Date(dataStore.getLastUpdateTime()).toISOString(),
        totalCars: dataStore.getCars().length,
    });
});

export default router;
