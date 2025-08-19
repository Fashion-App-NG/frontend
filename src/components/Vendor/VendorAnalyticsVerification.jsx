import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import vendorAnalyticsService from '../../services/vendorAnalyticsService';

const VendorAnalyticsVerification = () => {
  const { user } = useAuth();
  const [verificationResults, setVerificationResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runVerification = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const results = await vendorAnalyticsService.verifyAnalyticsEndpoints(user.id);
      setVerificationResults(results);
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && user?.role === 'vendor') {
      runVerification();
    }
  }, [user?.id, user?.role]);

  if (user?.role !== 'vendor') return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-blue-800">🔍 VENDOR ANALYTICS VERIFICATION</h4>
        <button 
          onClick={runVerification}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Re-test Endpoints'}
        </button>
      </div>

      {verificationResults && (
        <div className="space-y-4">
          {Object.entries(verificationResults).map(([endpointName, result]) => (
            <div key={endpointName} className="bg-white rounded p-3 border">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-800">{endpointName}</h5>
                <span className={`px-2 py-1 rounded text-xs ${
                  result.status === 200 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {result.status || 'ERROR'}
                </span>
              </div>
              
              {result.status === 200 && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p><strong>Response Keys:</strong> {result.responseKeys?.join(', ')}</p>
                    <p><strong>Has Success:</strong> {result.hasSuccess ? '✅' : '❌'}</p>
                    <p><strong>Has Data:</strong> {result.hasData ? '✅' : '❌'}</p>
                  </div>
                  <div>
                    <p><strong>Has Analytics:</strong> {result.hasAnalytics ? '✅' : '❌'}</p>
                    <p><strong>Has Stats:</strong> {result.hasStats ? '✅' : '❌'}</p>
                    <p><strong>Has Summary:</strong> {result.hasSummary ? '✅' : '❌'}</p>
                  </div>
                </div>
              )}

              {result.error && (
                <p className="text-red-600 text-sm mt-2">❌ {result.error}</p>
              )}

              {result.sampleData && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600 text-sm">📋 Sample Response</summary>
                  <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(result.sampleData, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorAnalyticsVerification;