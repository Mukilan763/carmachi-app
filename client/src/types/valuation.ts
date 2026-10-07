// ========================================
// CarMachi — Valuation Types
// ========================================

export interface ValuationInput {
  carId: string;
  variantId: string;
  yearOfPurchase: number;
  kilometersDriven: number;
  city: string;
  condition: 'Excellent' | 'Good' | 'Average' | 'Below Average';
}

export interface ValuationResult {
  estimatedResaleValue: number;         // ₹
  resaleRangeMin: number;               // ₹
  resaleRangeMax: number;               // ₹
  depreciationPercent: number;          // % lost
  monthlyRunningCost: RunningCostBreakdown;
  totalCostOfOwnership: number;         // ₹ over ownership period
  depreciationCurve: DepreciationPoint[];
  tips: string[];
}

export interface RunningCostBreakdown {
  fuelCostPerMonth: number;             // ₹
  insuranceCostPerYear: number;         // ₹
  maintenanceCostPerYear: number;       // ₹
  tireCostPerYear: number;              // ₹
  miscCostPerYear: number;             // ₹ (parking, tolls, etc.)
  totalPerMonth: number;                // ₹
  totalPerYear: number;                 // ₹
  costPerKm: number;                    // ₹/km
}

export interface DepreciationPoint {
  year: number;
  valuePercent: number;     // % of original value
  estimatedValue: number;   // ₹
}
