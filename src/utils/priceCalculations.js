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