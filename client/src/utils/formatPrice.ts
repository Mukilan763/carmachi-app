// ========================================
// CarMachi — Indian Price Formatting
// All amounts in ₹ with Lakhs/Crore system
// ========================================

/**
 * Formats a number as Indian Rupees with Lakhs/Crore notation.
 * e.g., 750000 → "₹7.50 Lakh"
 *       1500000 → "₹15.00 Lakh"
 *       10000000 → "₹1.00 Crore"
 */
export function formatPrice(amount: number): string {
  if (amount >= 10000000) {
    const crore = amount / 10000000;
    return `₹${crore.toFixed(2)} Crore`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `₹${lakh.toFixed(2)} Lakh`;
  }
  if (amount >= 1000) {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  return `₹${amount}`;
}

/**
 * Formats price range.
 * e.g., "₹6.50 - ₹12.30 Lakh"
 */
export function formatPriceRange(min: number, max: number): string {
  const minLakh = min / 100000;
  const maxLakh = max / 100000;

  if (max >= 10000000) {
    return `₹${minLakh.toFixed(2)} Lakh - ₹${(max / 10000000).toFixed(2)} Crore`;
  }

  return `₹${minLakh.toFixed(2)} - ₹${maxLakh.toFixed(2)} Lakh`;
}

/**
 * Formats a compact price (for cards etc.)
 * e.g., 750000 → "₹7.5L"
 */
export function formatPriceCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${(amount / 1000).toFixed(0)}K`;
}

/**
 * Formats monthly/annual cost
 * e.g., 5200 → "₹5,200"
 */
export function formatCost(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Formats cost per km
 * e.g., 5.8 → "₹5.80/km"
 */
export function formatCostPerKm(amount: number): string {
  return `₹${amount.toFixed(2)}/km`;
}

/**
 * Converts Lakhs number to absolute ₹
 * e.g., 12.5 → 1250000
 */
export function lakhsToAbsolute(lakhs: number): number {
  return lakhs * 100000;
}

/**
 * Converts absolute ₹ to Lakhs
 * e.g., 1250000 → 12.5
 */
export function absoluteToLakhs(amount: number): number {
  return amount / 100000;
}
