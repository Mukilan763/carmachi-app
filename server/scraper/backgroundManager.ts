import { exec } from 'child_process';
import path from 'path';
import { dataStore } from '../dataStore';

let isScraping = false;

export function runBackgroundScrape(trigger: string = 'Automated Cron') {
    if (isScraping) {
        console.log(`[Scraper] Scrape already in progress. Ignoring trigger: ${trigger}`);
        return { status: 'already_running' };
    }

    console.log(`[Scraper] Starting live background scrape. Triggered by: ${trigger}`);
    isScraping = true;

    const scriptPath0 = path.resolve(__dirname, 'discover_new_cars.js');
    const scriptPath1 = path.resolve(__dirname, '../livescrape_variants.js');
    const scriptPath2 = path.resolve(__dirname, '../livescrape_specs.js');

    // Execute Phase 0: Discovery
    console.log('[Scraper] Phase 0: Discovering newly launched cars...');
    exec(`node "${scriptPath0}"`, (error0, stdout0, stderr0) => {
        if (error0) {
            console.error('[Scraper] Phase 0 Failed (Non-fatal):', error0.message);
        } else {
            console.log(stdout0);
        }

        // Execute Variants Scrape
        console.log('[Scraper] Phase 1: Scraping Variants & Pricing...');
        exec(`node "${scriptPath1}"`, (error1, stdout1, stderr1) => {
            if (error1) {
                console.error('[Scraper] Phase 1 Failed:', error1.message);
                isScraping = false;
                return;
            }
        
        console.log('[Scraper] Phase 1 Complete. Triggering Phase 2: Specs Scraping...');
        
        // Execute Specs Scrape
        exec(`node "${scriptPath2}"`, (error2, stdout2, stderr2) => {
            isScraping = false;

            if (error2) {
                console.error('[Scraper] Phase 2 Failed:', error2.message);
                return;
            }

            console.log('[Scraper] Background scraping fully completed!');
            
            // Atomically hot-reload the data into the active Express server without downtime
            dataStore.reloadCars();
        });
    });
    });

    return { status: 'started', message: 'Background scraping pipeline triggered.' };
}

/**
 * Initializes the automated schedule.
 * @param intervalHours Number of hours between automatic scrapes
 */
export function scheduleLiveScraping(intervalHours: number = 24) {
    const ms = intervalHours * 60 * 60 * 1000;
    console.log(`[Scraper] Scheduled background scrape every ${intervalHours} hours.`);
    
    setInterval(() => {
        runBackgroundScrape('Scheduled Job');
    }, ms);
}
