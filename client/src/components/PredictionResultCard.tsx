import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RadarChart from './RadarChart';
import { Heart, CheckCircle2, ShieldCheck, Wrench, Fuel, IndianRupee, Sparkles } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';
import { isCarInGarage, saveToGarage, removeFromGarage } from '../utils/garageStore';
import { motion } from 'framer-motion';

interface PredictionResultProps {
  car: any;
  recommendedVariant?: any;
  score: number;
  explanation: string;
  radarScores: any;
  price: string;
  imageUrl: string;
  specialFeatures?: any[];
  keyHighlights?: string[];
  runningCost?: {
    monthlyFuel: number;
    costPerKm: number;
    mileage: string;
  };
  factors?: {
    serviceNetwork: number;
    resaleValue: number;
    runningCost: number;
    safety: number;
    performance: number;
    engineLongevity: number;
    userReviews: number;
    valueForMoney: number;
  };
}

const PredictionResultCard: React.FC<PredictionResultProps & { index?: number }> = ({ 
  car,
  recommendedVariant,
  score, 
  explanation, 
  radarScores, 
  price, 
  imageUrl,
  specialFeatures,
  keyHighlights,
  runningCost,
  factors,
  index = 0
}) => {
  const carId = car?.id || 'car';
  const [inGarage, setInGarage] = useState(false);

  useEffect(() => {
    setInGarage(isCarInGarage(carId));
    const handleSync = () => setInGarage(isCarInGarage(carId));
    window.addEventListener('garage-updated', handleSync);
    return () => window.removeEventListener('garage-updated', handleSync);
  }, [carId]);

  const toggleGarage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inGarage) {
      removeFromGarage(carId);
    } else {
      saveToGarage({
        id: carId,
        name: car?.name || 'Car',
        brand: car?.brand || 'Brand',
        priceMin: car?.priceRange?.min || 700000,
        priceMax: car?.priceRange?.max || 1200000,
        imageUrl: imageUrl || '',
        bodyType: car?.bodyType || 'SUV'
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.15, duration: 0.5, type: "spring", bounce: 0.4 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-gray-100 overflow-hidden mb-8"
    >
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-violet-50 via-fuchsia-50 to-indigo-50 px-6 py-3 border-b border-violet-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <motion.span 
            initial={{ rotate: -5 }}
            animate={{ rotate: 5 }}
            transition={{ repeat: Infinity, repeatType: "mirror", duration: 1 }}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow-md"
          >
            Top Match
          </motion.span>
          <span className="text-sm font-semibold text-violet-900">
            Recommended Trim: <span className="font-bold border-b-2 border-fuchsia-300 pb-0.5">{recommendedVariant?.name || 'VXi / SX'}</span>
          </span>
        </div>
        <div className="text-xs text-blue-700 font-medium flex items-center space-x-1">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>Personalized for your Indian city commute</span>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image & Quick Specs */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="relative aspect-[16/10] bg-gray-100 rounded-xl overflow-hidden mb-4 border border-gray-100 shadow-inner">
                {imageUrl ? (
                  <img src={imageUrl} alt={car?.name || 'Car'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Car Image</div>
                )}
                
                {/* Garage Bookmark Button */}
                <button
                  onClick={toggleGarage}
                  className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all ${inGarage ? 'bg-rose-500 text-white' : 'bg-white/90 text-gray-600 hover:text-rose-500'}`}
                  title={inGarage ? "Remove from Garage" : "Add to Garage"}
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>
              </div>

              {/* Variant Specs */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Powertrain:</span>
                  <span className="font-semibold text-gray-800">{recommendedVariant?.fuelType || 'Petrol'} &bull; {recommendedVariant?.transmission || 'Manual'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Certified Mileage:</span>
                  <span className="font-bold text-green-700">{runningCost?.mileage || recommendedVariant?.mileage || '18.5 kmpl'}</span>
                </div>
                {recommendedVariant?.power && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Engine Output:</span>
                    <span className="font-semibold text-gray-800">{recommendedVariant.power} / {recommendedVariant.torque || ''}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Airbags / Safety:</span>
                  <span className="font-semibold text-gray-800">{recommendedVariant?.airbags || 6} Airbags &bull; ABS</span>
                </div>
              </div>

              {/* Running cost pill */}
              {runningCost && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-emerald-900 text-xs">
                  <div className="font-bold flex items-center space-x-1 mb-1">
                    <Fuel className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Estimated Running Cost</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Fuel:</span>
                    <span className="font-bold">₹{runningCost.monthlyFuel.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Cost per km:</span>
                    <span className="font-bold">₹{runningCost.costPerKm}/km</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Link 
                to={`/car/${carId}`} 
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors"
              >
                View Full Variant Specs &rarr;
              </Link>
            </div>
          </div>

          {/* Right Column: Reasoning, Factors & Radar */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div>
              {/* Header Title & Score */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">{car?.brand} &bull; {car?.bodyType}</span>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{car?.name}</h3>
                  <p className="text-xl font-extrabold text-blue-600 mt-0.5">
                    {recommendedVariant?.priceExShowroom ? formatPrice(recommendedVariant.priceExShowroom) : price}
                    <span className="text-xs font-normal text-gray-500 ml-1.5">(Ex-Showroom)</span>
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl text-center shadow-sm">
                  <span className="block text-[10px] uppercase font-bold tracking-wider opacity-90">CarMachi Match</span>
                  <span className="text-2xl font-black">{score}%</span>
                </div>
              </div>

              {/* Natural Language Explanation Box */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-1.5 flex items-center space-x-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>Why CarMachi Recommends This Car & Variant</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {explanation}
                </p>
              </div>

              {/* Variant Highlight Features */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Special Features in {recommendedVariant?.name || 'this variant'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(keyHighlights && keyHighlights.length > 0 ? keyHighlights : [
                    "Touchscreen Infotainment", "Reverse Parking Camera", "Rear AC Vents", "Cruise Control"
                  ]).map((feat: string, i: number) => (
                    <span key={i} className="inline-flex items-center space-x-1 bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg">
                      <span className="text-blue-600 font-bold">&#10003;</span>
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Multi-Factor Score Bars */}
              {factors && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-6">
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <div className="text-gray-500 flex items-center space-x-1 mb-1">
                      <Wrench className="h-3 w-3 text-blue-600" />
                      <span>Service Network</span>
                    </div>
                    <div className="font-bold text-gray-900 text-sm">{factors.serviceNetwork}/100</div>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <div className="text-gray-500 flex items-center space-x-1 mb-1">
                      <IndianRupee className="h-3 w-3 text-green-600" />
                      <span>Resale Value</span>
                    </div>
                    <div className="font-bold text-gray-900 text-sm">{factors.resaleValue}/100</div>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <div className="text-gray-500 flex items-center space-x-1 mb-1">
                      <ShieldCheck className="h-3 w-3 text-amber-600" />
                      <span>Safety Rating</span>
                    </div>
                    <div className="font-bold text-gray-900 text-sm">{factors.safety}/100</div>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <div className="text-gray-500 flex items-center space-x-1 mb-1">
                      <Fuel className="h-3 w-3 text-purple-600" />
                      <span>Running Cost</span>
                    </div>
                    <div className="font-bold text-gray-900 text-sm">{factors.runningCost}/100</div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Row: Radar & Action */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 flex-shrink-0">
                  <RadarChart scores={radarScores} />
                </div>
                <div className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700 block mb-0.5">5-Factor Performance Radar</span>
                  <span>Safety, Fuel Economy, Performance, Comfort, Value</span>
                </div>
              </div>

              <div className="flex space-x-3 w-full sm:w-auto">
                <Link
                  to={`/valuation`}
                  state={{ carId: carId, originalPrice: recommendedVariant?.priceExShowroom }}
                  className="flex-1 sm:flex-initial text-center bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors border border-blue-200"
                >
                  Calculate Resale
                </Link>
                <Link
                  to={`/car/${carId}`}
                  className="flex-1 sm:flex-initial text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 px-5 rounded-xl shadow-sm transition-colors"
                >
                  Explore Variants
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PredictionResultCard;
