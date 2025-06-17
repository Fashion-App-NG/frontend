import { Navigate } from 'react-router-dom';
import VendorSidebar from '../components/Vendor/VendorSidebar';
import { useAuth } from '../contexts/AuthContext';

export const VendorOrdersPage = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login/vendor" replace />;
  }

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
      <VendorSidebar />
      <div className="flex-1 ml-[254px] p-6">
        <div className="bg-white rounded-[10px] p-8 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Orders</h2>
          <p className="text-gray-500">Coming Soon - Manage your orders here</p>
        </div>
      </div>
    </div>
  );
};

export default VendorOrdersPage;