/**
 * Deep context extraction module for semantic car queries.
 */

export interface DeepContext {
  terrain: 'city' | 'highway' | 'offroad' | 'mixed';
  climate: 'hot' | 'rainy' | 'cold' | 'moderate';
  usagePattern: 'daily_commute' | 'weekend' | 'long_trips' | 'commercial';
  passengerProfile: 'solo' | 'couple' | 'family_small' | 'family_large' | 'elderly';
  parkingConstraint: 'tight' | 'normal';
  confidenceScores: Record<string, number>;
  impliedPriorities: string[];
  impliedBodyTypes: string[];
  impliedFuelTypes: string[];
}

const DICTIONARY = {
  terrain: {
    city: ['city', 'urban', 'traffic', 'traffic jam', 'bumper to bumper', 'daily run'],
    highway: ['highway', 'expressway', 'cruising', 'high speed', 'long drive'],
    offroad: ['bad roads', 'potholes', 'hills', 'mountain', 'offroad', 'farm', 'village', 'rough', 'uneven'],
    mixed: ['everywhere', 'all terrain', 'versatile']
  },
  climate: {
    hot: ['summer', 'heat', 'hot', 'sun', 'ac', 'cooling'],
    rainy: ['monsoon', 'rain', 'water', 'flooded', 'slippery'],
    cold: ['snow', 'cold', 'winter', 'hill station', 'ice'],
    moderate: []
  },
  usagePattern: {
    daily_commute: ['office', 'daily', 'commute', 'work', 'everyday'],
    weekend: ['weekend', 'occasional', 'sunday'],
    long_trips: ['road trip', 'touring', 'long distance', 'intercity'],
    commercial: ['ola', 'uber', 'taxi', 'fleet', 'commercial', 'passengers']
  },
  passengerProfile: {
    solo: ['alone', 'solo', 'single', 'just me'],
    couple: ['wife', 'husband', 'spouse', 'couple', 'two people'],
    family_small: ['kids', 'small family', 'family of 4', 'two kids'],
    family_large: ['large family', '7 people', '6 people', 'parents and kids', 'extended family'],
    elderly: ['parents', 'elderly', 'old', 'senior', 'mother', 'father']
  },
  parkingConstraint: {
    tight: ['narrow lanes', 'parking problem', 'compact', 'tight space', 'small garage'],
    normal: ['spacious parking', 'big garage']
  }
};

function scoreCategory<T extends string>(text: string, categoryDict: Record<T, string[]>): { top: T | null, scores: Record<T, number> } {
  const scores: Partial<Record<T, number>> = {};
  
  for (const [key, keywords] of Object.entries(categoryDict) as [T, string[]][]) {
    scores[key] = 0;
    for (const kw of keywords) {
      if (new RegExp(`\\b${kw}\\b`, 'i').test(text)) {
        scores[key]! += 1;
      }
    }
  }

  let top: T | null = null;
  let max = 0;
  for (const [key, score] of Object.entries(scores) as [T, number][]) {
    if (score > max) {
      max = score;
      top = key;
    }
  }

  return { top, scores: scores as Record<T, number> };
}

function calculateConfidence(scores: Record<string, number>, top: string | null): number {
  if (!top) return 0;
  const maxScore = scores[top];
  // Simple heuristic: 1 match = 0.6, 2 matches = 0.8, 3+ = 0.95
  if (maxScore === 1) return 0.6;
  if (maxScore === 2) return 0.8;
  if (maxScore >= 3) return 0.95;
  return 0;
}

