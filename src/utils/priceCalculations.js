// Create a shared utility file for price calculations

/**
 * Calculate line item total including platform fee
 * @param {Object} item - Cart/order item
 * @returns {number} Total price for the line item
 */
export const calculateLineItemTotal = (item) => {
  const baseSubtotal = (item.pricePerYard || 0) * (item.quantity || 1);
  //const platformFee = getPlatformFee(item);
  //return baseSubtotal + platformFee;
  return baseSubtotal;
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
  const platformFeePerYard = getPlatformFee(item);
  return basePrice + platformFeePerYard;
};

/**
 * Get all-inclusive price per yard (base price + tax + platform fee)
 * @param {Object} item - Product/cart item
 * @param {number} taxRate - Tax rate (required, no default)
 * @returns {number} All-inclusive price per yard
 */
export const getAllInclusivePricePerYard = (item, taxRate) => {
  if (!item) return 0;
  if (!taxRate && taxRate !== 0) {
    console.warn('Tax rate not provided to getAllInclusivePricePerYard');
    return item.pricePerYard || 0; // Return base price if no tax rate
  }
  
  const basePrice = item.pricePerYard || 0;
  const taxAmount = basePrice * taxRate;
  const platformFeePerYard = getPlatformFee(item);
  
  return basePrice + taxAmount + platformFeePerYard;
};

/**
 * Calculate total price for a line item with all taxes and fees included
 * @param {Object} item - Cart/order item
 * @param {number} taxRate - Tax rate (required, no default)
 * @returns {number} Total price including everything
 */
export const getAllInclusiveLineItemTotal = (item, taxRate) => {
  if (!item) return 0;
  if (!taxRate && taxRate !== 0) {
    console.warn('Tax rate not provided to getAllInclusiveLineItemTotal');
    return calculateLineItemTotal(item); // Fallback to base calculation
  }
  
  const quantity = item.quantity || 1;
  const basePrice = item.pricePerYard || 0;
  const taxAmount = basePrice * taxRate;
  const platformFeePerYard = getPlatformFee(item);
  
  return (basePrice + taxAmount + platformFeePerYard) * quantity;
};

/**
 * Calculate all-inclusive subtotal for all items
 * @param {Array} items - Array of cart/order items
 * @param {number} taxRate - Tax rate (required, no default)
 * @returns {number} Subtotal with taxes and fees
 */
export const getAllInclusiveSubtotal = (items, taxRate) => {
  if (!items || !Array.isArray(items)) return 0;
  if (!taxRate && taxRate !== 0) {
    console.warn('Tax rate not provided to getAllInclusiveSubtotal');
    return calculateSubtotal(items); // Fallback to base calculation
  }
  
  return items.reduce((sum, item) => sum + getAllInclusiveLineItemTotal(item, taxRate), 0);
};

/**
 * Get platform fee from item regardless of structure
 * @param {Object} item - Product or cart item
 * @returns {number} Platform fee amount
 */
export const getPlatformFee = (item) => {
  // Handle both formats
  if (item.platformFeeAmount) {
    return item.platformFeeAmount / (item.quantity || 1);
  }
  
  if (item.platformFee?.amount) {
    return item.platformFee.amount / (item.quantity || 1);
  }
  
  return 0;
};

/**
 * Conditionally round subtotal to whole Naira
 * Only rounds on payment step to match backend expectations
 * @param {number} amount - Amount to potentially round
 * @param {boolean} shouldRound - Whether to round (true on payment step)
 * @returns {number} Rounded or original amount
 */
export const roundSubtotalForPayment = (amount, shouldRound = false) => {
  return shouldRound ? Math.round(amount) : amount;
};

/**
 * Calculate VAT/tax rate from tax amount and base price
 * Safe division with zero-check guard
 * @param {number} taxAmount - Tax amount
 * @param {number} basePrice - Base price (before tax)
 * @returns {number} Tax rate (0 if basePrice is 0 or invalid)
 */
export const calculateTaxRate = (taxAmount, basePrice) => {
  if (!basePrice || basePrice <= 0) return 0;
  const tax = parseFloat(taxAmount) || 0;
  const base = parseFloat(basePrice) || 0;
  return base > 0 ? tax / base : 0;
};

/**
 * Get tax rate for display from cart items
 * Handles both percentage (2) and decimal (0.02) formats
 * @param {Array} cartItems - Array of cart items
 * @returns {number} Tax rate in decimal format (0.02 for 2%)
 */
export const getTaxRateFromCart = (cartItems) => {
  if (!cartItems || cartItems.length === 0) return 0;
  const firstItem = cartItems[0];
  
  // ✅ Use the taxRate field directly from the API response
  if (firstItem.taxRate !== undefined && firstItem.taxRate !== null) {
    const rate = parseFloat(firstItem.taxRate);
    // ✅ Normalize: if rate >= 1, assume percentage format, convert to decimal
    return rate >= 1 ? rate / 100 : rate;
  }
  
  // Fallback: calculate from taxAmount and pricePerYard if taxRate not present
  return calculateTaxRate(firstItem.taxAmount, firstItem.pricePerYard);
};

/**
 * Calculate tax per item proportionally for display
 * @param {Object} item - Order item
 * @param {number} orderTaxAmount - Total tax amount for the order
 * @param {Array} items - All items in the order
 * @returns {number} Tax amount allocated to this item
 */
export const getItemTaxAmount = (item, orderTaxAmount, items) => {
  if (!orderTaxAmount) return 0;
  
  const totalBasePrice = items.reduce((sum, i) => sum + (i.pricePerYard * i.quantity), 0);
  
  // Guard against division by zero
  if (totalBasePrice === 0) return 0;
  
  const itemBasePrice = item.pricePerYard * item.quantity;
  const proportion = itemBasePrice / totalBasePrice;
  
  return orderTaxAmount * proportion;
};

/**
 * Get display price per yard including all fees and taxes
 * @param {Object} item - Order item
 * @param {number} orderTaxAmount - Total tax amount for the order
 * @param {Array} items - All items in the order
 * @returns {number} All-inclusive price per yard
 */
export const getDisplayPricePerYardWithTax = (item, orderTaxAmount, items) => {
  const basePrice = item.pricePerYard || 0;
  const platformFeePerYard = (item.platformFeeAmount || 0) / (item.quantity || 1);
  
  const itemTaxTotal = getItemTaxAmount(item, orderTaxAmount, items);
  const taxPerYard = itemTaxTotal / (item.quantity || 1);
  
  return basePrice + taxPerYard + platformFeePerYard;
};