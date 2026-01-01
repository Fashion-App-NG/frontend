import * as Sentry from '@sentry/react';

const SentryTestButton = () => {
  // ✅ FIX: Check both REACT_APP_ENV and NODE_ENV
  const isProduction = process.env.REACT_APP_ENV === 'production' || 
                       process.env.NODE_ENV === 'production';
  
  // Hide in production
  if (isProduction) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => {
          console.log('🧪 Testing Sentry...');
          Sentry.addBreadcrumb({
            category: 'test',
            message: 'User clicked test error button',
            level: 'info',
          });
          // ✅ Capture exception instead of throwing (safer for testing)
          Sentry.captureException(new Error('Sentry Test Error - Fashion App'));
          alert('Test error sent to Sentry! Check your dashboard.');
        }}
        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 shadow-lg"
      >
        🧪 Test Sentry
      </button>
    </div>
  );
};

export default SentryTestButton;