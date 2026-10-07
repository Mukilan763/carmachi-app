import React, { useState, useEffect } from 'react';
import { BarChart2, Fuel, IndianRupee, Calculator, TrendingDown, Zap, Info } from 'lucide-react';
import { valuationAPI } from '../utils/api';
import { formatPrice, formatCost } from '../utils/formatPrice';
import { getCity, setCity as setGlobalCity } from '../utils/locationStore';

const BRANDS = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Toyota', 'Honda', 'Kia', 'MG', 'Volkswagen', 'Skoda', 'Renault', 'Nissan', 'Citroen', 'BYD', 'Jeep'];
const SEGMENTS = ['Hatchback', 'SUV', 'Sedan', 'MUV'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric'];
const CONDITIONS = ['Excellent', 'Good', 'Average', 'Below Average'];
const STATES = ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Gujarat', 'Uttar Pradesh', 'Kerala', 'West Bengal', 'Rajasthan', 'Telangana'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];

const Valuation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'resale' | 'running'>('resale');

  // Resale form
  const [brand, setBrand] = useState('Maruti Suzuki');
  const [segment, setSegment] = useState('SUV');
  const [fuelType, setFuelType] = useState('Petrol');
  const [yearOfPurchase, setYearOfPurchase] = useState(2022);
  const [kmDriven, setKmDriven] = useState(40000);
  const [city, setLocalCity] = useState(getCity());

  useEffect(() => {
    const handleLocation = () => setLocalCity(getCity());
    window.addEventListener('location-updated', handleLocation);
    if (!CITIES.includes(getCity())) CITIES.push(getCity());
    return () => window.removeEventListener('location-updated', handleLocation);
  }, []);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalCity(e.target.value);
    setGlobalCity(e.target.value);
  };

  const [condition, setCondition] = useState('Good');
  const [originalPrice, setOriginalPrice] = useState(1200000);
  const [resaleResult, setResaleResult] = useState<any>(null);
  const [resaleLoading, setResaleLoading] = useState(false);

  // Running cost form
  const [dailyKm, setDailyKm] = useState(30);
  const [mileage, setMileage] = useState(18);
  const [rcFuelType, setRcFuelType] = useState('Petrol');
  const [state, setState] = useState('Karnataka');
  const [runningResult, setRunningResult] = useState<any>(null);
  const [runningLoading, setRunningLoading] = useState(false);

  const handleResale = async () => {
    setResaleLoading(true);
    try {
      const res = await valuationAPI.getResaleValue({
        brand, segment, fuelType, yearOfPurchase, kilometersDriven: kmDriven,
        city, condition, originalPrice,
      });
      setResaleResult(res);
    } catch (err) {
      console.error('Resale error:', err);
    } finally {
      setResaleLoading(false);
    }
  };

  const handleRunningCost = async () => {
    setRunningLoading(true);
    try {
      const res = await valuationAPI.getRunningCost({
        dailyKm, mileage, fuelType: rcFuelType, state,
      });
      setRunningResult(res);
    } catch (err) {
      console.error('Running cost error:', err);
    } finally {
      setRunningLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
          Valuation &amp; Cost Calculator
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Check your car's resale value in the Indian market or estimate your monthly and yearly running costs.
        </p>
      </div>

      {/* Tab Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-xl p-1 inline-flex">
          <button
            onClick={() => setActiveTab('resale')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'resale' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <TrendingDown className="h-4 w-4" />
            <span>Resale Value</span>
          </button>
          <button
            onClick={() => setActiveTab('running')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'running' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Fuel className="h-4 w-4" />
            <span>Running Cost</span>
          </button>
        </div>
      </div>

      {/* ========== RESALE TAB ========== */}
      {activeTab === 'resale' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <IndianRupee className="h-5 w-5 text-green-600" />
            <span>Estimate Resale Value</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Brand</label>
              <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Segment</label>
              <select value={segment} onChange={e => setSegment(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Fuel Type</label>
              <select value={fuelType} onChange={e => setFuelType(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Year of Purchase</label>
              <select value={yearOfPurchase} onChange={e => setYearOfPurchase(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                {Array.from({ length: 9 }, (_, i) => currentYear - i).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Km Driven: {kmDriven.toLocaleString('en-IN')} km</label>
              <input type="range" min={5000} max={200000} step={5000} value={kmDriven} onChange={e => setKmDriven(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5"><span>5,000</span><span>1,00,000</span><span>2,00,000</span></div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">City</label>
              <select value={city} onChange={handleCityChange} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Condition</label>
              <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Original Ex-Showroom Price (₹)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={e => setOriginalPrice(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-blue-500 focus:border-blue-500"
                min={100000} step={50000}
              />
              <span className="text-[11px] text-gray-400 mt-0.5 block">{formatPrice(originalPrice)}</span>
            </div>
          </div>

          <button
            onClick={handleResale}
            disabled={resaleLoading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors disabled:bg-gray-300 flex items-center justify-center space-x-2"
          >
            {resaleLoading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Calculator className="h-4 w-4" />}
            <span>{resaleLoading ? 'Calculating...' : 'Calculate Resale Value'}</span>
          </button>

          {/* Resale Result */}
          {resaleResult && (
            <div className="mt-8 border-t border-gray-100 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-green-50 rounded-xl p-5 border border-green-100 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Estimated Resale Value</p>
                  <p className="text-3xl font-black text-green-700">{formatPrice(resaleResult.estimatedResaleValue)}</p>
                  <p className="text-xs text-green-600 mt-1">Range: {formatPrice(resaleResult.range[0])} – {formatPrice(resaleResult.range[1])}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-5 border border-orange-100 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-700 mb-1">Total Depreciation</p>
                  <p className="text-3xl font-black text-orange-700">{resaleResult.depreciationPercentage}%</p>
                  <p className="text-xs text-orange-600 mt-1">Lost: {formatPrice(originalPrice - resaleResult.estimatedResaleValue)}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">Brand Retention Factor</p>
                  <p className="text-3xl font-black text-blue-700">{resaleResult.brandMultiplier?.toFixed(2)}x</p>
                  <p className="text-xs text-blue-600 mt-1">{brand} | {segment}</p>
                </div>
              </div>

              {/* Depreciation Curve */}
              {resaleResult.depreciationCurve && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center space-x-1">
                    <TrendingDown className="h-4 w-4 text-orange-500" />
                    <span>7-Year Depreciation Curve</span>
                  </h3>
                  <div className="flex items-end space-x-2 h-36">
                    {resaleResult.depreciationCurve.map((pt: any) => (
                      <div key={pt.year} className="flex-1 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-gray-600 mb-1">{pt.percentage}%</span>
                        <div
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-md"
                          style={{ height: `${Math.max(10, pt.percentage)}%` }}
                        />
                        <span className="text-[10px] text-gray-500 mt-1">Yr {pt.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {resaleResult.tips && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 flex items-center space-x-1"><Info className="h-3.5 w-3.5" /><span>Tips to Maximize Resale</span></h4>
                  <ul className="space-y-1">
                    {resaleResult.tips.map((tip: string, i: number) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start space-x-2">
                        <span className="text-green-500 font-bold mt-0.5">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========== RUNNING COST TAB ========== */}
      {activeTab === 'running' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Fuel className="h-5 w-5 text-purple-600" />
            <span>Running Cost Estimator</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Daily Driving: {dailyKm} km/day</label>
              <input type="range" min={10} max={100} value={dailyKm} onChange={e => setDailyKm(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5"><span>10 km</span><span>50 km</span><span>100 km</span></div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Car Mileage (kmpl): {mileage} kmpl</label>
              <input type="range" min={8} max={35} step={0.5} value={mileage} onChange={e => setMileage(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5"><span>8 kmpl</span><span>20 kmpl</span><span>35 kmpl</span></div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Fuel Type</label>
              <select value={rcFuelType} onChange={e => setRcFuelType(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">State (for fuel prices)</label>
              <select value={state} onChange={e => setState(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={handleRunningCost}
            disabled={runningLoading}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-colors disabled:bg-gray-300 flex items-center justify-center space-x-2"
          >
            {runningLoading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Zap className="h-4 w-4" />}
            <span>{runningLoading ? 'Calculating...' : 'Calculate Running Cost'}</span>
          </button>

          {/* Running Cost Result */}
          {runningResult && (
            <div className="mt-8 border-t border-gray-100 pt-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700 mb-1">Monthly Fuel</p>
                  <p className="text-2xl font-black text-purple-700">{formatCost(runningResult.fuelCostPerMonth)}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-1">Total per Month</p>
                  <p className="text-2xl font-black text-blue-700">{formatCost(runningResult.totalPerMonth)}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-green-700 mb-1">Cost per Km</p>
                  <p className="text-2xl font-black text-green-700">₹{runningResult.costPerKm}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-orange-700 mb-1">5-Year Total</p>
                  <p className="text-2xl font-black text-orange-700">{formatPrice(runningResult.fiveYearTotalCost)}</p>
                </div>
              </div>

              {/* Detailed breakdown */}
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Yearly Cost Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">⛽ Annual Fuel Cost</span><span className="font-bold text-gray-900">{formatCost(runningResult.fuelCostPerYear)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">🛡️ Insurance (per year)</span><span className="font-bold text-gray-900">{formatCost(runningResult.insurancePerYear)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">🔧 Maintenance (per year)</span><span className="font-bold text-gray-900">{formatCost(runningResult.maintenancePerYear)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">🅿️ Misc (parking, tolls, wash)</span><span className="font-bold text-gray-900">{formatCost(runningResult.miscPerYear)}</span></div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                    <span className="text-gray-800 font-bold">Total Annual Cost</span>
                    <span className="font-black text-blue-700 text-lg">{formatCost(runningResult.totalPerYear)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">Fuel rate used: ₹{runningResult.fuelRateUsed}/litre ({state})</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Valuation;
