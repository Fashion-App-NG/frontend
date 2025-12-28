import * as Sentry from "@sentry/react";

/**
 * Track API errors with context
 */
export const trackApiError = (error, context = {}) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'api_error');
    scope.setContext('api_context', context);
    Sentry.captureException(error);
  });
};

/**
 * Track cart/checkout errors
 */
export const trackCheckoutError = (error, cartData = {}) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'checkout_error');
    scope.setContext('cart', {
      itemCount: cartData.items?.length || 0,
      total: cartData.total || 0,
      // Don't include sensitive payment info
    });
    Sentry.captureException(error);
  });
};

/**
 * Track product upload errors (for vendors)
 */
export const trackUploadError = (error, uploadData = {}) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'upload_error');
    scope.setContext('upload', {
      productCount: uploadData.productCount || 1,
      imageCount: uploadData.imageCount || 0,
      // Don't include actual product data
    });
    Sentry.captureException(error);
  });
};

/**
 * Track custom events/metrics
 */
export const trackEvent = (eventName, data = {}) => {
  Sentry.addBreadcrumb({
    category: 'user_action',
    message: eventName,
    data,
    level: 'info',
  });
};

/**
 * Log info message (visible in Sentry breadcrumbs)
 */
export const logInfo = (message, data = {}) => {
  if (process.env.REACT_APP_ENV !== 'production') {
    console.log(message, data);
  }
  Sentry.addBreadcrumb({
    category: 'app',
    message,
    data,
    level: 'info',
  });
};