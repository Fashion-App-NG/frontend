import React from 'react';

/**
 * Centralized error handling utility for the application
 */

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  STORAGE: 'STORAGE_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Map HTTP status codes to error types
const statusCodeToErrorType = {
  400: ERROR_TYPES.VALIDATION,
  401: ERROR_TYPES.AUTHENTICATION,
  403: ERROR_TYPES.AUTHORIZATION,
  404: ERROR_TYPES.NOT_FOUND,
  422: ERROR_TYPES.VALIDATION,
  500: ERROR_TYPES.SERVER,
  502: ERROR_TYPES.NETWORK,
  503: ERROR_TYPES.NETWORK,
  504: ERROR_TYPES.NETWORK
};

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, originalError = null, statusCode = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Parse and categorize errors from different sources
 */
export const parseError = (error) => {
  // Handle AppError instances
  if (error instanceof AppError) {
    return error;
  }

  // Handle fetch/network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AppError(
      'Network connection failed. Please check your internet connection.',
      ERROR_TYPES.NETWORK,
      error
    );
  }

  // Handle API response errors
  if (error.response) {
    const statusCode = error.response.status;
    const errorType = statusCodeToErrorType[statusCode] || ERROR_TYPES.SERVER;
    const message = error.response.data?.message || error.message || 'An error occurred';
    
    return new AppError(message, errorType, error, statusCode);
  }

  // Handle validation errors
  if (error.message && error.message.includes('Validation failed')) {
    return new AppError(error.message, ERROR_TYPES.VALIDATION, error);
  }

  // Handle storage errors (localStorage, sessionStorage)
  if (error.name === 'QuotaExceededError' || error.message.includes('storage')) {
    return new AppError(
      'Storage limit exceeded. Please clear your browser data.',
      ERROR_TYPES.STORAGE,
      error
    );
  }

  // Default to unknown error
  return new AppError(
    error.message || 'An unexpected error occurred',
    ERROR_TYPES.UNKNOWN,
    error
  );
};

/**
 * Get user-friendly error messages
 */
export const getErrorMessage = (error) => {
  const parsedError = parseError(error);
  
  const userFriendlyMessages = {
    [ERROR_TYPES.NETWORK]: 'Connection failed. Please check your internet and try again.',
    [ERROR_TYPES.AUTHENTICATION]: 'Please log in to continue.',
    [ERROR_TYPES.AUTHORIZATION]: 'You don\'t have permission to perform this action.',
    [ERROR_TYPES.NOT_FOUND]: 'The requested resource was not found.',
    [ERROR_TYPES.VALIDATION]: parsedError.message, // Use original validation message
    [ERROR_TYPES.SERVER]: 'Server error occurred. Please try again later.',
    [ERROR_TYPES.STORAGE]: 'Storage limit exceeded. Please clear browser data.',
    [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
  };

  return userFriendlyMessages[parsedError.type] || parsedError.message;
};

/**
 * Get error severity level
 */
export const getErrorSeverity = (error) => {
  const parsedError = parseError(error);
  
  const severityMap = {
    [ERROR_TYPES.NETWORK]: 'warning',
    [ERROR_TYPES.AUTHENTICATION]: 'info',
    [ERROR_TYPES.AUTHORIZATION]: 'warning',
    [ERROR_TYPES.NOT_FOUND]: 'info',
    [ERROR_TYPES.VALIDATION]: 'warning',
    [ERROR_TYPES.SERVER]: 'error',
    [ERROR_TYPES.STORAGE]: 'warning',
    [ERROR_TYPES.UNKNOWN]: 'error'
  };

  return severityMap[parsedError.type] || 'error';
};

/**
 * Log errors for debugging/monitoring
 */
export const logError = (error, context = {}) => {
  const parsedError = parseError(error);
  
  const errorLog = {
    message: parsedError.message,
    type: parsedError.type,
    timestamp: parsedError.timestamp,
    context,
    stack: parsedError.stack,
    originalError: parsedError.originalError?.message
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 ${parsedError.type} Error`);
    console.error('Message:', parsedError.message);
    console.error('Context:', context);
    if (parsedError.originalError) {
      console.error('Original Error:', parsedError.originalError);
    }
    console.error('Stack:', parsedError.stack);
    console.groupEnd();
  }

  // In production, you could send to error monitoring service
  // Example: Sentry, LogRocket, Bugsnag, etc.
  if (process.env.NODE_ENV === 'production') {
    // sendToErrorMonitoring(errorLog);
  }

  return errorLog;
};

/**
 * Handle errors with automatic logging and user notification
 */
export const handleError = (error, context = {}, showToUser = true) => {
  const parsedError = parseError(error);
  
  // Log the error
  logError(parsedError, context);
  
  // Return user-friendly information
  return {
    message: getErrorMessage(parsedError),
    severity: getErrorSeverity(parsedError),
    type: parsedError.type,
    shouldRetry: [ERROR_TYPES.NETWORK, ERROR_TYPES.SERVER].includes(parsedError.type),
    shouldLogin: parsedError.type === ERROR_TYPES.AUTHENTICATION
  };
};

/**
 * Retry mechanism for failed operations
 */
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const parsedError = parseError(error);
      
      // Don't retry on certain error types
      if ([ERROR_TYPES.AUTHENTICATION, ERROR_TYPES.AUTHORIZATION, ERROR_TYPES.VALIDATION].includes(parsedError.type)) {
        throw parsedError;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw parsedError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
      
      console.log(`Retrying operation (attempt ${attempt + 1}/${maxRetries})`);
    }
  }
  
  throw parseError(lastError);
};

/**
 * Error boundary helper for React components
 */
export const createErrorBoundary = (fallbackComponent) => {
  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error: parseError(error) };
    }

    componentDidCatch(error, errorInfo) {
      logError(error, { errorInfo });
    }

    render() {
      if (this.state.hasError) {
        return fallbackComponent ? 
          fallbackComponent(this.state.error) : 
          React.createElement('div', { 
            className: 'error-boundary p-4 bg-red-50 border border-red-200 rounded' 
          }, 'Something went wrong. Please refresh the page.');
      }

      return this.props.children;
    }
  };
};

const errorHandler = {
  ERROR_TYPES,
  AppError,
  parseError,
  getErrorMessage,
  getErrorSeverity,
  logError,
  handleError,
  retryOperation,
  createErrorBoundary
};

export default errorHandler;