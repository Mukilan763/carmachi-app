import React, { useState, useEffect } from 'react';
import VoiceTextInput from '../components/VoiceTextInput';
import PredictionResultCard from '../components/PredictionResultCard';
import { formatPriceRange } from '../utils/formatPrice';
import { Sparkles, Mic, Sliders, MapPin, Fuel, Shield, IndianRupee, Compass } from 'lucide-react';
import { getCity } from '../utils/locationStore';

const Prediction: React.FC = () => {
  const [inputType, setInputType] = useState<'text' | 'form'>('text');
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // Form states
  const [budget, setBudget] = useState(12);
  const [bodyType, setBodyType] = useState('SUV');
  const [city, setCity] = useState(getCity());
  const [fuelPreference, setFuelPreference] = useState('Any');
  const [transmission, setTransmission] = useState('Any');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(['safety', 'resaleValue']);

  useEffect(() => {
    const handleLocationUpdate = () => {
      setCity(getCity());
    };
    window.addEventListener('location-updated', handleLocationUpdate);
    return () => window.removeEventListener('location-updated', handleLocationUpdate);
  }, []);

  const quickPrompts = [
    `Looking for a safe automatic SUV under 15 lakhs for ${city} city traffic`,
    `Best mileage CNG car for daily 50km commute in ${city} under 9 lakhs`,
    `Spacious 7-seater family car in ${city} with good resale and low maintenance`,
    `Premium electric car for daily office commute in ${city} under 20 lakhs`
  ];

  const togglePriority = (p: string) => {
    if (selectedPriorities.includes(p)) {
      setSelectedPriorities(selectedPriorities.filter(item => item !== p));
    } else {
      setSelectedPriorities([...selectedPriorities, p]);
    }
  };

  const handlePredict = async (customQuery?: string) => {
    setIsLoading(true);
    const queryToUse = customQuery || textInput;

    try {
      const payload = inputType === 'text' || customQuery
        ? { 
            textQuery: queryToUse,
            city
          }
        : {
            budgetMin: Math.max(0, (budget - 3) * 100000),
            budgetMax: (budget + 3) * 100000,
            bodyType,
            city,
            fuelPreference,
            transmission,
            priorities: selectedPriorities
          };

      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      const mapped = (data.results || []).map((r: any) => ({
        car: r.car,
        recommendedVariant: r.recommendedVariant,
        carName: r.car?.name || 'Car Recommendation',
        score: r.overallScore || 85,
        explanation: r.whyRecommended || 'Great match for your selected criteria.',
        price: formatPriceRange(r.car?.priceRange?.min || 700000, r.car?.priceRange?.max || 1200000),
        imageUrl: r.car?.images?.[0]?.url || '',
        specialFeatures: r.specialFeatures || [],
        keyHighlights: r.keyHighlights || [],
        runningCost: r.runningCost,
        factors: r.factors,
        radarScores: r.radarScores || {
          performance: 8,
          comfort: 8,
          economy: 8,
          safety: 8,
          value: 8
        }
      }));

      setResults(mapped);
    } catch (err) {
      console.error("Prediction failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-blue-100">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span>India's Most Accurate Car Recommendation AI</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
          Car<span className="text-blue-600">Machi</span> Prediction Center
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          Tailored to your Indian city, service network reach, real owner experiences, and 5-year running & resale calculations.
        </p>
      </div>

      {/* Input Selection Card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm mb-10 border border-gray-100">
        {/* Toggle Modes */}
        <div className="flex justify-center mb-8 border-b border-gray-100">
          <div className="flex space-x-8">
            <button
              className={`pb-4 text-base font-bold flex items-center space-x-2 border-b-2 transition-all ${inputType === 'text' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              onClick={() => setInputType('text')}
            >
              <Mic className="h-4 w-4" />
              <span>Voice / Natural Text</span>
            </button>
            <button
              className={`pb-4 text-base font-bold flex items-center space-x-2 border-b-2 transition-all ${inputType === 'form' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              onClick={() => setInputType('form')}
            >
              <Sliders className="h-4 w-4" />
              <span>Manual Selectors</span>
            </button>
          </div>
        </div>

        {inputType === 'text' ? (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-800">
                  Speak or Type your requirements in English or Tanglish
                </label>
                <span className="text-xs text-blue-600 font-medium flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>City: {city}</span>
                </span>
              </div>
              <VoiceTextInput 
                value={textInput} 
                onChange={setTextInput} 
                placeholder="Click the microphone or type: e.g. 'I need a safe SUV under 15 lakhs in Bangalore with low maintenance'..."
              />
            </div>

            {/* Quick Inspiration chips */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
                <Compass className="h-3.5 w-3.5 text-blue-600" />
                <span>Try one of these sample prompts:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTextInput(prompt);
                      handlePredict(prompt);
                    }}
                    className="text-xs text-left bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-600 py-1.5 px-3 rounded-lg border border-gray-200 transition-colors"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* City */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  City (Service Density)
                </label>
                <select 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-white border text-sm font-medium"
                >
                  {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi', 'Coimbatore', 'Noida', 'Gurgaon'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Body Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Body Style
                </label>
                <select 
                  value={bodyType} 
                  onChange={(e) => setBodyType(e.target.value)}
                  className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-white border text-sm font-medium"
                >
                  <option value="Any">Any Body Type</option>
                  <option value="SUV">SUV (Compact & Mid-Size)</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Sedan">Sedan</option>
                  <option value="MUV">MUV / 7-Seater MPV</option>
                </select>
              </div>

              {/* Fuel Preference */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Fuel Preference
                </label>
                <select 
                  value={fuelPreference} 
                  onChange={(e) => setFuelPreference(e.target.value)}
                  className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-white border text-sm font-medium"
                >
                  <option value="Any">Any Fuel Type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG (Economical)</option>
                  <option value="Electric">Electric (EV)</option>
                </select>
              </div>

              {/* Transmission */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Transmission
                </label>
                <select 
                  value={transmission} 
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-white border text-sm font-medium"
                >
                  <option value="Any">Any Transmission</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic (AMT / CVT / DCT)</option>
                </select>
              </div>

              {/* Budget Slider */}
              <div className="sm:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                    Target Budget
                  </label>
                  <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                    ₹ {budget} Lakhs (± ₹3L Range)
                  </span>
                </div>
                <input 
                  type="range" min="4" max="45" value={budget} 
                  onChange={(e) => setBudget(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-medium">
                  <span>₹4 Lakh</span>
                  <span>₹15 Lakh</span>
                  <span>₹30 Lakh</span>
                  <span>₹45+ Lakh</span>
                </div>
              </div>
            </div>

            {/* Priorities checkboxes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2.5">
                Key Buying Priorities (Choose all that matter to you)
              </label>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: 'safety', label: '🛡️ 5-Star Safety & Airbags' },
                  { id: 'mileage', label: '⛽ High Mileage (kmpl)' },
                  { id: 'resaleValue', label: '📈 High Resale Value' },
                  { id: 'serviceNetwork', label: '🔧 Widespread Service Centers' },
                  { id: 'performance', label: '🏎️ Peppy Performance' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => togglePriority(item.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedPriorities.includes(item.id)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit Predict button */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => handlePredict()}
            disabled={isLoading || (inputType === 'text' && textInput.trim().length < 3)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 px-12 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed flex items-center justify-center mx-auto space-x-2.5 text-base"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Calculating Predictions...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Get Instant AI Prediction</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Feed */}
      {results.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                Recommended Cars For You ({results.length})
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Ranked by our multi-variate score incorporating safety, service touchpoints in {city}, running costs, and resale retention.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {results.map((result, idx) => (
              <PredictionResultCard key={result.car?.id || idx} index={idx} {...result} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Prediction;