export function analyzeDeepContext(query: string): DeepContext {
  const q = query.toLowerCase();

  const terrainRes = scoreCategory(q, DICTIONARY.terrain);
  const climateRes = scoreCategory(q, DICTIONARY.climate);
  const usageRes = scoreCategory(q, DICTIONARY.usagePattern);
  const passengerRes = scoreCategory(q, DICTIONARY.passengerProfile);
  const parkingRes = scoreCategory(q, DICTIONARY.parkingConstraint);

  const terrain = terrainRes.top || 'mixed';
  const climate = climateRes.top || 'moderate';
  const usagePattern = usageRes.top || 'daily_commute';
  const passengerProfile = passengerRes.top || 'family_small';
  const parkingConstraint = parkingRes.top || 'normal';

  const confidenceScores: Record<string, number> = {
    terrain: calculateConfidence(terrainRes.scores, terrainRes.top),
    climate: calculateConfidence(climateRes.scores, climateRes.top),
    usagePattern: calculateConfidence(usageRes.scores, usageRes.top),
    passengerProfile: calculateConfidence(passengerRes.scores, passengerRes.top),
    parkingConstraint: calculateConfidence(parkingRes.scores, parkingRes.top)
  };

  const impliedPriorities = new Set<string>();
  const impliedBodyTypes = new Set<string>();
  const impliedFuelTypes = new Set<string>();

  // Terrain implications
  if (terrain === 'offroad') {
    impliedPriorities.add('ground clearance');
    impliedPriorities.add('suspension');
    impliedBodyTypes.add('SUV');
  } else if (terrain === 'city') {
    impliedPriorities.add('maneuverability');
    impliedPriorities.add('automatic transmission');
    impliedBodyTypes.add('Hatchback');
    impliedBodyTypes.add('Compact SUV');
  } else if (terrain === 'highway') {
    impliedPriorities.add('stability');
    impliedPriorities.add('safety');
    impliedBodyTypes.add('Sedan');
    impliedBodyTypes.add('SUV');
  }

  // Climate implications
  if (climate === 'rainy') {
    impliedPriorities.add('safety');
    impliedPriorities.add('traction');
    impliedPriorities.add('ground clearance');
  } else if (climate === 'hot') {
    impliedPriorities.add('good AC');
    impliedPriorities.add('ventilated seats');
  }

  // Usage implications
  if (usagePattern === 'daily_commute') {
    impliedPriorities.add('fuel efficiency');
    impliedFuelTypes.add('CNG');
    impliedFuelTypes.add('Petrol');
    impliedFuelTypes.add('Electric');
  } else if (usagePattern === 'long_trips') {
    impliedPriorities.add('boot space');
    impliedPriorities.add('comfort');
    impliedFuelTypes.add('Diesel');
    impliedFuelTypes.add('Petrol');
  } else if (usagePattern === 'commercial') {
    impliedPriorities.add('running cost');
    impliedPriorities.add('reliability');
    impliedFuelTypes.add('CNG');
    impliedFuelTypes.add('Diesel');
  }

  // Passenger implications
  if (passengerProfile === 'elderly') {
    impliedPriorities.add('comfort');
    impliedPriorities.add('smooth ride');
    impliedPriorities.add('easy ingress/egress');
  } else if (passengerProfile === 'family_large') {
    impliedPriorities.add('space');
    impliedPriorities.add('3rd row');
    impliedBodyTypes.add('MPV');
    impliedBodyTypes.add('SUV');
  } else if (passengerProfile === 'solo' || passengerProfile === 'couple') {
    impliedBodyTypes.add('Hatchback');
    impliedBodyTypes.add('Sedan');
  }

  // Parking implications
  if (parkingConstraint === 'tight') {
    impliedPriorities.add('compact size');
    impliedPriorities.add('parking camera');
    impliedBodyTypes.add('Hatchback');
    // Remove large vehicles
    impliedBodyTypes.delete('SUV');
    impliedBodyTypes.delete('MPV');
  }

  return {
    terrain,
    climate,
    usagePattern,
    passengerProfile,
    parkingConstraint,
    confidenceScores,
    impliedPriorities: Array.from(impliedPriorities),
    impliedBodyTypes: Array.from(impliedBodyTypes),
    impliedFuelTypes: Array.from(impliedFuelTypes)
  };
}
