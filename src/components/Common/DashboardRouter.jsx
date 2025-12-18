import React from 'react';
import { ShopperDashboard } from '../Auth-Designer/Dashboard/ShopperDashboard';
// import { VendorDashboard } from '../Auth-Designer/Dashboard/VendorDashboard'; // Future component
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const DashboardRouter = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is coming as guest from UserTypeSelection
  const isGuest = location.state?.userType === 'guest';

  // If not authenticated and not a guest, redirect to user type selection
  if (!isAuthenticated && !isGuest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please log in to access your dashboard
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#303030] text-[#edff8c] px-6 py-2 rounded hover:bg-[#404040] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Determine user type - prioritize state for guest users
  const userType = isGuest ? 'guest' : (user?.userType || 'shopper');
  
  console.log('🎯 Routing to dashboard for user type:', userType, isGuest ? '(guest mode)' : '(authenticated)');

  switch (userType) {
    case 'vendor':
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome, {user?.firstName || user?.storeName || 'Vendor'}!
            </h1>
            <p className="text-gray-600 mb-6">
              Your vendor dashboard is under development.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Store: {user?.storeName || 'Your Store'}</h3>
              <p className="text-blue-800 text-sm">Vendor features coming soon!</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-[#303030] text-[#edff8c] px-6 py-2 rounded hover:bg-[#404040] transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    
    case 'guest':
      // Pass guest mode to ShopperDashboard
      return <ShopperDashboard isGuest={true} />;
    
    case 'shopper':
    default:
      return <ShopperDashboard isGuest={false} />;
  }
};

export default DashboardRouter;