// ========================================
// CarMachi — Prediction Engine Types
// ========================================

export interface PredictionInput {
  city: string;
  state: string;
  budgetMin: number;          // in ₹ Lakhs
  budgetMax: number;          // in ₹ Lakhs
  fuelPreference: 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Any';
  bodyType: 'Hatchback' | 'Sedan' | 'SUV' | 'MPV' | 'Any';
  transmission: 'Manual' | 'Automatic' | 'Any';
  priorities: PriorityFactor[];
  dailyDrivingKm: number;
  usageType: 'City' | 'Highway' | 'Mixed';
  familySize?: number;
  firstCar?: boolean;
}

export type PriorityFactor = 
  | 'mileage'
  | 'safety'
  | 'features'
  | 'performance'
  | 'resaleValue'
  | 'serviceNetwork'
  | 'comfort'
  | 'brandValue';

export interface FactorScore {
  factor: string;
  label: string;
  score: number;          // 0-100
  icon: string;
  explanation: string;    // Why this score
  details?: string[];
}

export interface PredictionResult {
  carId: string;
  carName: string;
  brand: string;
  recommendedVariant: string;
  variantId: string;
  price: number;                    // ₹ ex-showroom
  overallScore: number;             // 0-100 CarMachi Score
  rank: number;
  factors: FactorScore[];
  whyRecommended: string;          // Personalized explanation paragraph
  highlightFeatures: string[];     // Key features of recommended variant
  fiveYearCost: FiveYearCost;
  images: string[];
  matchPercentage: number;         // How well it matches user's preferences
}

export interface FiveYearCost {
  fuelCostPerMonth: number;       // ₹
  insurancePerYear: number;       // ₹
  maintenancePerYear: number;     // ₹
  depreciationFiveYears: number;  // ₹ lost in value
  totalCostFiveYears: number;     // ₹
  costPerKm: number;              // ₹/km
}

export interface LocationFactors {
  city: string;
  state: string;
  petrolPrice: number;            // ₹/litre
  dieselPrice: number;            // ₹/litre
  cngPrice: number;               // ₹/kg
  electricityRate: number;        // ₹/kWh
  terrain: 'flat' | 'hilly' | 'mixed';
  trafficDensity: 'low' | 'medium' | 'high';
  climateType: 'hot' | 'moderate' | 'cold' | 'humid';
  serviceNetworkByBrand: Record<string, number>;
}
