import React from 'react';
import { Link } from 'react-router-dom';
import { formatPriceRange } from '../utils/formatPrice';

interface CarCardProps {
  id: string;
  name: string;
  brand: string;
  priceMin: number;
  priceMax: number;
  imageUrl: string;
  bodyType: string;
}

const CarCard: React.FC<CarCardProps> = ({ id, name, brand, priceMin, priceMax, imageUrl, bodyType }) => {
  return (
    <Link to={`/car/${id}`} className="bg-white rounded-[1.5rem] shadow-sm hover:shadow-2xl hover:shadow-violet-200/50 hover:-translate-y-2 transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col h-full relative z-10">
      <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}
        
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="text-white font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center">
            View Details <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </div>
        </div>

        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[10px] px-2.5 py-1 rounded-full font-bold text-gray-700 shadow-sm border border-white/40 uppercase tracking-widest">
          {bodyType}
        </div>
      </div>
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <div className="text-[10px] text-violet-600 font-black mb-1.5 uppercase tracking-widest bg-violet-50 inline-block px-2 py-0.5 rounded-md">{brand}</div>
          <h3 className="font-extrabold text-xl text-gray-900 leading-tight mb-2 line-clamp-2">{name}</h3>
        </div>
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-end justify-between">
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Est. Price</div>
            <p className="text-violet-700 font-black text-lg leading-none">{formatPriceRange(priceMin, priceMax)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CarCard;
