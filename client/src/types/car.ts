// ========================================
// CarMachi — Core Car Data Types
// All prices in INR (₹), distances in km
// ========================================

export interface CarImage {
  url: string;
  alt: string;
  type: 'exterior' | 'interior' | 'feature' | 'color';
}

export interface CarFeature {
  name: string;
  description: string;
  category: 'safety' | 'comfort' | 'technology' | 'performance' | 'exterior' | 'interior' | 'convenience';
  icon?: string;
  isHighlight?: boolean;
}

export interface CarVariant {
  id: string;
  name: string;
  priceExShowroom: number;    // in ₹
  fuelType: 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid';
  transmission: 'Manual' | 'Automatic' | 'AMT' | 'CVT' | 'DCT' | 'iMT';
  engineCC?: number;          // in cc
  power?: string;             // e.g., "118 bhp"
  torque?: string;            // e.g., "250 Nm"
  mileage?: string;           // e.g., "20.4 kmpl" or "400 km range"
  features: CarFeature[];
  keyHighlights: string[];    // What makes this variant special
  airbags?: number;
  safetyRating?: string;      // e.g., "5-star GNCAP"
  bootSpace?: string;         // e.g., "382 L"
  groundClearance?: string;   // e.g., "190 mm"
  fuelTankCapacity?: string;  // e.g., "45 L"
}

export interface CarModel {
  id: string;
  name: string;
  brand: string;
  brandLogo?: string;
  bodyType: 'Hatchback' | 'Sedan' | 'SUV' | 'MPV' | 'Crossover' | 'Coupe' | 'Convertible' | 'Pickup';
  segment: 'Budget' | 'Compact' | 'Mid-Size' | 'Premium' | 'Luxury';
  priceRange: {
    min: number;    // ₹ ex-showroom
    max: number;    // ₹ ex-showroom
  };
  images: CarImage[];
  variants: CarVariant[];
  overallRating?: number;        // 0–5
  totalReviews?: number;
  launchYear: number;
  seatingCapacity: number;
  dimensions?: {
    length?: string;   // mm
    width?: string;    // mm
    height?: string;   // mm
    wheelbase?: string; // mm
  };
  prosAndCons?: {
    pros: string[];
    cons: string[];
  };
  competitorIds?: string[];
  tags?: string[];               // e.g., ["bestseller", "value-for-money", "safest"]
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  country: string;
  serviceNetwork: number;       // Total service centers in India
  models: string[];             // model IDs
}

export type SortOption = 'price-low' | 'price-high' | 'rating' | 'popularity' | 'newest';
export type FuelFilter = 'all' | 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid';
export type BodyTypeFilter = 'all' | 'Hatchback' | 'Sedan' | 'SUV' | 'MPV' | 'Crossover';
export type BrandFilter = string;

export interface CarFilters {
  brand?: BrandFilter;
  bodyType?: BodyTypeFilter;
  fuel?: FuelFilter;
  budgetMin?: number;
  budgetMax?: number;
  transmission?: 'all' | 'Manual' | 'Automatic';
  sort?: SortOption;
  search?: string;
}
