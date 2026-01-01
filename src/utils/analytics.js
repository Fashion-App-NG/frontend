/**
 * Google Analytics 4 utility for tracking events
 * Only tracks in production
 */

const GA_MEASUREMENT_ID = 'G-7F0L1S997H';

const isGAEnabled = () => {
  return (
    typeof window !== 'undefined' &&
    typeof window.gtag === 'function' &&
    window.location.hostname !== 'localhost'
  );
};

export const trackPageView = (path, title) => {
  if (!isGAEnabled()) return;
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title,
  });
};

export const trackEvent = (eventName, params = {}) => {
  if (!isGAEnabled()) return;
  window.gtag('event', eventName, params);
};

export const trackProductView = (product) => {
  if (!isGAEnabled() || !product) return;
  window.gtag('event', 'view_item', {
    currency: 'NGN',
    value: product.pricePerYard || 0,
    items: [{
      item_id: product._id || product.id,
      item_name: product.name,
      item_category: product.materialType,
      price: product.pricePerYard || 0,
    }]
  });
};

export const trackAddToCart = (product, quantity = 1) => {
  if (!isGAEnabled() || !product) return;
  window.gtag('event', 'add_to_cart', {
    currency: 'NGN',
    value: (product.pricePerYard || 0) * quantity,
    items: [{
      item_id: product._id || product.id,
      item_name: product.name,
      price: product.pricePerYard || 0,
      quantity: quantity,
    }]
  });
};

export const trackPurchase = (orderId, total, items) => {
  if (!isGAEnabled()) return;
  window.gtag('event', 'purchase', {
    transaction_id: orderId,
    currency: 'NGN',
    value: total,
    items: items.map(item => ({
      item_id: item.productId || item._id,
      item_name: item.name,
      price: item.pricePerYard || 0,
      quantity: item.quantity || 1,
    }))
  });
};

export const trackSignUp = (method = 'email') => {
  if (!isGAEnabled()) return;
  window.gtag('event', 'sign_up', { method });
};

export const trackLogin = (method = 'email') => {
  if (!isGAEnabled()) return;
  window.gtag('event', 'login', { method });
};

// ✅ FIX: Assign to variable before exporting
const analytics = {
  trackPageView,
  trackEvent,
  trackProductView,
  trackAddToCart,
  trackPurchase,
  trackSignUp,
  trackLogin
};

export default analytics;