import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Gauge, 
  Fuel, 
  FileCheck, 
  Users, 
  Briefcase, 
  AlertTriangle, 
  CheckCircle2, 
  Car, 
  ThermometerSun, 
  TrendingDown, 
  IndianRupee,
  Navigation,
  Sparkles
} from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';

interface Props {
  car: {
    id: string;
    name: string;
    brand: string;
    bodyType?: string;
    segment?: string;
    priceRange?: { min: number; max: number };
    priceMin?: number;
    priceMax?: number;
    mileage?: string;
    variants?: any[];
  };
  selectedCity?: string;
}

// Ground clearance estimates by body type / popular models (in mm)
const ESTIMATED_CLEARANCE: Record<string, number> = {
  'Hatchback': 165,
  'Sedan': 160,
  'SUV': 195,
  'MUV': 180,
  'Luxury': 150,
  'default': 170
};

// Known clearance overrides for high-volume models
const MODEL_CLEARANCE_OVERRIDES: Record<string, number> = {
  'alto': 160,
  'kwid': 184,
  'spresso': 180,
  'swift': 163,
  'baleno': 170,
  'i20': 170,
  'tiago': 170,
  'nexon': 208,
  'brezza': 198,
  'creta': 190,
  'seltos': 190,
  'thar': 226,
  'scorpio': 209,
  'xuv700': 200,
  'harrier': 205,
  'safari': 205,
  'city': 165,
  'verna': 170,
  'virtus': 179,
  'slavia': 179,
  'innova': 178,
  'hycross': 185
};

