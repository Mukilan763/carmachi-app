# 🚗 CarMachi — Your AI Car Buddy for India

CarMachi is an intelligent, full-stack automotive web application crafted specifically for Indian car buyers. It moves far beyond static database filters by leveraging a **Two-Stage Cascade AI Prediction Engine**, deep lifestyle and Indian road context parsing (speed breakers, monsoons, mountain passes, joint families), and verified real-world automotive specifications across **157 car models and 1,697+ variants**.

---

## ✨ Key Features & Novel Innovations

### 🧠 1. Two-Stage Cascade AI Prediction Engine
- **Deterministic Hard Filtering:** Zero-latency mathematical filtering across verified budget brackets, fuel choices (Petrol, Diesel, CNG, Strong Hybrid, EV), seating requirements, and body styles.
- **Semantic TF-IDF & Context Ranking:** Analyzes natural language prompts (e.g., *"Safe automatic SUV under 15 Lakhs for elderly parents and terrible Bangalore speed breakers"*) and scores vehicles using cosine similarity and lifestyle weighting.
- **In-Memory Semantic LRU Cache:** Instant sub-millisecond retrieval of frequent queries with fuzzy bigram similarity fallback.

### 🧪 2. Indian Road Reality Lab™ (Exclusive Suite)
Novel interactive tools tailored specifically to the quirks of driving in India:
- **🚧 Speed Breaker Clearance Simulator:** Predicts underbody scraping risks on unmarked city rumble strips vs tall unscientific rural humps based on wheelbase, laden ground clearance, and suspension travel.
- **🌡️ ARAI vs. Peak Summer AC Reality Meter:** Calculates realistic real-world fuel economy when battling 45°C Indian summer heat, crawling Bumper-to-Bumper (B2B) city traffic, and running maximum AC blower load.
- **🏛️ BH Series Tax Arbitrage Calculator:** Compares standard State Road Tax (e.g. KA/MH/DL 14–18%) with the 2-year tenure Bharat Series (BH) plate to forecast cash flow savings.
- **🛡️ Showroom PDI Defense Shield:** An interactive 25-point Pre-Delivery Inspection checklist and VIN decoder to protect buyers from taking delivery of defective or odometer-tampered dealer stock.

### 📊 3. High-Fidelity Verified Vehicle Specs
- **Accurate CNG Derating:** Realistic ~11% power and ~5% torque derating for bi-fuel CNG variants.
- **Realistic Feature Matrix:** Strict price-band feature validation (no hallucinated 360° cameras or ADAS on budget hatchbacks).
- **Comprehensive Powertrain Specs:** 100% verified engine displacement (cc) for ICE/CNG/Hybrid models and usable battery pack sizes (kWh) for EVs.

### ⚡ 4. Zero-Downtime Hot-Swapping Scraper
- Background worker updates variant prices and market data via child process sandboxing without dropping active user connections or interrupting server availability.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Recharts |
| **Backend** | Node.js, Express, TypeScript, tsx |
| **Data & Storage** | In-memory verified automotive data store (`cars.json`), MongoDB Atlas (User Auth & Saved Shortlists) |
| **AI & NLP** | Custom TF-IDF vectorizer, Tokenizer & Bigram Jaccard Similarity, Lifestyle Context Analyzer |
| **DevOps / Hosting** | Render Web Service (unified full-stack static serving + REST API) |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mukilan763/carmachi-app.git
   cd carmachi-app
   ```

2. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

3. **Configure Environment Variables:**
   Copy the example environment file into `server/.env`:
   ```bash
   cp server/.env.example server/.env
   # Or on Windows PowerShell:
   # Copy-Item server/.env.example server/.env
   ```
   Open `server/.env` and update the placeholders (optional if running offline without Auth):
   ```env
   PORT=3001
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
   > **Note:** The core prediction engine, Indian Road Reality Lab, and vehicle catalog run 100% in-memory with zero external dependencies. MongoDB is only required if you want user registration, login, and saved shortlists.

4. **Run in Development Mode:**
   ```bash
   # Terminal 1 — Backend (Port 3001)
   cd server && npm run dev

   # Terminal 2 — Frontend (Port 5173)
   cd client && npm run dev
   ```

5. **Build & Run Production Server (Unified Web Service):**
   ```bash
   npm run build
   npm start
   ```
   The Express server serves both the backend API and the compiled React production client at `http://localhost:3001`.

---

## 📄 License
MIT License. Built with ❤️ for Indian car buyers.
