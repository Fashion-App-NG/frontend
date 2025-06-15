import { Navigate } from 'react-router-dom';
import { ShopperDashboard } from '../components/Auth-Designer/Dashboard/ShopperDashboard';
import { useAuth } from '../contexts/AuthContext';

// React Component: Shopper dashboard page wrapper using existing ShopperDashboard
export const ShopperDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();

  // React Pattern: Redirect unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // React Pattern: Role-based access control
  if (user && user.role !== 'shopper') {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'vendor') {
      return <Navigate to="/vendor/dashboard" replace />;
    }
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // React Component Composition: Use existing ShopperDashboard component
  return <ShopperDashboard isGuest={false} />;
};

export default ShopperDashboardPage;