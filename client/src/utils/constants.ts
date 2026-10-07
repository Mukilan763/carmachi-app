// ========================================
// CarMachi — Constants (Indian Context)
// ========================================

export const INDIAN_CITIES = [
  { name: 'Mumbai', state: 'Maharashtra', tier: 1 },
  { name: 'Delhi', state: 'Delhi', tier: 1 },
  { name: 'Bangalore', state: 'Karnataka', tier: 1 },
  { name: 'Hyderabad', state: 'Telangana', tier: 1 },
  { name: 'Chennai', state: 'Tamil Nadu', tier: 1 },
  { name: 'Kolkata', state: 'West Bengal', tier: 1 },
  { name: 'Pune', state: 'Maharashtra', tier: 1 },
  { name: 'Ahmedabad', state: 'Gujarat', tier: 1 },
  { name: 'Jaipur', state: 'Rajasthan', tier: 1 },
  { name: 'Lucknow', state: 'Uttar Pradesh', tier: 1 },
  { name: 'Chandigarh', state: 'Punjab', tier: 1 },
  { name: 'Kochi', state: 'Kerala', tier: 1 },
  { name: 'Indore', state: 'Madhya Pradesh', tier: 2 },
  { name: 'Bhopal', state: 'Madhya Pradesh', tier: 2 },
  { name: 'Nagpur', state: 'Maharashtra', tier: 2 },
  { name: 'Coimbatore', state: 'Tamil Nadu', tier: 2 },
  { name: 'Vadodara', state: 'Gujarat', tier: 2 },
  { name: 'Surat', state: 'Gujarat', tier: 2 },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', tier: 2 },
  { name: 'Thiruvananthapuram', state: 'Kerala', tier: 2 },
  { name: 'Mysuru', state: 'Karnataka', tier: 2 },
  { name: 'Guwahati', state: 'Assam', tier: 2 },
  { name: 'Bhubaneswar', state: 'Odisha', tier: 2 },
  { name: 'Dehradun', state: 'Uttarakhand', tier: 2 },
  { name: 'Patna', state: 'Bihar', tier: 2 },
  { name: 'Ranchi', state: 'Jharkhand', tier: 2 },
  { name: 'Raipur', state: 'Chhattisgarh', tier: 2 },
  { name: 'Amritsar', state: 'Punjab', tier: 2 },
  { name: 'Ludhiana', state: 'Punjab', tier: 2 },
  { name: 'Jodhpur', state: 'Rajasthan', tier: 2 },
  { name: 'Udaipur', state: 'Rajasthan', tier: 2 },
  { name: 'Madurai', state: 'Tamil Nadu', tier: 2 },
  { name: 'Vijayawada', state: 'Andhra Pradesh', tier: 2 },
  { name: 'Goa', state: 'Goa', tier: 2 },
  { name: 'Mangalore', state: 'Karnataka', tier: 2 },
  { name: 'Noida', state: 'Uttar Pradesh', tier: 1 },
  { name: 'Gurgaon', state: 'Haryana', tier: 1 },
  { name: 'Faridabad', state: 'Haryana', tier: 2 },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', tier: 2 },
  { name: 'Thane', state: 'Maharashtra', tier: 1 },
  { name: 'Navi Mumbai', state: 'Maharashtra', tier: 1 },
  { name: 'Agra', state: 'Uttar Pradesh', tier: 2 },
  { name: 'Varanasi', state: 'Uttar Pradesh', tier: 2 },
  { name: 'Kanpur', state: 'Uttar Pradesh', tier: 2 },
  { name: 'Nashik', state: 'Maharashtra', tier: 2 },
  { name: 'Aurangabad', state: 'Maharashtra', tier: 2 },
  { name: 'Rajkot', state: 'Gujarat', tier: 2 },
  { name: 'Hubli', state: 'Karnataka', tier: 3 },
  { name: 'Shimla', state: 'Himachal Pradesh', tier: 3 },
  { name: 'Jammu', state: 'Jammu & Kashmir', tier: 3 },
];

export const CAR_BRANDS = [
  'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Kia',
  'Toyota', 'Honda', 'MG', 'Skoda', 'Volkswagen',
  'Renault', 'Citroen', 'Jeep', 'BYD', 'Nissan',
];

export const BODY_TYPES = ['Hatchback', 'Sedan', 'SUV', 'MPV', 'Crossover'];

export const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];

export const TRANSMISSION_TYPES = ['Manual', 'Automatic', 'AMT', 'CVT', 'DCT', 'iMT'];

export const BUDGET_RANGE = {
  min: 3,     // ₹3 Lakh
  max: 50,    // ₹50 Lakh
  step: 0.5,
};

export const PRIORITY_OPTIONS = [
  { id: 'mileage', label: '⛽ Fuel Efficiency', description: 'Best kmpl for your money' },
  { id: 'safety', label: '🛡️ Safety', description: 'Airbags, NCAP rating, ADAS' },
  { id: 'features', label: '✨ Features', description: 'Tech, comfort, convenience' },
  { id: 'performance', label: '🏎️ Performance', description: 'Power, acceleration, handling' },
  { id: 'resaleValue', label: '📈 Resale Value', description: 'Holds value over time' },
  { id: 'serviceNetwork', label: '🔧 Service Network', description: 'Easy maintenance access' },
  { id: 'comfort', label: '🛋️ Comfort', description: 'Ride quality, NVH, space' },
  { id: 'brandValue', label: '🏆 Brand Value', description: 'Reputation and trust' },
];

export const USAGE_TYPES = [
  { id: 'City', label: 'City Driving', description: 'Daily commute, stop-and-go traffic' },
  { id: 'Highway', label: 'Highway Cruising', description: 'Long drives, intercity travel' },
  { id: 'Mixed', label: 'Mixed Usage', description: 'Both city and highway' },
];

export const FORUM_CATEGORIES = [
  { id: 'review', label: 'User Reviews', icon: '⭐' },
  { id: 'buying-advice', label: 'Buying Advice', icon: '🤔' },
  { id: 'ownership', label: 'Ownership Experience', icon: '🚗' },
  { id: 'comparison', label: 'Car Comparison', icon: '⚖️' },
  { id: 'general', label: 'General Discussion', icon: '💬' },
  { id: 'tips', label: 'Tips & Tricks', icon: '💡' },
];