export const IndianRoadRealityLab: React.FC<Props> = ({ car, selectedCity = 'Delhi' }) => {
  const [activeTab, setActiveTab] = useState<'ground' | 'mileage' | 'bhTax' | 'pdi'>('ground');

  // ─── TAB 1: Ground Clearance & Speed-Breaker Simulator State ─────────────
  const [passengers, setPassengers] = useState(4);
  const [luggageKg, setLuggageKg] = useState(30);
  const [obstacleType, setObstacleType] = useState<'standard' | 'monster' | 'pothole' | 'ramp'>('monster');

  // Resolve base unladen ground clearance
  const baseGroundClearance = useMemo(() => {
    const nameLower = (car?.name || '').toLowerCase();
    for (const [key, val] of Object.entries(MODEL_CLEARANCE_OVERRIDES)) {
      if (nameLower.includes(key)) return val;
    }
    return ESTIMATED_CLEARANCE[car?.bodyType || 'default'] || 170;
  }, [car]);

  // Spring compression physics approximation (in mm)
  // ~4.5mm per adult (70kg), ~1mm per 15kg luggage. Soft suspensions drop more.
  const suspensionDrop = useMemo(() => {
    const isSoftSuspension = ['Maruti Suzuki', 'Hyundai', 'Renault'].includes(car?.brand || '');
    const stiffnessFactor = isSoftSuspension ? 1.2 : 0.95;
    const passengerWeight = (passengers - 1) * 68; // Driver already in unladen spec
    const totalAddedKg = Math.max(0, passengerWeight) + luggageKg;
    return Math.round((totalAddedKg / 16) * stiffnessFactor);
  }, [passengers, luggageKg, car]);

  const ladenClearance = Math.max(70, baseGroundClearance - suspensionDrop);

  const OBSTACLE_CONFIG = {
    standard: { name: 'Standard City Bump (IRC Norm)', heightMm: 100, desc: 'Regular residential rumble strip or low bump' },
    monster: { name: 'Bengaluru / Pune "Monster" Breaker', heightMm: 165, desc: 'Unscientific tall speed-breaker with steep ramp angle' },
    pothole: { name: 'Monsoon Crater / Waterlogged Pothole', heightMm: 185, desc: 'Deep monsoon trench or jagged asphalt crater' },
    ramp: { name: 'Steep Mall / Society Basement Ramp', heightMm: 145, desc: 'Sharp break-over angle where wheelbase causes middle scrape' }
  };

  const currentObstacle = OBSTACLE_CONFIG[obstacleType];
  const clearanceMargin = ladenClearance - currentObstacle.heightMm;

  let scrapeRisk = 'SAFE';
  let scrapeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let advice = 'No special care needed. Cruise over at moderate speed.';

  if (clearanceMargin < 0) {
    scrapeRisk = 'HIGH SCRAPING DANGER';
    scrapeColor = 'text-rose-700 bg-rose-50 border-rose-200';
    advice = '⚠️ Underbelly / Exhaust / Sump impact almost certain! Must crawl at 5 km/h at a 45° diagonal angle.';
  } else if (clearanceMargin < 20) {
    scrapeRisk = 'MODERATE / CAUTION';
    scrapeColor = 'text-amber-700 bg-amber-50 border-amber-200';
    advice = 'Slow down completely to 10 km/h. Avoid sudden braking directly on top of the bump.';
  }

  // ─── TAB 2: ARAI vs AC City Reality State ────────────────────────────────
  const [acUsage, setAcUsage] = useState<number>(100); // percentage
  const [trafficType, setTrafficType] = useState<'silkboard' | 'city' | 'highway'>('silkboard');
  const [dailyKm, setDailyKm] = useState<number>(35);

  const baseAraiMileage = useMemo(() => {
    const match = (car?.mileage || '').match(/[\d.]+/);
    if (match) return parseFloat(match[0]);
    if (car?.variants && car.variants.length > 0) {
      for (const v of car.variants) {
        const vm = (v.mileage || '').match(/[\d.]+/);
        if (vm) return parseFloat(vm[0]);
      }
    }
    return 18.5; // Indian benchmark default
  }, [car]);

  const realityMileage = useMemo(() => {
    let trafficFactor = 0.65; // Silk board crawl (-35%)
    if (trafficType === 'city') trafficFactor = 0.80; // normal city (-20%)
    if (trafficType === 'highway') trafficFactor = 1.05; // steady 80km/h (+5%)

    // AC penalty: up to -18% in high summer heat
    const acPenalty = (acUsage / 100) * 0.15;
    const finalFactor = Math.max(0.45, trafficFactor - acPenalty);
    return Math.round(baseAraiMileage * finalFactor * 10) / 10;
  }, [baseAraiMileage, trafficType, acUsage]);

  const fuelCostPerMonth = useMemo(() => {
    const fuelPrice = 104; // average metro petrol price
    const monthlyKm = dailyKm * 30;
    const litresNeeded = monthlyKm / (realityMileage || 1);
    return Math.round(litresNeeded * fuelPrice);
  }, [dailyKm, realityMileage]);

  // ─── TAB 3: BH Series (Bharat Plate) Tax Arbitrage ───────────────────────
  const exShowroom = car?.priceRange?.min || car?.priceMin || 900000;
  const stateRtoRate = useMemo(() => {
    if (selectedCity === 'Bangalore') return 0.18; // Karnataka 18%
    if (selectedCity === 'Mumbai' || selectedCity === 'Pune') return 0.12;
    if (selectedCity === 'Chennai') return 0.15;
    if (selectedCity === 'Hyderabad') return 0.14;
    return 0.10; // Delhi / standard
  }, [selectedCity]);

  const stateRtoUpfront = Math.round(exShowroom * stateRtoRate);
  
  // BH Series formula: 
  // Under 10L = 8%, 10L-20L = 10%, Above 20L = 12%
  // Paid in 2-year blocks (2/15th of total tax) * 1.25 multiplier
  const bhTotalRate = exShowroom < 1000000 ? 0.08 : (exShowroom < 2000000 ? 0.10 : 0.12);
  const bhTotalTax = exShowroom * bhTotalRate;
  const bhFirstTwoYearsTax = Math.round((bhTotalTax * 2 / 15) * 1.25);
  const day1CashSaved = Math.max(0, stateRtoUpfront - bhFirstTwoYearsTax);

  // ─── TAB 4: Showroom PDI Checklist ───────────────────────────────────────
  const [pdiChecks, setPdiChecks] = useState<Record<string, boolean>>({
    vinMonth: false,
    odoCheck: false,
    paintSwirls: false,
    tyreDate: false,
    toolkitCheck: false,
    acIdleCheck: false,
    elecCheck: false,
    fastagCheck: false
  });

  const pdiItems = [
    { id: 'vinMonth', label: 'Decode 17-digit VIN code (Ensure manufacturing month is within last 60 days)' },
    { id: 'odoCheck', label: 'Verify Odometer reading is STRICTLY under 50 km (no dealer joyrides)' },
    { id: 'paintSwirls', label: 'Inspect body under bright sunlight for transit scratches & repainted panels' },
    { id: 'tyreDate', label: 'Check 4-digit DOT tyre date code (all 5 tyres must match car age)' },
    { id: 'toolkitCheck', label: 'Verify spare wheel, jack, towing hook, warning triangle & toolkit present' },
    { id: 'acIdleCheck', label: 'Run AC at maximum blower on idle for 5 mins (test rapid cabin chilling)' },
    { id: 'elecCheck', label: 'Test all 4 power windows, touchscreen, reverse camera & all headlamps' },
    { id: 'fastagCheck', label: 'Verify FASTag is pre-affixed and Chassis number matches invoice strictly' },
  ];

  const pdiCount = Object.values(pdiChecks).filter(Boolean).length;
  const pdiScorePercent = Math.round((pdiCount / pdiItems.length) * 100);

  return (
    <div className="bg-white rounded-3xl border border-violet-100 shadow-xl overflow-hidden my-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-radial-gradient from-violet-500/20 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/30 text-violet-300 text-xs font-black uppercase tracking-wider mb-2 border border-violet-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              CarMachi Exclusive &bull; India Road Reality Lab
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              The Indian Road Reality Gauge
            </h2>
            <p className="text-violet-200 text-sm mt-1 max-w-2xl">
              Laboratory figures don’t work on Indian roads. Test {car.name} against real potholes, Silk Board crawls, and RTO tax loopholes.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center gap-3">
            <div className="p-3 bg-violet-500/30 rounded-xl text-violet-300">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-violet-300 font-bold uppercase tracking-wider">Unladen Clearance</div>
              <div className="text-xl font-black text-white">{baseGroundClearance} mm</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mt-6 overflow-x-auto pb-1 scrollbar-hide text-sm font-bold">
          <button
            onClick={() => setActiveTab('ground')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ground'
                ? 'bg-white text-violet-900 shadow-lg'
                : 'bg-white/10 text-violet-200 hover:bg-white/20'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Speed-Breaker & Pothole Simulator
          </button>

          <button
            onClick={() => setActiveTab('mileage')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'mileage'
                ? 'bg-white text-violet-900 shadow-lg'
                : 'bg-white/10 text-violet-200 hover:bg-white/20'
            }`}
          >
            <Fuel className="w-4 h-4" />
            AC & Traffic Reality Meter
          </button>

          <button
            onClick={() => setActiveTab('bhTax')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'bhTax'
                ? 'bg-white text-violet-900 shadow-lg'
                : 'bg-white/10 text-violet-200 hover:bg-white/20'
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            BH Plate vs State Tax Hack
          </button>

          <button
            onClick={() => setActiveTab('pdi')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pdi'
                ? 'bg-white text-violet-900 shadow-lg'
                : 'bg-white/10 text-violet-200 hover:bg-white/20'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Showroom PDI Defense Shield
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-6 md:p-8">
        {/* ─── TAB 1: SPEED BREAKER SIMULATOR ─── */}
        {activeTab === 'ground' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Controls Column */}
              <div className="lg:col-span-5 space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-600" />
                  Load & Road Conditions
                </h3>

                {/* Passenger Slider */}
                <div>
                  <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                    <span>Adult Passengers Inside:</span>
                    <span className="text-violet-600 font-extrabold">{passengers} Adults (avg 68kg)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="w-full accent-violet-600 cursor-pointer h-2 bg-gray-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-semibold">
                    <span>Solo Driver</span>
                    <span>4 Family</span>
                    <span>7 Full Load</span>
                  </div>
                </div>

                {/* Luggage Slider */}
                <div>
                  <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                    <span>Boot Luggage Weight:</span>
                    <span className="text-violet-600 font-extrabold">{luggageKg} kg</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={luggageKg}
                    onChange={(e) => setLuggageKg(Number(e.target.value))}
                    className="w-full accent-violet-600 cursor-pointer h-2 bg-gray-200 rounded-lg"
                  />
                </div>

                {/* Obstacle Selector */}
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">
                    Select Test Obstacle:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(Object.keys(OBSTACLE_CONFIG) as Array<keyof typeof OBSTACLE_CONFIG>).map((key) => {
                      const obs = OBSTACLE_CONFIG[key];
                      const isSelected = obstacleType === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setObstacleType(key)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-violet-300'
                          }`}
                        >
                          <div className="text-xs font-black">{obs.name}</div>
                          <div className={`text-[11px] font-bold mt-1 ${isSelected ? 'text-violet-200' : 'text-gray-400'}`}>
                            Height: {obs.heightMm} mm
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Simulation Result Column */}
              <div className="lg:col-span-7 space-y-6">
                {/* Visual Height Comparison Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-gray-100">
                    <div>
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Unladen vs Laden Clearance</div>
                      <div className="text-2xl font-black text-gray-900 mt-0.5">
                        {baseGroundClearance} mm <span className="text-rose-500 text-base font-bold">(-{suspensionDrop}mm sag)</span> &rarr; <span className="text-violet-700">{ladenClearance} mm</span>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider ${scrapeColor}`}>
                      {scrapeRisk}
                    </div>
                  </div>

                  {/* Graphic Representation Bar */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-gray-600 flex justify-between">
                      <span>Obstacle: {currentObstacle.name} ({currentObstacle.heightMm} mm)</span>
                      <span className={clearanceMargin >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {clearanceMargin >= 0 ? `+${clearanceMargin} mm Clear` : `${clearanceMargin} mm Scraping Deficit!`}
                      </span>
                    </div>

                    {/* Progress representation */}
                    <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden relative flex items-center p-1 border">
                      {/* Obstacle mark */}
                      <div 
                        className="h-full bg-rose-500 rounded-full transition-all duration-300 flex items-center justify-end pr-2 text-[10px] font-bold text-white shadow-inner"
                        style={{ width: `${Math.min(100, (currentObstacle.heightMm / 230) * 100)}%` }}
                      >
                        Bump {currentObstacle.heightMm}mm
                      </div>
                      {/* Car Clearance indicator needle */}
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-violet-700 shadow-lg z-10 transition-all duration-300"
                        style={{ left: `${Math.min(100, (ladenClearance / 230) * 100)}%` }}
                        title={`Laden Clearance: ${ladenClearance}mm`}
                      />
                    </div>
                    <div className="text-[10px] text-gray-400 flex justify-between font-medium">
                      <span>0 mm</span>
                      <span>100 mm (IRC standard)</span>
                      <span>180 mm (Monsoon)</span>
                      <span>230 mm (4x4 SUV)</span>
                    </div>
                  </div>

                  {/* Practical Advice Banner */}
                  <div className={`p-4 rounded-2xl border text-sm font-medium ${scrapeColor}`}>
                    <div className="font-extrabold flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      Machi Verdict on {selectedCity} Roads:
                    </div>
                    {advice}
                  </div>

                  {/* Indian Road Feature Specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Estimated Water Wading</div>
                      <div className="text-base font-black text-gray-800 mt-0.5">~{Math.round(baseGroundClearance * 1.6)} mm</div>
                      <div className="text-[10px] text-gray-500">Monsoon safe zone</div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Suspension Tone</div>
                      <div className="text-base font-black text-gray-800 mt-0.5">
                        {['SUV', 'MUV'].includes(car?.bodyType || '') ? 'Stiff / Controlled' : 'City Soft'}
                      </div>
                      <div className="text-[10px] text-gray-500">{suspensionDrop}mm spring compression</div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Basement Ramp Clearance</div>
                      <div className="text-base font-black text-emerald-700 mt-0.5">
                        {ladenClearance > 160 ? 'Smooth Entry' : 'Crawl at Angle'}
                      </div>
                      <div className="text-[10px] text-gray-500">Breakover angle check</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: ARAI VS AC REALITY METER ─── */}
        {activeTab === 'mileage' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Traffic Condition Inputs */}
              <div className="lg:col-span-5 space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                  <ThermometerSun className="w-5 h-5 text-amber-500" />
                  Your Driving Reality
                </h3>

                {/* Traffic Type buttons */}
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">Commute Traffic Type:</label>
                  <div className="space-y-2">
                    {[
                      { id: 'silkboard', label: 'Bumper-to-Bumper Crawl (Silk Board / WEH)', speed: '0 - 15 km/h', desc: 'Frequent stop-and-go 1st gear driving' },
                      { id: 'city', label: 'Average Metro Commute (Ring Roads)', speed: '20 - 35 km/h', desc: 'Moderate traffic with 3rd-4th gear cruising' },
                      { id: 'highway', label: 'Expressway / Highway (Samruddhi / NE4)', speed: '80 - 100 km/h', desc: 'Continuous 5th/6th gear steady velocity' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTrafficType(t.id as any)}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          trafficType === t.id
                            ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-violet-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{t.label}</div>
                          <div className={`text-[10px] ${trafficType === t.id ? 'text-violet-200' : 'text-gray-400'}`}>{t.desc}</div>
                        </div>
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${trafficType === t.id ? 'bg-violet-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {t.speed}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AC Usage Slider */}
                <div>
                  <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                    <span>AC Blower & Cooling Intensity:</span>
                    <span className="text-amber-600 font-extrabold">{acUsage}% (Full Chilling)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="25"
                    value={acUsage}
                    onChange={(e) => setAcUsage(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-gray-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-semibold">
                    <span>Windows Down (0%)</span>
                    <span>Mild 24°C (50%)</span>
                    <span>Indian Summer 18°C (100%)</span>
                  </div>
                </div>

                {/* Daily Commute */}
                <div>
                  <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                    <span>Daily Driving Distance:</span>
                    <span className="text-violet-600 font-extrabold">{dailyKm} km / day</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="5"
                    value={dailyKm}
                    onChange={(e) => setDailyKm(Number(e.target.value))}
                    className="w-full accent-violet-600 cursor-pointer h-2 bg-gray-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Comparison & Verdict Column */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Lab Claim */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-center">
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">ARAI Laboratory Claim</div>
                      <div className="text-3xl font-black text-gray-400 mt-2 line-through">
                        {baseAraiMileage} kmpl
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1 font-medium">Tested with AC OFF at constant 50 km/h</div>
                    </div>

                    {/* Reality Score */}
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-5 rounded-2xl text-white text-center shadow-lg shadow-violet-200">
                      <div className="text-xs text-violet-200 font-bold uppercase tracking-wider">Expected Indian Reality</div>
                      <div className="text-3xl font-black mt-2 text-white">
                        {realityMileage} kmpl
                      </div>
                      <div className="text-[11px] text-violet-200 mt-1 font-bold">
                        {realityMileage < baseAraiMileage ? `-${Math.round((1 - realityMileage/baseAraiMileage)*100)}% Traffic & AC Penalty` : 'Highway Peak Efficiency'}
                      </div>
                    </div>
                  </div>

                  {/* Monthly Bill Projection */}
                  <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-amber-800 font-bold uppercase tracking-wider">Actual Monthly Fuel Budget</div>
                      <div className="text-2xl font-black text-amber-900 mt-0.5">
                        {formatPrice(fuelCostPerMonth)} / month
                      </div>
                      <div className="text-xs text-amber-700 mt-1">
                        Based on {dailyKm * 30} km/month in {selectedCity} with 100% AC on
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <span className="inline-block bg-white text-amber-800 text-xs font-black px-3 py-1.5 rounded-full border border-amber-200 shadow-sm">
                        ₹{(fuelCostPerMonth / (dailyKm * 30)).toFixed(1)} / km Real Running Cost
                      </span>
                    </div>
                  </div>

                  {/* Reality Explanation */}
                  <div className="text-sm text-gray-600 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="font-extrabold text-gray-900 flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4 text-violet-600" />
                      Why does ARAI claim differ from Indian roads?
                    </div>
                    <p className="text-xs leading-relaxed text-gray-600">
                      ARAI fuel figures are conducted on flat dyno rollers in laboratory conditions without passenger loads, gradient climbs, or high blower air-conditioning in 42°C Indian heat. In real stop-and-go Bengaluru or Mumbai traffic, idling and 1st-gear clutch slippage reduce real-world range by up to 35%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: BH SERIES VS STATE TAX ─── */}
        {activeTab === 'bhTax' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="bg-blue-500/30 text-blue-200 text-xs font-black uppercase px-2.5 py-1 rounded-full border border-blue-400/30">
                  Government of India Tax Reform
                </span>
                <h3 className="text-2xl font-black">Bharat (BH) Series Registration Arbitrage</h3>
                <p className="text-blue-200 text-xs max-w-xl">
                  Eligible employees in Defence, Central/State Govt, and Private Companies with offices in 4+ States/UTs can bypass state road taxes.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[200px]">
                <div className="text-[10px] text-blue-200 uppercase font-bold">Immediate Day-1 Cash Kept</div>
                <div className="text-3xl font-black text-emerald-400 mt-1">
                  +{formatPrice(day1CashSaved)}
                </div>
                <div className="text-[10px] text-blue-200 mt-0.5">Kept in your savings account</div>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Normal State RTO */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-gray-100">
                  <div>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">State RTO Plate</span>
                    <h4 className="text-lg font-black text-gray-900 mt-1">{selectedCity} Standard Tax</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-gray-400">Rate: {(stateRtoRate * 100).toFixed(0)}% Upfront</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-500">Ex-Showroom Price:</span>
                    <span className="font-bold text-gray-800">{formatPrice(exShowroom)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-500">Day 1 Road Tax Paid:</span>
                    <span className="font-black text-rose-600">{formatPrice(stateRtoUpfront)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-500">Relocation Transfer:</span>
                    <span className="font-bold text-gray-800">Requires NOC & Double Tax Refund hassle</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Tax Tenure:</span>
                    <span className="font-bold text-gray-800">15 Years Lumpsum Upfront</span>
                  </div>
                </div>
              </div>

              {/* BH Series */}
              <div className="bg-white p-6 rounded-2xl border-2 border-emerald-500 shadow-md shadow-emerald-50 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                  Recommended
                </div>

                <div className="flex items-center justify-between border-b pb-3 border-gray-100">
                  <div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Central BH Series</span>
                    <h4 className="text-lg font-black text-gray-900 mt-1">Bi-Annual Instalment Tax</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-600">Rate: {(bhTotalRate * 100).toFixed(0)}% split bi-annually</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-500">Day 1 Road Tax Paid:</span>
                    <span className="font-black text-emerald-600">{formatPrice(bhFirstTwoYearsTax)} (Only for 2 yrs)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-500">Recurring Payment:</span>
                    <span className="font-bold text-gray-800">{formatPrice(bhFirstTwoYearsTax)} every 24 months</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-500">Interstate Transfer:</span>
                    <span className="font-bold text-emerald-700">100% Free across all India (No NOC required)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Day 1 Liquidity Advantage:</span>
                    <span className="font-black text-emerald-700">+{formatPrice(day1CashSaved)} in bank</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Eligibility Note */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Are you eligible for BH Series?</span>
                <p className="mt-0.5 text-blue-800">
                  You are eligible if you are an employee of Central/State Government, Defence, Banks, or working in a Private Company with registered offices or branches in 4 or more States/Union Territories (Form 60 required from employer).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: SHOWROOM PDI DEFENSE SHIELD ─── */}
        {activeTab === 'pdi' && (
          <div className="space-y-6 animate-fade-in">
            {/* Progress Header */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">Showroom Pre-Delivery Inspection (PDI) Shield</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Never sign the RTO or registration papers before completing these 8 critical checks on the dealer stockyard floor!
                </p>
              </div>

              {/* Progress Ring / Bar */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-gray-400 font-bold uppercase">Inspection Progress</div>
                  <div className="text-xl font-black text-violet-700">{pdiCount} of {pdiItems.length} Checked</div>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-violet-100 flex items-center justify-center font-black text-sm text-violet-700">
                  {pdiScorePercent}%
                </div>
              </div>
            </div>

            {/* Checkboxes List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pdiItems.map((item) => {
                const isChecked = !!pdiChecks[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() => setPdiChecks(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isChecked
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-violet-300'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                      isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 bg-white'
                    }`}>
                      {isChecked && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-bold leading-relaxed">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dealer Defense Note */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-amber-950">Machi Dealer Golden Rule:</span>
                <p className="mt-0.5 text-amber-900 leading-relaxed">
                  Dealers often push cars that have been parked in open stockyards through harsh monsoons or scorching sun for 4-6 months. Always decode the 10th and 19th VIN characters. If the manufacturing date is older than 90 days, demand a ₹25,000 - ₹50,000 additional inventory discount!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndianRoadRealityLab;
