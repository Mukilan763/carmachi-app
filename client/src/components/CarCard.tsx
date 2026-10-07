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
    <Link to={`/car/${id}`} className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col h-full">
      <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full font-semibold text-gray-700 shadow-sm border border-white/20">
          {bodyType}
        </div>
      </div>
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <div className="text-xs text-blue-600 font-bold mb-1 uppercase tracking-widest">{brand}</div>
          <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 line-clamp-2">{name}</h3>
        </div>
        <p className="text-violet-600 font-black text-lg mt-auto">{formatPriceRange(priceMin, priceMax)}</p>
      </div>
    </Link>
  );
};

export default CarCard;
