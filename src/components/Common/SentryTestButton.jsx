import * as Sentry from '@sentry/react';

/**
 * Test button - only visible in development
 * Remove or hide in production
 */
const SentryTestButton = () => {
  if (process.env.REACT_APP_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => {
          Sentry.addBreadcrumb({
            category: 'test',
            message: 'User clicked test error button',
            level: 'info',
          });
          throw new Error('Sentry Test Error - Fashion App');
        }}
        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
      >
        🧪 Test Sentry
      </button>
    </div>
  );
};

export default SentryTestButton;