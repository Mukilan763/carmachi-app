import React from 'react';
import { Car, BrainCircuit, Database, RefreshCw, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Brand & Copyright */}
          <div className="flex flex-col space-y-4">
            <Link to="/" className="flex items-center space-x-2 group w-max">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">Car<span className="text-violet-500">Machi</span></span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 -mt-1">India Edition</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 max-w-xs">
              Your intelligent, unbiased companion for navigating the Indian automotive market. Built with precision and care.
            </p>
            <div className="text-xs text-gray-500 pt-4">
              &copy; {new Date().getFullYear()} CarMachi. All rights reserved.
            </div>
          </div>

          {/* Model Context & Data Integrity */}
          <div className="md:col-span-2 bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-violet-400" />
              AI Model & Data Transparency
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <Database className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-200 mb-1">Authentic Local Data</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Powered by a custom Two-Stage Cascade TF-IDF semantic engine. Rooted exclusively in 150+ actively monitored Indian car profiles rather than synthetic LLM hallucinations.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <RefreshCw className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-200 mb-1">Zero-Downtime Live Scraper</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Our background workers continuously scrape live platforms to ensure you see up-to-the-minute Ex-Showroom pricing, ARAI mileage, and the newest variant launches.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
        
        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-medium">
          <div className="flex gap-6">
            <Link to="/prediction" className="hover:text-violet-400 transition-colors">AI Predictor</Link>
            <Link to="/explore" className="hover:text-violet-400 transition-colors">Explore Catalog</Link>
            <Link to="/valuation" className="hover:text-violet-400 transition-colors">Cost Calculator</Link>
          </div>
          <div className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 mx-0.5" /> for Indian Car Buyers
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
