import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { dataStore } from '../dataStore';

let isScraping = false;
let scrapeTimeout: ReturnType<typeof setTimeout> | null = null;
let nightlyTimer: ReturnType<typeof setTimeout> | null = null;
let probeIntervalTimer: ReturnType<typeof setInterval> | null = null;
let fileWatchDebounce: ReturnType<typeof setTimeout> | null = null;

let lastScrapeInfo = {
    timestamp: Date.now(),
    trigger: 'Initial Server Boot',
    status: 'idle',
    lastSuccess: Date.now(),
};

const SERVER_ROOT = path.resolve(__dirname, '..'); // server/ root

function resetScrapeFlag() {
    isScraping = false;
    if (scrapeTimeout) {
        clearTimeout(scrapeTimeout);
        scrapeTimeout = null;
    }
}

/**
 * Executes a child process as a Promise.
 */
function runCommandAsync(command: string, timeoutMs: number = 300000): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        exec(command, { timeout: timeoutMs, cwd: SERVER_ROOT }, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            resolve({ stdout: stdout || '', stderr: stderr || '' });
        });
    });
}

/**
 * Triggers the end-to-end background scraping pipeline:
 * Phase 0: Discovery of newly launched cars
 * Phase 1: Variants & live pricing
 * Phase 2: Engine specs, dimensions, power
 * Phase 3: Data Quality guardrail (CNG derating, accurate engine CC, EV battery backfill)
 * Final: In-memory hot swap with zero downtime
 */
