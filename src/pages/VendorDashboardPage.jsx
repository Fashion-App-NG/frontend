import { Navigate } from 'react-router-dom';
import VendorDashboardContent from '../components/Vendor/VendorDashboardContent';
import { useAuth } from '../contexts/AuthContext';

// React Component: Vendor-specific dashboard page with role-based access
export const VendorDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();

  // React Pattern: Redirect unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/login/vendor" replace />;
  }

  // React Pattern: Role-based access control
  if (user && user.role !== 'vendor') {
    if (user.role === 'shopper') {
      return <Navigate to="/shopper/dashboard" replace />;
    }
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // ✅ FIXED: Return content only, let VendorLayout handle sidebar
  return <VendorDashboardContent />;
};

export default VendorDashboardPage;