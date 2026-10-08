import React, { useState, useEffect } from 'react';
import { carsAPI } from '../utils/api';
import { formatPrice } from '../utils/formatPrice';
import { Search, Loader2, Scale, X, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Compare = () => {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedCars, setSelectedCars] = useState<any[]>([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await carsAPI.getAll();
        setCars(data);
      } catch (err) {
        console.error('Failed to load cars', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const handleSelectCar = (car: any) => {
    if (selectedCars.length < 3 && !selectedCars.find(c => c.id === car.id)) {
      setSelectedCars([...selectedCars, car]);
      setSearchQuery('');
    }
  };

  const handleRemoveCar = (id: string) => {
    setSelectedCars(selectedCars.filter(c => c.id !== id));
  };

  const filteredCars = cars.filter(car => 
    car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.brand.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const getWinner = (specName: string, isHigherBetter: boolean = true) => {
    if (selectedCars.length < 2) return null;
    
    let bestVal = isHigherBetter ? -Infinity : Infinity;
    let winnerId = null;

    selectedCars.forEach(car => {
      let val = 0;
      if (specName === 'price') {
        val = car.priceRange?.min || 0;
      } else if (specName === 'rating') {
        val = car.overallRating || 0;
      } else if (specName === 'mileage') {
        // Extract mileage number from top variant
        const topMileageStr = car.variants?.[0]?.mileage || "0";
        val = parseFloat(topMileageStr.match(/[\d.]+/)?.[0] || "0");
      } else if (specName === 'bootSpace') {
        const bootSpaceStr = car.dimensions?.bootSpace || "0";
        val = parseInt(bootSpaceStr.match(/\d+/)?.[0] || "0");
      }

      if (val === 0) return;

      if (isHigherBetter && val > bestVal) {
        bestVal = val;
        winnerId = car.id;
      } else if (!isHigherBetter && val < bestVal) {
        bestVal = val;
        winnerId = car.id;
      }
    });

    return winnerId;
  };

  const renderCell = (car: any, specName: string, formatFn?: (val: any) => string) => {
    let rawVal: any = null;
    let displayVal = 'N/A';

    if (specName === 'price') {
      rawVal = car.priceRange?.min;
      displayVal = rawVal ? formatPrice(rawVal) : 'N/A';
    } else if (specName === 'rating') {
      rawVal = car.overallRating;
      displayVal = rawVal ? `${rawVal}/5.0` : 'N/A';
    } else if (specName === 'mileage') {
      const topMileageStr = car.variants?.[0]?.mileage || "0";
      const m = parseFloat(topMileageStr.match(/[\d.]+/)?.[0] || "0");
      rawVal = m > 0 ? m : null;
      displayVal = rawVal ? `${rawVal} kmpl` : 'N/A';
    } else if (specName === 'bootSpace') {
      rawVal = car.dimensions?.bootSpace;
      displayVal = rawVal || 'N/A';
    } else if (specName === 'clearance') {
      rawVal = car.dimensions?.groundClearance;
      displayVal = rawVal || 'N/A';
    } else if (specName === 'engine') {
      const topCC = Math.max(...(car.variants?.map((v:any) => v.engineCC || 0) || [0]));
      displayVal = topCC > 0 ? `${topCC} cc` : 'N/A';
    } else if (specName === 'airbags') {
      const topAirbags = Math.max(...(car.variants?.map((v:any) => v.airbags || 0) || [0]));
      displayVal = topAirbags > 0 ? `${topAirbags} Airbags` : 'N/A';
    }

    const isWinner = getWinner(specName, specName !== 'price') === car.id;

    return (
      <td key={car.id} className={`p-4 border-b border-gray-100 text-center ${isWinner ? 'bg-emerald-50/30' : ''}`}>
        <div className={`font-semibold ${isWinner ? 'text-emerald-700' : 'text-gray-800'}`}>
          {displayVal}
          {isWinner && <CheckCircle2 className="inline w-3.5 h-3.5 ml-1.5 text-emerald-500 mb-0.5" />}
        </div>
      </td>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Scale className="w-8 h-8 text-violet-600" />
          <h1 className="text-3xl font-extrabold text-gray-900">Head-to-Head Comparison</h1>
        </div>
        <p className="text-gray-500">Select up to 3 cars to compare specs, prices, and features side-by-side.</p>
      </div>

      {/* Selector Area */}
      {selectedCars.length < 3 && (
        <div className="relative mb-12 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search to add a car to comparison (e.g. Creta)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-violet-500 focus:ring-0 shadow-sm text-gray-900 font-semibold"
            />
          </div>
          
          {searchQuery && (
            <div className="absolute z-20 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {filteredCars.map(car => (
                <button
                  key={car.id}
                  onClick={() => handleSelectCar(car)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 flex items-center gap-3"
                >
                  <img src={car.images[0]?.url || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80'} alt="" className="w-12 h-8 object-cover rounded" />
                  <div>
                    <div className="font-bold text-gray-900">{car.name}</div>
                    <div className="text-xs text-gray-500">{formatPrice(car.priceRange.min)}</div>
                  </div>
                </button>
              ))}
              {filteredCars.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500">No cars found</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Comparison Table */}
      {selectedCars.length > 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="w-48 bg-gray-50 p-6 border-b border-gray-200"></th>
                  {selectedCars.map(car => (
                    <th key={car.id} className="p-6 border-b border-gray-200 w-64 align-top relative group">
                      <button 
                        onClick={() => handleRemoveCar(car.id)}
                        className="absolute top-4 right-4 p-1.5 bg-gray-100 hover:bg-rose-100 hover:text-rose-600 rounded-full text-gray-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <img src={car.images[0]?.url || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80'} alt={car.name} className="w-full h-32 object-cover rounded-xl mb-4" />
                      <div className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">{car.brand}</div>
                      <Link to={`/car/${car.id}`} className="text-xl font-extrabold text-gray-900 hover:text-violet-600 transition-colors block mb-1">
                        {car.name}
                      </Link>
                      <div className="text-sm text-gray-500">{car.bodyType}</div>
                    </th>
                  ))}
                  {/* Empty slots */}
                  {[...Array(3 - selectedCars.length)].map((_, i) => (
                    <th key={`empty-${i}`} className="p-6 border-b border-gray-200 w-64 bg-gray-50/50 border-dashed border-l">
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl p-6 opacity-50">
                        <Search className="w-6 h-6 mb-2" />
                        <span className="text-sm font-semibold">Add car</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="bg-gray-50/50 py-3 px-6 text-xs font-black uppercase tracking-widest text-gray-500">Key Specifications</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-gray-100 text-sm font-semibold text-gray-600 bg-gray-50/30">Starting Price</td>
                  {selectedCars.map(car => renderCell(car, 'price'))}
                  {[...Array(3 - selectedCars.length)].map((_, i) => <td key={i} className="border-b border-gray-100 border-dashed border-l bg-gray-50/50"></td>)}
                </tr>
                <tr>
                  <td className="p-4 border-b border-gray-100 text-sm font-semibold text-gray-600 bg-gray-50/30">Overall Rating</td>
                  {selectedCars.map(car => renderCell(car, 'rating'))}
                  {[...Array(3 - selectedCars.length)].map((_, i) => <td key={i} className="border-b border-gray-100 border-dashed border-l bg-gray-50/50"></td>)}
                </tr>
                <tr>
                  <td className="p-4 border-b border-gray-100 text-sm font-semibold text-gray-600 bg-gray-50/30">Top Mileage (ARAI)</td>
                  {selectedCars.map(car => renderCell(car, 'mileage'))}
                  {[...Array(3 - selectedCars.length)].map((_, i) => <td key={i} className="border-b border-gray-100 border-dashed border-l bg-gray-50/50"></td>)}
                </tr>
                <tr>
                  <td className="p-4 border-b border-gray-100 text-sm font-semibold text-gray-600 bg-gray-50/30">Max Engine CC</td>
                  {selectedCars.map(car => renderCell(car, 'engine'))}
                  {[...Array(3 - selectedCars.length)].map((_, i) => <td key={i} className="border-b border-gray-100 border-dashed border-l bg-gray-50/50"></td>)}
                </tr>
                <tr>
                  <td className="p-4 border-b border-gray-100 text-sm font-semibold text-gray-600 bg-gray-50/30">Boot Space</td>
                  {selectedCars.map(car => renderCell(car, 'bootSpace'))}
                  {[...Array(3 - selectedCars.length)].map((_, i) => <td key={i} className="border-b border-gray-100 border-dashed border-l bg-gray-50/50"></td>)}
                </tr>
                <tr>
                  <td className="p-4 border-b border-gray-100 text-sm font-semibold text-gray-600 bg-gray-50/30">Ground Clearance</td>
                  {selectedCars.map(car => renderCell(car, 'clearance'))}
                  {[...Array(3 - selectedCars.length)].map((_, i) => <td key={i} className="border-b border-gray-100 border-dashed border-l bg-gray-50/50"></td>)}
                </tr>
                <tr>
                  <td className="p-4 border-b border-gray-100 text-sm font-semibold text-gray-600 bg-gray-50/30">Safety (Airbags)</td>
                  {selectedCars.map(car => renderCell(car, 'airbags'))}
                  {[...Array(3 - selectedCars.length)].map((_, i) => <td key={i} className="border-b border-gray-100 border-dashed border-l bg-gray-50/50"></td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
          <Scale className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No cars selected</h3>
          <p className="text-gray-500">Search for a car above to begin your comparison.</p>
        </div>
      )}
    </div>
  );
};

export default Compare;