export async function runBackgroundScrape(trigger: string = 'Automated Trigger') {
    if (isScraping) {
        console.log(`[Scraper] Scrape already in progress. Ignoring trigger: ${trigger}`);
        return { status: 'already_running', message: 'A scrape task is currently executing.' };
    }

    console.log(`\n======================================================`);
    console.log(`[Scraper] Starting live background scrape. Triggered by: ${trigger}`);
    console.log(`[Scraper] Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
    console.log(`======================================================\n`);

    isScraping = true;
    lastScrapeInfo.timestamp = Date.now();
    lastScrapeInfo.trigger = trigger;
    lastScrapeInfo.status = 'running';

    // Safety timeout: auto-reset flag after 30 minutes to prevent permanent lockouts
    scrapeTimeout = setTimeout(() => {
        console.warn('[Scraper] Safety timeout reached (30 minutes). Forcibly resetting isScraping flag.');
        resetScrapeFlag();
        lastScrapeInfo.status = 'timeout';
    }, 30 * 60 * 1000);

    const scriptPhase0 = path.resolve(__dirname, 'discover_new_cars.js');
    const scriptPhase1 = path.resolve(SERVER_ROOT, 'livescrape_variants.js');
    const scriptPhase2 = path.resolve(SERVER_ROOT, 'livescrape_specs.js');
    const scriptFixQuality = path.resolve(SERVER_ROOT, 'scripts', 'fix_data_quality.js');
    const scriptFixEngine = path.resolve(SERVER_ROOT, 'scripts', 'fix_engine_fields.js');

    try {
        // Phase 0: Discovery (non-fatal if network fails)
        console.log('[Scraper] Phase 0: Discovering newly launched cars...');
        try {
            const out0 = await runCommandAsync(`node "${scriptPhase0}"`, 120000);
            console.log('[Scraper] Phase 0 Output:', out0.stdout.trim() || '(no output)');
        } catch (err0: any) {
            console.warn('[Scraper] Phase 0 Non-fatal warning:', err0.message);
        }

        // Phase 1: Variants & Pricing
        console.log('[Scraper] Phase 1: Scraping Variants & Pricing...');
        const out1 = await runCommandAsync(`node "${scriptPhase1}"`, 300000);
        console.log('[Scraper] Phase 1 Complete:', out1.stdout.slice(-250).trim());

        // Phase 2: Specs & Power
        console.log('[Scraper] Phase 2: Scraping Specs & Power...');
        const out2 = await runCommandAsync(`node "${scriptPhase2}"`, 300000);
        console.log('[Scraper] Phase 2 Complete:', out2.stdout.slice(-250).trim());

        // Phase 3: Post-processing Data Quality Guardrails
        console.log('[Scraper] Phase 3: Running Data Quality Guardrails & Engine CC / EV backfill...');
        if (fs.existsSync(scriptFixQuality)) {
            await runCommandAsync(`node "${scriptFixQuality}"`, 60000);
            console.log('[Scraper] Data quality guardrails applied.');
        }
        if (fs.existsSync(scriptFixEngine)) {
            await runCommandAsync(`node "${scriptFixEngine}"`, 60000);
            console.log('[Scraper] Engine CC and EV battery normalization applied.');
        }

        // Hot reload dataStore in-memory
        console.log('[Scraper] All phases completed successfully! Hot-swapping in-memory car database...');
        dataStore.reloadCars();
        lastScrapeInfo.status = 'success';
        lastScrapeInfo.lastSuccess = Date.now();
        console.log('[Scraper] Hot-reload complete with zero downtime.\n');

    } catch (err: any) {
        console.error('[Scraper] Pipeline failed during execution:', err.message);
        lastScrapeInfo.status = 'failed';
    } finally {
        resetScrapeFlag();
    }

    return { 
        status: 'started', 
        trigger, 
        message: 'Background scrape pipeline initiated.' 
    };
}

/**
 * Calculates milliseconds until next occurrence of target hour (in 24-hr local/IST format).
 * Defaults to 2:00 AM (02:00).
 */
function getMsUntilNextTargetTime(targetHour: number = 2, targetMinute: number = 0): number {
    const now = new Date();
    const next = new Date(now);
    next.setHours(targetHour, targetMinute, 0, 0);

    // If target hour for today has already passed, schedule for tomorrow
    if (next.getTime() <= now.getTime()) {
        next.setDate(next.getDate() + 1);
    }

    return next.getTime() - now.getTime();
}

/**
 * Schedules the live scraper to execute every night at the specified hour.
 * @param targetHour 24-hour format (Default: 2 for 2:00 AM)
 * @param targetMinute (Default: 0)
 */
export function scheduleNightlyScraping(targetHour: number = 2, targetMinute: number = 0) {
    if (nightlyTimer) {
        clearTimeout(nightlyTimer);
        nightlyTimer = null;
    }

    const msUntilTarget = getMsUntilNextTargetTime(targetHour, targetMinute);
    const hours = Math.floor(msUntilTarget / (1000 * 60 * 60));
    const minutes = Math.floor((msUntilTarget % (1000 * 60 * 60)) / (1000 * 60));

    const timeStr = `${String(targetHour).padStart(2, '0')}:${String(targetMinute).padStart(2, '0')}`;
    console.log(`[Scraper] 🌙 Nightly schedule active: Next automated scrape at ${timeStr} (in ${hours}h ${minutes}m).`);

    nightlyTimer = setTimeout(async () => {
        try {
            await runBackgroundScrape(`Nightly Scheduled Run (${timeStr})`);
        } catch (e: any) {
            console.error('[Scraper] Nightly scrape error:', e.message);
        }
        // Recursively schedule the next night's scrape
        scheduleNightlyScraping(targetHour, targetMinute);
    }, msUntilTarget);
}

/**
 * Enables an automated file watcher on `data/cars.json`.
 * Whenever an update occurs on disk (e.g., git pull, CMS export, external write),
 * it automatically hot-reloads the in-memory dataStore without restarting the server.
 */
export function enableDataFileWatcher() {
    const carsDataPath = path.resolve(SERVER_ROOT, 'data', 'cars.json');
    if (!fs.existsSync(carsDataPath)) return;

    console.log(`[Scraper] 👁️ File watcher active on ${path.basename(carsDataPath)}: Auto-activates on any file update.`);

    try {
        fs.watch(carsDataPath, (eventType) => {
            if (eventType === 'change') {
                if (fileWatchDebounce) clearTimeout(fileWatchDebounce);
                fileWatchDebounce = setTimeout(() => {
                    console.log('[Scraper] ⚡ Update detected in cars.json! Hot-reloading in-memory database...');
                    dataStore.reloadCars();
                }, 1500); // 1.5s debounce to allow write stream to flush
            }
        });
    } catch (err: any) {
        console.warn('[Scraper] Could not attach file watcher:', err.message);
    }
}

/**
 * Periodic Market Update Probe:
 * Runs periodically to check if any manufacturer announced new pricing or launches.
 * If updates are detected, activates the live scraper.
 */
export function enableMarketUpdateProbe(probeIntervalHours: number = 4) {
    if (probeIntervalTimer) clearInterval(probeIntervalTimer);

    const ms = probeIntervalHours * 60 * 60 * 1000;
    console.log(`[Scraper] 🔍 Market update probe active: Checking for updates every ${probeIntervalHours} hours.`);

    probeIntervalTimer = setInterval(() => {
        console.log('[Scraper] 🔍 Running periodic market update probe...');
        // Run Discovery phase to check for new launches
        const scriptPhase0 = path.resolve(__dirname, 'discover_new_cars.js');
        exec(`node "${scriptPhase0}"`, { timeout: 120000, cwd: SERVER_ROOT }, (error, stdout) => {
            if (!error && stdout && stdout.includes('Added')) {
                console.log('[Scraper] 🚀 New cars discovered in market probe! Triggering full update scrape...');
                runBackgroundScrape('Market Update Probe (New Cars Detected)');
            } else {
                console.log('[Scraper] Market probe complete. Catalog is up-to-date.');
            }
        });
    }, ms);
}

/**
 * Helper to trigger scrape immediately from webhooks or admin routes
 */
export function triggerScrapeOnUpdate(source: string = 'Webhook / Event Trigger') {
    return runBackgroundScrape(source);
}

/**
 * Returns current status and telemetry of the background scraper.
 */
export function getScraperStatus() {
    return {
        isScraping,
        lastScrapeInfo,
        nextNightlyHour: '02:00 AM',
        totalCarsInMemory: dataStore.getCars().length,
    };
}
