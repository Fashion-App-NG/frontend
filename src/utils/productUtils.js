/**
 * Helper function to get proper product image URL from various API response formats
 */
export const getProductImageUrl = (product) => {
  if (!product) return '/assets/img/placeholder.png';
  
  // Handle images array with objects
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    
    // Image object with url
    if (typeof firstImage === 'object' && firstImage.url) {
      return firstImage.url;
    }
    
    // Direct string URL
    if (typeof firstImage === 'string') {
      return firstImage;
    }
  }
  
  // Handle single image property
  if (product.image) {
    // Image object with url
    if (typeof product.image === 'object' && product.image.url) {
      return product.image.url;
    }
    
    // Direct string URL
    return product.image;
  }
  
  // Fallback
  return '/assets/img/placeholder.png';
};

/**
 * Format price with currency symbol
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return 'Price not available';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Format number with commas
 */
export const formatNumber = (number) => {
  if (!number && number !== 0) return '0';
  return number.toLocaleString();
};

/**
 * Get payment card image path
 */
export const getPaymentCardImage = (type) => {
  return `/assets/img/payments/${type.toLowerCase()}.png`;
};