// Create a shared utility file for price calculations

/**
 * Calculate line item total including platform fee
 * @param {Object} item - Cart/order item
 * @returns {number} Total price for the line item
 */
export const calculateLineItemTotal = (item) => {
  const baseSubtotal = (item.pricePerYard || 0) * (item.quantity || 1);
  const platformFee = item.platformFeeAmount || 0;
  return baseSubtotal + platformFee;
};

/**
 * Calculate subtotal for all items including platform fees
 * @param {Array} items - Array of cart/order items
 * @returns {number} Subtotal
 */
export const calculateSubtotal = (items) => {
  return (items || []).reduce((total, item) => {
    return total + calculateLineItemTotal(item);
  }, 0);
};

/**
 * Get display price per yard (including platform fee portion)
 * @param {Object} item - Cart/order item
 * @returns {number} Price per yard including platform fee
 */
export const getDisplayPricePerYard = (item) => {
  const basePrice = item.pricePerYard || 0;
  // For display, add platform fee to a single yard
  const platformFeePerYard = item.platformFeeAmount ? item.platformFeeAmount / 1 : 0;
  return basePrice + platformFeePerYard;
};

/**
 * Get all-inclusive price per yard (base price + platform fee + tax)
 * @param {Object} item - Product/cart item
 * @param {number} taxRate - Tax rate (default 0.075 for 7.5%)
 * @returns {number} All-inclusive price per yard
 */
export const getAllInclusivePricePerYard = (item, taxRate = 0.075) => {
  // Get base price and platform fee
  const basePrice = item.pricePerYard || 0;
  const platformFeePerYard = item.platformFeeAmount ? item.platformFeeAmount / 1 : 0;
  
  // Add tax to the combined base price and platform fee
  const preTaxPrice = basePrice + platformFeePerYard;
  const taxPerYard = preTaxPrice * taxRate;
  
  return preTaxPrice + taxPerYard;
};

/**
 * Calculate total price for a line item with all taxes and fees included
 * @param {Object} item - Cart/order item
 * @param {number} taxRate - Tax rate (default 0.075 for 7.5%)
 * @returns {number} Total price including everything
 */
export const getAllInclusiveLineItemTotal = (item, taxRate = 0.075) => {
  return getAllInclusivePricePerYard(item, taxRate) * (item.quantity || 1);
};

/**
 * Calculate subtotal for cart with all taxes and fees included
 * @param {Array} items - Cart items
 * @param {number} taxRate - Tax rate (default 0.075 for 7.5%)
 * @returns {number} Subtotal with all inclusive pricing
 */
export const getAllInclusiveSubtotal = (items, taxRate = 0.075) => {
  return items.reduce((total, item) => {
    return total + getAllInclusiveLineItemTotal(item, taxRate);
  }, 0);
};