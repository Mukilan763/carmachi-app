import fs from 'fs';
import path from 'path';

class DataStore {
    private cars: any[] = [];
    private reviews: any = {};
    private serviceNetwork: any = {};
    private lastUpdate = Date.now();

    private getDataPath(filename: string) {
        const p = path.resolve(__dirname, 'data', filename);
        if (fs.existsSync(p)) return p;
        return path.join(process.cwd(), 'server', 'data', filename);
    }

    private safeReadJSON(filename: string, fallback: any) {
        try {
            const p = this.getDataPath(filename);
            if (fs.existsSync(p)) {
                return JSON.parse(fs.readFileSync(p, 'utf-8'));
            }
        } catch (e) {
            console.error(`[DataStore] Error reading ${filename}:`, e);
        }
        return fallback;
    }

    public initialize() {
        console.log('[DataStore] Loading initial datasets into memory...');
        this.cars = this.safeReadJSON('cars.json', []);
        this.reviews = this.safeReadJSON('reviews.json', {});
        this.serviceNetwork = this.safeReadJSON('serviceNetwork.json', {});
        console.log(`[DataStore] Loaded ${this.cars.length} cars successfully.`);
    }

    public reloadCars() {
        console.log('[DataStore] Hot-reloading cars.json without downtime...');
        const newCars = this.safeReadJSON('cars.json', []);
        if (newCars && newCars.length > 0) {
            this.cars = newCars;
            this.lastUpdate = Date.now();
            console.log(`[DataStore] Hot-reload complete. Active cars: ${this.cars.length}`);
            return true;
        } else {
            console.error('[DataStore] Hot-reload aborted: cars.json was empty or invalid.');
            return false;
        }
    }

    public getCars() {
        return this.cars;
    }

    public getReviews() {
        return this.reviews;
    }

    public getServiceNetwork() {
        return this.serviceNetwork;
    }

    public getLastUpdateTime() {
        return this.lastUpdate;
    }
}

export const dataStore = new DataStore();
