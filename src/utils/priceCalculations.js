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
  // UPDATED: Access the platformFee.amount property correctly
  const platformFeePerYard = item.platformFee?.amount || 0;
  return basePrice + platformFeePerYard;
};

/**
 * Get all-inclusive price per yard (base price + tax + platform fee)
 * @param {Object} item - Product/cart item
 * @param {number} taxRate - Tax rate (default 0.075 for 7.5%)
 * @returns {number} All-inclusive price per yard
 */
export const getAllInclusivePricePerYard = (item, taxRate = 0.075) => {
  if (!item) return 0;
  
  // Get base price
  const basePrice = item.pricePerYard || 0;
  
  // Calculate tax on the base price only
  const taxAmount = basePrice * taxRate;
  
  // Add platform fee after tax calculation (platform fee is not taxed)
  // UPDATED: Access the platformFee.amount property correctly
  const platformFeePerYard = item.platformFee?.amount || 0;
  
  // Return the total: base price + tax + platform fee
  return basePrice + taxAmount + platformFeePerYard;
};

/**
 * Calculate total price for a line item with all taxes and fees included
 * @param {Object} item - Cart/order item
 * @param {number} taxRate - Tax rate (default 0.075 for 7.5%)
 * @returns {number} Total price including everything
 */
export const getAllInclusiveLineItemTotal = (item, taxRate = 0.075) => {
  if (!item) return 0;
  
  const quantity = item.quantity || 1;
  const basePrice = item.pricePerYard || 0;
  
  // Calculate tax on the base price only
  const taxAmount = basePrice * taxRate;
  
  // Add platform fee (untaxed)
  // UPDATED: Access the platformFee.amount property correctly
  const platformFeePerYard = item.platformFee?.amount || 0;
  
  // Calculate total: (base + tax + platform fee) * quantity
  return (basePrice + taxAmount + platformFeePerYard) * quantity;
};

/**
 * Calculate all-inclusive subtotal for all items
 * @param {Array} items - Array of cart/order items
 * @param {number} taxRate - Tax rate (default 0.075 for 7.5%)
 * @returns {number} Subtotal with taxes and fees
 */
export const getAllInclusiveSubtotal = (items, taxRate = 0.075) => {
  if (!items || !Array.isArray(items)) return 0;
  
  return items.reduce((sum, item) => sum + getAllInclusiveLineItemTotal(item, taxRate), 0);
};