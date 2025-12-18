/**
 * Format price with Naira currency symbol
 * @param {number|string} price - Price to format
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  if (price == null || isNaN(price)) return "₦0";
  return `₦${parseFloat(price).toLocaleString()}`;
};

// Add a new utility function for calculating total price with platform fee
export const getPriceWithPlatformFee = (product) => {
  if (!product) return 0;
  
  const basePrice = product.pricePerYard || product.price || 0;
  const platformFee = product.platformFee?.amount || 0;
  
  return basePrice + platformFee;
};

export default formatPrice;