import React, { useState, useEffect } from 'react';
import { carsAPI } from '../utils/api';
import IndianRoadRealityLab from '../components/IndianRoadRealityLab';
import { Sparkles, Search, Car, MapPin } from 'lucide-react';
import { getCity } from '../utils/locationStore';

const RoadLab: React.FC = () => {
  const [cars, setCars] = useState<any[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState(getCity());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carsAPI.getAll()
      .then((data) => {
        setCars(data || []);
        if (data && data.length > 0) {
          // Default to a popular car like Creta, Nexon, or Alto
          const defaultCar = data.find((c: any) => c.name.toLowerCase().includes('creta')) || data[0];
          setSelectedCarId(defaultCar.id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const handleLocation = () => setCity(getCity());
    window.addEventListener('location-updated', handleLocation);
    return () => window.removeEventListener('location-updated', handleLocation);
  }, []);

  const selectedCar = cars.find((c: any) => c.id === selectedCarId) || cars[0];

  const filteredCars = cars.filter((c: any) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.brand.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            CarMachi Exclusive Innovation
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Indian Road Reality Lab
          </h1>
          <p className="text-gray-600 text-sm md:text-base mt-1 max-w-2xl font-medium">
            Simulate real speed breakers, AC traffic fuel penalties, BH series road tax savings, and pre-delivery inspection checklists for any Indian car.
          </p>
        </div>

        {/* Car Switcher Dropdown / Search */}
        <div className="w-full md:w-80 relative">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
            Select Car to Test:
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search e.g. Nexon, Creta, Swift..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
            />
          </div>

          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 overflow-hidden divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {filteredCars.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCarId(c.id);
                    setSearchQuery('');
                  }}
                  className="w-full p-3 text-left hover:bg-violet-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-gray-900">{c.name}</div>
                    <div className="text-[10px] text-gray-400">{c.brand} &bull; {c.bodyType}</div>
                  </div>
                  <span className="text-xs font-black text-violet-600">Test &rarr;</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto" />
          <div className="mt-4 text-gray-500 font-bold">Calibrating Indian Road Reality Lab...</div>
        </div>
      ) : selectedCar ? (
        <div>
          {/* Active Car Info Strip */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 font-black text-xl">
                🚗
              </div>
              <div>
                <div className="text-xs text-gray-400 font-bold uppercase">{selectedCar.brand} &bull; {selectedCar.bodyType}</div>
                <h3 className="text-lg font-black text-gray-900">{selectedCar.name}</h3>
              </div>
            </div>

            {/* Quick tags */}
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1 rounded-full border border-emerald-200">
                Claimed: {selectedCar.mileage || '18.5 Kmpl'}
              </span>
              <span className="bg-violet-50 text-violet-700 text-xs font-black px-3 py-1 rounded-full border border-violet-200">
                City: {city}
              </span>
            </div>
          </div>

          {/* Interactive Lab Component */}
          <IndianRoadRealityLab car={selectedCar} selectedCity={city} />
        </div>
      ) : null}
    </div>
  );
};

export default RoadLab;
