import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, Car, ExternalLink } from 'lucide-react';
import { getGarageCars, removeFromGarage, SavedCar } from '../utils/garageStore';
import { formatPriceRange } from '../utils/formatPrice';

const Garage: React.FC = () => {
  const [cars, setCars] = useState<SavedCar[]>([]);

  const refreshCars = () => setCars(getGarageCars());

  useEffect(() => {
    refreshCars();
    window.addEventListener('garage-updated', refreshCars);
    return () => window.removeEventListener('garage-updated', refreshCars);
  }, []);

  const handleRemove = (id: string) => {
    removeFromGarage(id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center space-x-3">
          <Heart className="h-8 w-8 text-rose-500" />
          <span>My Garage</span>
        </h1>
        <p className="text-gray-500 mt-1">
          Your saved and watchlisted cars — {cars.length} car{cars.length !== 1 ? 's' : ''} saved.
        </p>
      </div>

      {cars.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Your Garage is Empty</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            No cars saved yet. Explore cars or get AI predictions to start building your garage!
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              to="/explore"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors"
            >
              Explore Cars
            </Link>
            <Link
              to="/prediction"
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold py-2.5 px-6 rounded-xl border border-blue-200 transition-colors"
            >
              Get AI Prediction
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div key={car.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="aspect-[16/10] bg-gray-100 overflow-hidden relative">
                {car.imageUrl ? (
                  <img src={car.imageUrl} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Car className="h-12 w-12" />
                  </div>
                )}
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(car.id)}
                  className="absolute top-3 right-3 bg-white/90 hover:bg-red-500 hover:text-white text-gray-500 p-2 rounded-full shadow-sm transition-all"
                  title="Remove from Garage"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
                  {car.brand} &bull; {car.bodyType}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{car.name}</h3>
                <p className="text-gray-600 font-medium text-sm mb-3">
                  {formatPriceRange(car.priceMin, car.priceMax)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    Saved {new Date(car.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <Link
                    to={`/car/${car.id}`}
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
                  >
                    <span>View Details</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Garage;
