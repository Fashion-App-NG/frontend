import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import VendorService from '../../services/vendorService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const VendorApiDebug = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: API Connection
      console.log('🧪 Testing API connection...');
      results.apiConnection = await VendorService.testConnection();
      
      // Test 2: Get Vendor Products
      if (user?.id) {
        console.log('🧪 Testing get vendor products...');
        try {
          const response = await VendorService.getVendorProducts(user.id);
          results.getProducts = { success: true, count: response.products?.length || 0, response };
        } catch (error) {
          results.getProducts = { success: false, error: error.message };
        }
      }

      // Test 3: Environment Check
      results.environment = {
        apiUrl: API_BASE_URL,
        userId: user?.id,
        userRole: user?.role,
        hasAuthToken: !!(localStorage.getItem('authToken') || localStorage.getItem('vendorToken'))
      };

    } catch (error) {
      results.error = error.message;
    }

    setTestResults(results);
    setLoading(false);
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-bold text-blue-600 mb-2">🔧 API Debug Panel</h3>
      
      <button
        onClick={runTests}
        disabled={loading}
        className="mb-3 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Run API Tests'}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div className="text-xs space-y-2">
          {testResults.apiConnection !== undefined && (
            <div className={`p-2 rounded ${testResults.apiConnection ? 'bg-green-100' : 'bg-red-100'}`}>
              <strong>API Connection:</strong> {testResults.apiConnection ? '✅ OK' : '❌ Failed'}
            </div>
          )}

          {testResults.getProducts && (
            <div className={`p-2 rounded ${testResults.getProducts.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <strong>Get Products:</strong> {testResults.getProducts.success ? 
                `✅ ${testResults.getProducts.count} products` : 
                `❌ ${testResults.getProducts.error}`}
            </div>
          )}

          {testResults.environment && (
            <div className="p-2 bg-gray-100 rounded">
              <strong>Environment:</strong>
              <div>API: {testResults.environment.apiUrl}</div>
              <div>User ID: {testResults.environment.userId || 'None'}</div>
              <div>Role: {testResults.environment.userRole || 'None'}</div>
              <div>Auth Token: {testResults.environment.hasAuthToken ? '✅' : '❌'}</div>
            </div>
          )}

          {testResults.error && (
            <div className="p-2 bg-red-100 rounded">
              <strong>Error:</strong> {testResults.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorApiDebug;