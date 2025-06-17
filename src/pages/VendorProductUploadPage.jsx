import { Navigate } from 'react-router-dom';
import VendorProductUploadContent from '../components/Vendor/VendorProductUploadContent';
import VendorSidebar from '../components/Vendor/VendorSidebar';
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
    <div className="min-h-screen bg-[#d8dfe9] flex">
      {/* Sidebar */}
      <VendorSidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-[254px]">
        <VendorProductUploadContent />
      </div>
    </div>
  );
};

export default VendorProductUploadPage;