import React, { useEffect, useState, useMemo } from 'react';
import CarCard from '../components/CarCard';
import { carsAPI } from '../utils/api';

const ExploreCars: React.FC = () => {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');

  useEffect(() => {
    carsAPI.getAll()
      .then(data => {
        setCars(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load cars:", err);
        setLoading(false);
      });
  }, []);

  const brands = ['All', ...Array.from(new Set(cars.map((c: any) => c.brand))).sort()];
  // Extend body types dynamically from data just in case
  const bodyTypes = ['All', ...Array.from(new Set(cars.map((c: any) => c.bodyType || 'SUV'))).sort()];

  const filteredAndSortedCars = useMemo(() => {
    let result = [...cars];

    // Strict Substring Search (User requested 0 fuzzy tolerance)
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.trim().toLowerCase();
      result = result.filter(car => 
        (car.name && car.name.toLowerCase().includes(lowerTerm)) ||
        (car.brand && car.brand.toLowerCase().includes(lowerTerm))
      );
    }

    // Filters
    result = result.filter((car: any) => {
      const matchesBody = selectedBodyType === 'All' || car.bodyType?.toLowerCase() === selectedBodyType.toLowerCase();
      const matchesBrand = selectedBrand === 'All' || car.brand === selectedBrand;
      return matchesBody && matchesBrand;
    });

    // Sorting
    result.sort((a, b) => {
      const priceA = a.priceRange?.min ?? a.priceMin ?? 0;
      const priceB = b.priceRange?.min ?? b.priceMin ?? 0;
      
      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return 0; // recommended / default
    });

    return result;
  }, [cars, searchTerm, selectedBodyType, selectedBrand, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Explore Cars <span className="text-violet-600 bg-violet-100 px-3 py-1 rounded-full text-2xl ml-2">{filteredAndSortedCars.length}</span>
          </h1>
          <p className="text-gray-600 mt-2 font-medium">Browse the latest cars in India with strict search and advanced filters.</p>
        </div>
        
        {(searchTerm || selectedBrand !== 'All' || selectedBodyType !== 'All') && (
          <button 
            onClick={() => { setSearchTerm(''); setSelectedBrand('All'); setSelectedBodyType('All'); setSortBy('recommended'); }}
            className="text-sm font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-full transition-colors self-start xl:self-auto"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-[72px] z-40 flex flex-wrap items-center gap-3 bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-gray-200 shadow-sm mb-8">
        <div className="relative flex-grow sm:flex-grow-0 sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search e.g. Creta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all shadow-inner"
          />
        </div>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer shadow-inner flex-grow sm:flex-grow-0"
        >
          {brands.map(b => <option key={String(b)} value={String(b)}>{b === 'All' ? 'All Brands' : b}</option>)}
        </select>
        <select
          value={selectedBodyType}
          onChange={(e) => setSelectedBodyType(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer shadow-inner flex-grow sm:flex-grow-0"
        >
          {bodyTypes.map(t => <option key={String(t)} value={String(t)}>{t === 'All' ? 'All Body Types' : t}</option>)}
        </select>
        <div className="ml-auto flex-grow sm:flex-grow-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full border border-violet-200 text-violet-700 font-bold rounded-xl px-4 py-2.5 text-sm bg-violet-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer shadow-inner"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <div className="mt-4 text-gray-500 font-medium tracking-wide">Loading massive car catalog...</div>
        </div>
      ) : filteredAndSortedCars.length === 0 ? (
        <div className="text-center py-24 bg-white/50 backdrop-blur rounded-3xl border border-gray-200 shadow-sm text-gray-500">
          <div className="text-6xl mb-6 opacity-50">🚗💨</div>
          <h3 className="text-2xl font-black text-gray-800">No cars found</h3>
          <p className="mt-2 text-gray-600">Try adjusting your filters or clearing the search term.</p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedBrand('All'); setSelectedBodyType('All'); setSortBy('recommended'); }}
            className="mt-6 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-full font-bold transition-colors shadow-lg shadow-violet-200"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredAndSortedCars.map(car => (
            <CarCard
              key={car.id}
              id={car.id}
              name={car.name}
              brand={car.brand}
              priceMin={car.priceRange?.min ?? car.priceMin ?? 0}
              priceMax={car.priceRange?.max ?? car.priceMax ?? 0}
              imageUrl={car.images?.[0]?.url || ''}
              bodyType={car.bodyType}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreCars;
