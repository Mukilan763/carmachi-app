import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { carsAPI, liveAPI } from '../utils/api';
import { formatPrice, formatPriceRange } from '../utils/formatPrice';
import { Radio, Loader2, Newspaper, MapPin, Zap, Gauge, Leaf, ChevronRight } from 'lucide-react';

// ─── City On-Road Multipliers (Major metros only) ────────────────────────────
const CITY_MULTIPLIERS: Record<string, number> = {
  'Delhi': 1.10,
  'Mumbai': 1.15,
  'Bangalore': 1.20,
  'Hyderabad': 1.18,
  'Chennai': 1.16,
  'Pune': 1.13,
  'Kolkata': 1.09,
};

// ─── Fuel type colours ────────────────────────────────────────────────────────
const FUEL_COLORS: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  Petrol:   { bg: 'bg-blue-50',    text: 'text-blue-800',    dot: 'bg-blue-500',    border: 'border-blue-200' },
  Diesel:   { bg: 'bg-amber-50',   text: 'text-amber-800',   dot: 'bg-amber-500',   border: 'border-amber-200' },
  CNG:      { bg: 'bg-green-50',   text: 'text-green-800',   dot: 'bg-green-500',   border: 'border-green-200' },
  Electric: { bg: 'bg-emerald-50', text: 'text-emerald-800', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  Hybrid:   { bg: 'bg-teal-50',    text: 'text-teal-800',    dot: 'bg-teal-500',    border: 'border-teal-200' },
  Other:    { bg: 'bg-gray-50',    text: 'text-gray-800',    dot: 'bg-gray-400',    border: 'border-gray-200' },
};

// ─── 3D Tilt Card component ───────────────────────────────────────────────────
const TiltCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -8;
    const rotateY = ((x - cx) / cx) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.transition = 'transform 0.05s ease-out';
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.5s ease-out';
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`cursor-pointer ${className}`}
      style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
};

