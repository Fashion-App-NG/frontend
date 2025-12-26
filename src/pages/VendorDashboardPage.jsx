import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import VendorDashboardContent from '../components/Vendor/VendorDashboardContent';
import { useRequireAuth } from '../hooks/useRequireAuth';

const VendorDashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { loading, isAuthorized } = useRequireAuth({
    requiredRole: 'vendor',
    redirectTo: '/login/vendor'
  });

  const [showMessage, setShowMessage] = useState(false);
  const [displayMessage, setDisplayMessage] = useState(null);
  const [displayMessageType, setDisplayMessageType] = useState(null);

  useEffect(() => {
    const message = location.state?.message;
    const messageType = location.state?.type;

    if (message) {
      setDisplayMessage(message);
      setDisplayMessageType(messageType);
      setShowMessage(true);

      navigate(location.pathname, { replace: true, state: {} });
      
      const timer = setTimeout(() => {
        setShowMessage(false);
        setTimeout(() => {
          setDisplayMessage(null);
          setDisplayMessageType(null);
        }, 300);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state?.message, location.state?.type, location.pathname, navigate]);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showMessage && displayMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 max-w-md transition-opacity duration-300 ${
            displayMessageType === 'info' ? 'bg-blue-50 border-l-4 border-blue-500' :
            displayMessageType === 'success' ? 'bg-green-50 border-l-4 border-green-500' :
            'bg-yellow-50 border-l-4 border-yellow-500'
          }`}>
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-gray-800">{displayMessage}</p>
            <button
              onClick={() => {
                setShowMessage(false);
                setTimeout(() => {
                  setDisplayMessage(null);
                  setDisplayMessageType(null);
                }, 300);
              }}
              className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <VendorDashboardContent />
    </>
  );
};

export default VendorDashboardPage;