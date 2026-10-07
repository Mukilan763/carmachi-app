import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Search, BarChart2, MessageSquare, Heart, User, LogOut, Palette } from 'lucide-react';
import { getUser, logoutUser, UserProfile } from '../utils/authStore';
import { getGarageCars } from '../utils/garageStore';
import { getCity, detectLocation } from '../utils/locationStore';
import { getTheme, setTheme } from '../utils/themeStore';
import { MapPin } from 'lucide-react';

const Navbar: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(getUser());
  const [garageCount, setGarageCount] = useState<number>(getGarageCars().length);
  const [city, setCity] = useState<string>(getCity());
  const [themeState, setThemeState] = useState<string>(getTheme());
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const themes = [
    { id: 'light', label: 'Light', emoji: '☀️' },
    { id: 'dark', label: 'Dark', emoji: '🌙' },
    { id: 'midnight', label: 'Midnight', emoji: '🌌' },
    { id: 'cyberpunk', label: 'Cyberpunk', emoji: '⚡' },
    { id: 'ocean', label: 'Ocean', emoji: '🌊' },
    { id: 'sunset', label: 'Sunset', emoji: '🌅' },
  ];

  const applyTheme = (themeId: string) => {
    setTheme(themeId);
    setThemeState(themeId);
    setShowThemeMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Auto-detect location on load if they haven't explicitly set it
    if (!localStorage.getItem('carmachi_city_detected')) {
      detectLocation();
      localStorage.setItem('carmachi_city_detected', 'true');
    }

    const handleAuth = () => setUser(getUser());
    const handleGarage = () => setGarageCount(getGarageCars().length);
    const handleLocation = () => setCity(getCity());

    window.addEventListener('auth-updated', handleAuth);
    window.addEventListener('garage-updated', handleGarage);
    window.addEventListener('location-updated', handleLocation);

    return () => {
      window.removeEventListener('auth-updated', handleAuth);
      window.removeEventListener('garage-updated', handleGarage);
      window.removeEventListener('location-updated', handleLocation);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className="bg-white/70 backdrop-blur-2xl border-b border-white/20 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg transform group-hover:rotate-12 transition-transform">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">Car<span className="text-violet-600">Machi</span></span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-fuchsia-600 -mt-1">India Edition</span>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center text-xs font-semibold text-gray-500 bg-gray-100/50 backdrop-blur px-3 py-1.5 rounded-full shadow-inner border border-gray-200 cursor-pointer hover:bg-gray-200/50 transition-colors" title="Auto-detected base location">
              <MapPin className="h-3.5 w-3.5 mr-1 text-fuchsia-500" />
              {city}
            </div>
            
            <div className="relative" ref={themeMenuRef}>
              <button 
                onClick={() => setShowThemeMenu(!showThemeMenu)} 
                className="p-2 text-gray-500 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-full transition-colors hidden sm:flex items-center gap-1"
                title="Change Theme"
              >
                <Palette className="h-4 w-4" />
                <span className="text-xs font-medium">{themes.find(t => t.id === themeState)?.emoji}</span>
              </button>
              {showThemeMenu && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 w-48 z-[100] animate-fade-in">
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold text-gray-400 border-b border-gray-100 mb-1">Choose Theme</div>
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => applyTheme(t.id)}
                      className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center gap-2.5 transition-colors ${
                        themeState === t.id 
                          ? 'bg-violet-50 text-violet-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-base">{t.emoji}</span>
                      <span>{t.label}</span>
                      {themeState === t.id && <span className="ml-auto text-violet-500 text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Nav links */}
          <div className="hidden md:flex space-x-7 text-sm font-medium">
            <Link to="/prediction" className="text-gray-700 hover:text-violet-600 flex items-center space-x-1.5 transition-colors">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600"></span>
              </span>
              <span className="font-semibold text-violet-600">AI Predictor</span>
            </Link>
            <Link to="/explore" className="text-gray-600 hover:text-violet-600 flex items-center space-x-1 transition-colors">
              <Search className="h-4 w-4" />
              <span>Explore Cars</span>
            </Link>
            <Link to="/valuation" className="text-gray-600 hover:text-violet-600 flex items-center space-x-1 transition-colors">
              <BarChart2 className="h-4 w-4" />
              <span>Valuation & Costs</span>
            </Link>
            <Link to="/forum" className="text-gray-600 hover:text-blue-600 flex items-center space-x-1 transition-colors">
              <MessageSquare className="h-4 w-4" />
              <span>Community Forum</span>
            </Link>
          </div>

          {/* Right actions: Garage & Auth */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/garage" 
              className="relative p-2 text-gray-600 hover:text-rose-600 transition-colors flex items-center"
              title="My Garage (Watchlist)"
            >
              <Heart className="h-6 w-6" />
              {garageCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {garageCount}
                </span>
              )}
            </Link>

            {user.isLoggedIn ? (
              <div className="flex items-center space-x-3 bg-gray-50 py-1.5 px-3 rounded-full border border-gray-200">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-semibold text-gray-800 hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                <button 
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center space-x-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white py-1.5 px-4 rounded-full text-sm font-semibold transition-all border border-blue-200"
              >
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
