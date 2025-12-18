import { Navigate } from 'react-router-dom';
import VendorProductUploadContent from '../components/Vendor/VendorProductUploadContent';
import { useAuth } from '../contexts/AuthContext';

export const VendorProductUploadPage = () => {
  const { user, isAuthenticated } = useAuth();

  // Redirect unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/login/vendor" replace />;
  }

  // Role-based access control
  if (user && user.role !== 'vendor') {
    if (user.role === 'shopper') {
      return <Navigate to="/shopper/dashboard" replace />;
    }
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <VendorProductUploadContent />
    </div>
  );
};

export default VendorProductUploadPage;