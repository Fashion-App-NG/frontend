import * as Sentry from "@sentry/react";
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';

// ✅ Initialize Sentry BEFORE rendering
Sentry.init({
  dsn: "https://31495b99d8cd03bd3e7f22470df593c2@o4510612747976704.ingest.de.sentry.io/4510612750008400",
  
  // ✅ Environment-based configuration
  environment: process.env.REACT_APP_ENV || 'development',
  
  // ✅ FIX: Only enable in production
  enabled: process.env.NODE_ENV === 'production' && 
           window.location.hostname !== 'localhost',
  
  // ✅ Don't send PII by default (NDPR compliance)
  sendDefaultPii: false,
  
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // Mask all text and inputs for privacy
      maskAllText: true,
      maskAllInputs: true,
    }),
  ],
  
  // ✅ Tracing - reduce in production for cost
  tracesSampleRate: process.env.REACT_APP_ENV === 'production' ? 0.1 : 1.0,
  
  // ✅ Only trace your own API, not third parties
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/api\.faari\.app/,
    /^https:\/\/backend-bsm1\.onrender\.com/,
  ],
  
  // ✅ Session Replay - 10% normal, 100% on errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // ✅ Filter out non-actionable errors
  beforeSend(event, hint) {
    const error = hint.originalException;
    
    // Ignore network errors that aren't actionable
    if (error?.message?.includes('Failed to fetch')) {
      // Still send but tag as network error
      event.tags = { ...event.tags, error_type: 'network' };
    }
    
    // Ignore browser extension errors
    if (error?.stack?.includes('chrome-extension://')) {
      return null;
    }
    
    // Ignore ResizeObserver errors (browser quirk)
    if (error?.message?.includes('ResizeObserver')) {
      return null;
    }
    
    return event;
  },
  
  // ✅ Don't capture console logs as breadcrumbs in production
  beforeBreadcrumb(breadcrumb) {
    if (process.env.REACT_APP_ENV === 'production' && breadcrumb.category === 'console') {
      return null;
    }
    return breadcrumb;
  },
});

// Add this AFTER Sentry.init() to debug

// ✅ Temporary debug - remove after confirming Sentry works
console.log('🔍 Sentry Debug:', {
  environment: process.env.REACT_APP_ENV,
  nodeEnv: process.env.NODE_ENV,
  hostname: window.location.hostname,
  // ✅ FIX: Match actual enabled condition from lines 15-16
  sentryEnabled: process.env.NODE_ENV === 'production' && window.location.hostname !== 'localhost',
  dsn: process.env.REACT_APP_SENTRY_DSN ? 'Set' : 'Not set (using hardcoded)',
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);