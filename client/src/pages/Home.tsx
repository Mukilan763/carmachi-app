import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { carsAPI } from '../utils/api';
import CarCard from '../components/CarCard';
import { ArrowRight, Brain, Zap, Filter, ShieldCheck, Car as CarIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const [popularCars, setPopularCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await carsAPI.getAll();
        const cars = Array.isArray(response) ? response : response.data || [];
        setPopularCars(cars.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch popular cars', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  return (
    <div className="min-h-screen bg-surface-50 overflow-hidden relative">
      {/* Funky Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* Hero Section */}
      <section className="relative z-10 text-surface-900 py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 mb-6"
          >
            <Sparkles className="h-4 w-4 text-violet-600" />
            Powered by TypeSafe Jev AI
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 font-display"
          >
            India's <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-pulse-slow">Smartest</span> Car Engine
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-surface-600 max-w-3xl mx-auto mb-10 font-sans"
          >
            Tell us your budget, family size, and vibe. Our semantic AI instantly finds the perfect car for you.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <Link
              to="/prediction"
              className="bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-700 hover:to-violet-700 px-8 py-4 rounded-full font-bold text-lg flex items-center transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              <Zap className="mr-2 h-5 w-5 text-yellow-300" />
              Get AI Recommendations
            </Link>
            <Link
              to="/explore"
              className="bg-white border-2 border-gray-200 text-gray-700 hover:border-violet-300 hover:bg-violet-50 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-md hover:shadow-lg"
            >
              Explore All Cars
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Browse by Budget */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-wrap justify-center gap-4">
          {['Under 5L', '5 - 10L', '10 - 15L', '15 - 20L', '20L +'].map((budget, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to="/explore"
                className="px-6 py-3 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full shadow-sm text-gray-700 font-bold hover:border-pink-500 hover:text-pink-600 hover:shadow-pink-100 hover:shadow-lg transition-all flex items-center gap-2"
              >
                {budget}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular Cars */}
      <section className="py-20 bg-white/60 backdrop-blur-3xl px-4 sm:px-6 lg:px-8 relative z-10 border-t border-white/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 font-display">Popular Cars in India</h2>
            <Link to="/explore" className="text-violet-600 hover:text-violet-800 font-bold flex items-center group">
              View All <ArrowRight className="ml-1 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-violet-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularCars.map((car, idx) => (
                <motion.div
                  key={car.id || car._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, type: "spring" }}
                  whileHover={{ y: -8 }}
                >
                  <CarCard
                    id={car.id || car._id}
                    name={car.name}
                    brand={car.brand}
                    priceMin={car.priceRange?.min}
                    priceMax={car.priceRange?.max}
                    imageUrl={car.images?.[0]?.url || 'https://via.placeholder.com/400x250?text=No+Image'}
                    bodyType={car.bodyType}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
