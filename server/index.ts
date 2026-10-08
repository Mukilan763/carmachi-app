import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import carsRouter from './routes/cars';
import predictionRouter from './routes/prediction';
import valuationRouter from './routes/valuation';
import forumRouter from './routes/forum';
import liveRouter from './routes/live';
import adminRouter from './routes/admin';
import authRouter from './routes/auth';
import { dataStore } from './dataStore';
import { scheduleLiveScraping } from './scraper/backgroundManager';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize in-memory datastore
dataStore.initialize();

// Start automated background live scraping (every 12 hours)
scheduleLiveScraping(12);

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRouter);
app.use('/api/cars', carsRouter);
app.use('/api/predict', predictionRouter);
app.use('/api/valuation', valuationRouter);
app.use('/api/forum', forumRouter);
app.use('/api/live', liveRouter);
app.use('/api/admin', adminRouter);

// Serve React production build
const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Client-side routing fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('[MongoDB] Connected successfully to Atlas cluster');
    })
    .catch((err) => {
      console.error('[MongoDB] Connection failed!', err.message);
    });
} else {
  console.warn('[MongoDB] No MONGODB_URI found. Auth features will be disabled.');
}

app.listen(PORT, () => {
  console.log(`CarMachi server running on port ${PORT}`);
});
