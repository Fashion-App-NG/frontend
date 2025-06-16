import { Navigate, useLocation } from 'react-router-dom';
import { ShopperDashboard } from '../components/Auth-Designer/Dashboard/ShopperDashboard';
import { useAuth } from '../contexts/AuthContext';

// React Component: Shopper dashboard page wrapper using existing ShopperDashboard
export const ShopperDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  
  // ✅ LEARNING: Multiple ways to detect guest mode for reliability
  const isGuest = Boolean(
    location.state?.userType === 'guest' || 
    location.pathname === '/browse' ||
    location.search.includes('guest=true')
  );

  // ✅ DEBUG: Log the decision process (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 ShopperDashboardPage Decision Matrix:', {
      pathname: location.pathname,
      locationState: location.state,
      isGuest,
      isAuthenticated,
      userRole: user?.role,
      decision: isGuest ? 'GUEST_MODE' : !isAuthenticated ? 'REDIRECT_LOGIN' : user?.role
    });
  }

  // ✅ CRITICAL: Guest mode takes absolute priority
  if (isGuest) {
    console.log('🎯 Rendering in GUEST mode');
    return <ShopperDashboard isGuest={true} />;
  }

  // Authentication check only for non-guest users
  if (!isAuthenticated) {
    console.log('🎯 Redirecting to LOGIN - not authenticated');
    return <Navigate to="/login" replace />;
  }

  // Role-based access control (only for authenticated non-guest users)
  if (user && user.role !== 'shopper') {
    console.log('🎯 Redirecting based on role:', user.role);
    if (user.role === 'vendor') {
      return <Navigate to="/vendor/dashboard" replace />;
    }
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  console.log('🎯 Rendering authenticated SHOPPER dashboard');
  return <ShopperDashboard isGuest={false} />;
};

export default ShopperDashboardPage;