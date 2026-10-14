import { exec } from 'child_process';
import path from 'path';
import { dataStore } from '../dataStore';

let isScraping = false;
let scrapeTimeout: ReturnType<typeof setTimeout> | null = null;

const SCRAPER_DIR = path.resolve(__dirname, '..'); // server/ root

function resetScrapeFlag() {
    isScraping = false;
    if (scrapeTimeout) {
        clearTimeout(scrapeTimeout);
        scrapeTimeout = null;
    }
}

export function runBackgroundScrape(trigger: string = 'Automated Cron') {
    if (isScraping) {
        console.log(`[Scraper] Scrape already in progress. Ignoring trigger: ${trigger}`);
        return { status: 'already_running' };
    }

    console.log(`[Scraper] Starting live background scrape. Triggered by: ${trigger}`);
    isScraping = true;

    // Safety net: force-reset flag after 30 minutes to prevent permanent lockout
    scrapeTimeout = setTimeout(() => {
        console.warn('[Scraper] Safety timeout hit (30min). Resetting isScraping flag.');
        resetScrapeFlag();
    }, 30 * 60 * 1000);

    const scriptPath0 = path.resolve(__dirname, 'discover_new_cars.js');
    const scriptPath1 = path.resolve(SCRAPER_DIR, 'livescrape_variants.js');
    const scriptPath2 = path.resolve(SCRAPER_DIR, 'livescrape_specs.js');

    // Execute Phase 0: Discovery (non-fatal)
    console.log('[Scraper] Phase 0: Discovering newly launched cars...');
    exec(`node "${scriptPath0}"`, { timeout: 120000 }, (error0, stdout0) => {
        if (error0) {
            console.error('[Scraper] Phase 0 Failed (Non-fatal):', error0.message);
        } else {
            console.log('[Scraper] Phase 0 Output:', stdout0?.trim() || '(no output)');
        }

        // Execute Phase 1: Variants & Pricing
        console.log('[Scraper] Phase 1: Scraping Variants & Pricing...');
        exec(`node "${scriptPath1}"`, { timeout: 300000 }, (error1, stdout1) => {
            if (error1) {
                console.error('[Scraper] Phase 1 Failed:', error1.message);
                resetScrapeFlag();
                return;
            }
            console.log('[Scraper] Phase 1 Complete:', stdout1?.slice(-200) || '');

            // Execute Phase 2: Specs
            console.log('[Scraper] Phase 2: Scraping Specs & Power...');
            exec(`node "${scriptPath2}"`, { timeout: 300000 }, (error2, stdout2) => {
                if (error2) {
                    console.error('[Scraper] Phase 2 Failed:', error2.message);
                } else {
                    console.log('[Scraper] Phase 2 Complete:', stdout2?.slice(-200) || '');
                    console.log('[Scraper] All phases complete! Hot-reloading data...');
                    dataStore.reloadCars();
                }
                resetScrapeFlag();
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
