# 🚗 CarMachi — Your AI Car Buddy for India

CarMachi is an intelligent, full-stack web application designed to help Indian car buyers find their perfect vehicle. It moves beyond standard database filters by utilizing a **Two-Stage Cascade AI Prediction Engine** that understands natural language queries, parses deep lifestyle contexts (terrain, family size, climate), and ranks cars using semantic search and deterministic scoring.

## ✨ Key Features

- **🧠 AI Prediction Engine:** Type natural queries like *"Safe family SUV under 20 lakhs for bad roads"* and the engine will instantly parse intent, budget, and context.
- **⚡ Two-Stage Cascade Architecture:** 
  1. **Hard Filtering:** Deterministic zero-latency math filtering (budget, seats, body type).
  2. **Semantic Ranking:** Custom TF-IDF Vectorizer with Cosine Similarity scoring, combined with dynamic context bonuses.
- **🔄 Zero-Downtime Live Scraping:** Automatically fetches the latest variants, specs, and pricing in the background via Node.js child processes without dropping active HTTP connections. Hot-swaps data completely in-memory.
- **🏎️ Immersive UI:** Built with React and TailwindCSS, featuring real-time radar charts and 3D tilt-responsive car galleries.
- **🇮🇳 Hyper-Localized for India:** Tracks ARAI mileage, Indian market resale values, brand service network strength, and on-road/ex-showroom pricing across major metro cities.

## 🛠️ Tech Stack

- **Frontend:** React (Vite), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Recharts.
- **Backend:** Node.js, Express, TypeScript.
- **Data & AI:** Custom Zero-Dependency NLP Parser, In-memory LRU Semantic Cache, Cheerio/Axios for web scraping.

## 🚀 Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mukilan763/carmachi-app.git
   cd carmachi-app
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Start the development servers**
   ```bash
   # Terminal 1: Start Backend (Port 3001)
   cd server
   npm run dev

   # Terminal 2: Start Frontend (Port 5173)
   cd client
   npm run dev
   ```

## 🌐 Public Hosting

CarMachi is designed to run as a unified Node.js Web Service. The Express backend is configured to automatically serve the compiled React production build from `client/dist`. 

(Live URL coming soon!)

---
*Built with ❤️ for Indian Car Buyers.*