// ─── Animated number display ──────────────────────────────────────────────────
const AnimatedStat: React.FC<{ label: string; value: string; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className={`flex flex-col items-center gap-1 p-4 rounded-2xl border ${color} text-center min-w-[120px] flex-1 shadow-sm hover:scale-105 transition-transform duration-200`}>
    <div className="text-xl mb-1">{icon}</div>
    <div className="text-lg font-black tracking-tight">{value}</div>
    <div className="text-[10px] uppercase tracking-widest font-bold opacity-70">{label}</div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [liveData, setLiveData] = useState<any>(null);
  const [fetchingLive, setFetchingLive] = useState(false);

  useEffect(() => {
    if (!id) return;
    carsAPI.getById(id)
      .then(data => {
        setCar(data);
        if (data?.images?.length > 0) setSelectedImage(data.images[0].url);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleFetchLive = async () => {
    if (!car) return;
    setFetchingLive(true);
    try {
      const data = await liveAPI.fetchLive(car.name);
      setLiveData(data);
    } catch (e) {
      setLiveData({ error: 'Failed' });
    } finally {
      setFetchingLive(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Loading car details…</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Car Not Found</h2>
        <Link to="/explore" className="text-blue-600 hover:underline mt-4 inline-block">Back to Catalog</Link>
      </div>
    );
  }

  const onRoadMin = (car.priceRange?.min || 0) * CITY_MULTIPLIERS[selectedCity];
  const onRoadMax = (car.priceRange?.max || 0) * CITY_MULTIPLIERS[selectedCity];

  // Derive top-level specs from first variant that has them
  const firstSpec = car.variants?.find((v: any) => v.power && v.power !== 'N/A');
  const topMileage = car.variants?.find((v: any) => v.mileage && v.mileage !== 'N/A')?.mileage;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/explore" className="hover:text-violet-600 transition-colors">Explore</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-semibold">{car.name}</span>
      </div>

      {/* ── Hero Grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">

        {/* Gallery with 3D Tilt */}
        <div>
          <TiltCard className="aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden border border-gray-100 shadow-2xl mb-4 relative">
            {selectedImage ? (
              <>
                <img src={selectedImage} alt={car.name} className="w-full h-full object-cover" />
                {/* Glossy overlay */}
                <div className="absolute inset-0 pointer-events-none rounded-3xl"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 60%)' }} />
                {/* Shimmer edge */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image Available</div>
            )}
          </TiltCard>

          {/* Thumbnail strip */}
          {car.images?.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              {car.images.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-200
                    ${selectedImage === img.url
                      ? 'border-violet-500 shadow-lg shadow-violet-200 scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                >
                  <img src={img.url} alt={img.alt || car.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="flex flex-col justify-between gap-6">

          {/* Brand + Name */}
          <div>
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-3">
              {car.brand} &bull; {car.bodyType}
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-1">{car.name}</h1>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-base ${i < Math.floor(car.overallRating || 4.2) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                ))}
              </div>
              <span className="text-sm text-gray-500">{car.overallRating || 4.2}/5 &bull; {(car.totalReviews || 1200).toLocaleString()} reviews</span>
            </div>

            {/* Quick stat pills */}
            <div className="flex flex-wrap gap-3 mb-6">
              {firstSpec?.power && firstSpec.power !== 'N/A' && (
                <AnimatedStat label="Max Power" value={firstSpec.power} color="bg-blue-50 border-blue-100 text-blue-900" icon={<Zap className="w-5 h-5 text-blue-500 mx-auto" />} />
              )}
              {firstSpec?.torque && firstSpec.torque !== 'N/A' && (
                <AnimatedStat label="Max Torque" value={firstSpec.torque} color="bg-violet-50 border-violet-100 text-violet-900" icon={<Gauge className="w-5 h-5 text-violet-500 mx-auto" />} />
              )}
              {topMileage && (
                <AnimatedStat label="Mileage" value={topMileage} color="bg-emerald-50 border-emerald-100 text-emerald-900" icon={<Leaf className="w-5 h-5 text-emerald-500 mx-auto" />} />
              )}
            </div>

            {/* Price card with city selector */}
            <div className="relative bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-5 text-white shadow-xl shadow-violet-200 mb-6 overflow-hidden">
              {/* Background grid decoration */}
              <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="text-xs text-white/70 font-bold uppercase tracking-widest mb-1">Estimated On-Road Price</div>
                  <div className="text-3xl font-black tracking-tight">{formatPriceRange(onRoadMin, onRoadMax)}</div>
                  <div className="text-xs text-white/60 mt-1">Ex-SR: {formatPriceRange(car.priceRange?.min || 0, car.priceRange?.max || 0)}</div>
                </div>
                {/* City pills */}
                <div className="flex flex-col gap-1 items-end">
                  <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <MapPin className="w-3 h-3" /> City
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-w-[180px] justify-end">
                    {Object.keys(CITY_MULTIPLIERS).map(city => (
                      <button
                        key={city}
                        onClick={() => setSelectedCity(city)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide transition-all duration-150
                          ${selectedCity === city
                            ? 'bg-white text-violet-700 shadow-lg'
                            : 'bg-white/15 text-white hover:bg-white/25'}`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pros & Cons */}
            {car.prosAndCons && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                  <div className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-2">✓ Pros</div>
                  <ul className="space-y-1">
                    {car.prosAndCons.pros?.slice(0, 3).map((p: string, i: number) => (
                      <li key={i} className="text-xs text-emerald-800 flex items-start gap-1.5">
                        <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
                  <div className="text-xs font-black text-rose-700 uppercase tracking-widest mb-2">✗ Cons</div>
                  <ul className="space-y-1">
                    {car.prosAndCons.cons?.slice(0, 3).map((c: string, i: number) => (
                      <li key={i} className="text-xs text-rose-800 flex items-start gap-1.5">
                        <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Quick spec pills row */}
            <div className="flex gap-2 flex-wrap mb-6">
              {[
                { label: car.segment },
                { label: `${car.seatingCapacity} Seater` },
                { label: `${car.launchYear}` },
              ].map((pill, i) => (
                <span key={i} className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full">
                  {pill.label}
                </span>
              ))}
            </div>
          </div>

          {/* Live data section */}
          {liveData && liveData.latestNews?.headline && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm">
              <div className="flex items-center gap-1.5 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
                <Newspaper className="w-3.5 h-3.5" /> Latest News
              </div>
              <div className="font-bold text-gray-900 text-sm">{liveData.latestNews.headline}</div>
              <div className="text-gray-500 text-xs mt-1 line-clamp-2">{liveData.latestNews.summary}</div>
            </div>
          )}

          {/* CTA row */}
          <div className="flex gap-3">
            <Link
              to="/prediction"
              className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center font-bold py-3.5 px-6 rounded-2xl hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get AI Prediction
            </Link>
            <button
              onClick={handleFetchLive}
              disabled={fetchingLive}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-700 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              {fetchingLive ? <Loader2 className="h-4 w-4 animate-spin text-violet-600" /> : <Radio className="h-4 w-4 text-rose-500" />}
              {fetchingLive ? 'Scraping…' : 'Live Data'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Variant Lineup Table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Variant Lineup</h2>
            <p className="text-gray-500 text-sm">
              All variants of {car.name} — on-road price shown for <span className="font-bold text-violet-700">{selectedCity}</span>.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 max-h-[620px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-gray-200 text-[11px] font-black text-gray-500 uppercase tracking-widest bg-gray-50/95 backdrop-blur-md">
                <th className="py-4 px-5">Variant</th>
                <th className="py-4 px-5">Fuel &amp; Gearbox</th>
                <th className="py-4 px-5">Power / Torque</th>
                <th className="py-4 px-5">Mileage</th>
                <th className="py-4 px-5">Key Features</th>
                <th className="py-4 px-5 text-right whitespace-nowrap">On-Road – {selectedCity}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {(() => {
                const grouped: Record<string, any[]> = {};
                car.variants?.forEach((v: any) => {
                  let fType = v.fuelType || 'Other';
                  const isHybrid =
                    (v.name && v.name.toLowerCase().includes('hybrid')) ||
                    (v.engine && v.engine.toLowerCase().includes('hybrid')) ||
                    (car.name && car.name.toLowerCase().includes('hybrid'));
                  if (isHybrid && fType !== 'Electric') fType = 'Hybrid';
                  if (!grouped[fType]) grouped[fType] = [];
                  grouped[fType].push(v);
                });

                const order = ['Petrol', 'Diesel', 'Hybrid', 'CNG', 'Electric', 'Other'];
                const sortedFuels = Object.keys(grouped).sort((a, b) => {
                  const ai = order.indexOf(a); const bi = order.indexOf(b);
                  return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
                });

                return sortedFuels.map(fuel => {
                  const fc = FUEL_COLORS[fuel] || FUEL_COLORS['Other'];
                  return (
                    <React.Fragment key={fuel}>
                      {/* Fuel group header */}
                      <tr className={`${fc.bg} border-t-2 ${fc.border}`}>
                        <td colSpan={6} className={`py-2.5 px-5 font-black ${fc.text} uppercase tracking-widest text-[11px] flex items-center gap-2`}>
                          <span className={`w-2 h-2 rounded-full ${fc.dot} inline-block`} />
                          {fuel} Variants
                        </td>
                      </tr>

                      {grouped[fuel].map((v: any) => (
                        <tr key={v.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="py-4 px-5">
                            <div className="font-bold text-gray-900 group-hover:text-violet-700 transition-colors text-sm">{v.name}</div>
                            {v.engine && (
                              <div className="text-[11px] text-gray-400 mt-0.5">{v.engine}</div>
                            )}
                          </td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${fc.bg} ${fc.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${fc.dot}`} />
                              {fuel}
                            </span>
                            <div className="text-xs text-gray-400 mt-1">{v.transmission}</div>
                          </td>
                          <td className="py-4 px-5">
                            <div className="text-sm font-bold text-gray-800">{v.power || '—'}</div>
                            <div className="text-xs text-gray-400">{v.torque || '—'}</div>
                          </td>
                          <td className="py-4 px-5">
                            <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-100">
                              {v.mileage || '—'}
                            </span>
                          </td>
                          <td className="py-4 px-5 max-w-[200px]">
                            <div className="flex flex-wrap gap-1.5">
                              {Array.isArray(v.keyHighlights)
                                ? v.keyHighlights.slice(0, 2).map((h: string, i: number) => (
                                  <span key={i} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                    {h}
                                  </span>
                                ))
                                : <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md">{v.keyHighlights || 'Standard'}</span>
                              }
                            </div>
                          </td>
                          <td className="py-4 px-5 text-right">
                            {v.priceExShowroom ? (
                              <>
                                <div className="font-black text-violet-700 text-base">
                                  {formatPrice(v.priceExShowroom * CITY_MULTIPLIERS[selectedCity])}
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5">
                                  Ex-SR: {formatPrice(v.priceExShowroom)}
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-300 text-sm font-bold">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
