import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// React Component: Vendor navigation sidebar matching design specs
export const VendorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // React Event Handler: Navigation functions
  const handleDashboard = () => navigate('/vendor/dashboard');
  const handleOrders = () => navigate('/vendor/orders');
  const handleProducts = () => navigate('/vendor/products');
  const handleUpload = () => navigate('/vendor/upload');
  const handleBulkUpload = () => navigate('/vendor/bulk-upload');
  const handleSales = () => navigate('/vendor/sales');
  const handleNotifications = () => navigate('/vendor/notifications');
  const handleSettings = () => navigate('/vendor/settings');

  // React Event Handler: Logout functionality
  const handleLogout = () => {
    logout();
    navigate('/login/vendor');
  };

  // Helper function to check if current path matches
  const isActive = (path) => {
    if (path === '/vendor/dashboard') {
      return location.pathname === '/vendor/dashboard' || location.pathname === '/vendor';
    }
    return location.pathname.includes(path);
  };

  return (
    <div className="bg-white h-screen w-64 fixed left-0 top-0 shadow-lg overflow-y-auto z-40">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FC</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">FASHION</h2>
            <p className="text-xs text-gray-500">CULTURE</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Vendor Portal</p>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {/* Dashboard */}
          <button
            onClick={handleDashboard}
            className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive('/vendor/dashboard')
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className={`mr-3 ${isActive('/vendor/dashboard') ? 'text-blue-600' : 'text-gray-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </span>
            Dashboard
          </button>

          {/* Orders */}
          <button
            onClick={handleOrders}
            className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive('/vendor/orders')
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className={`mr-3 ${isActive('/vendor/orders') ? 'text-blue-600' : 'text-gray-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
            Orders
          </button>

          {/* My Products */}
          <button
            onClick={handleProducts}
            className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive('/vendor/products')
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className={`mr-3 ${isActive('/vendor/products') ? 'text-blue-600' : 'text-gray-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </span>
            My Products
          </button>

          {/* Add Product */}
          <button
            onClick={handleUpload}
            className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive('/vendor/upload')
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className={`mr-3 ${isActive('/vendor/upload') ? 'text-blue-600' : 'text-gray-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </span>
            Add Product
          </button>

          {/* Bulk Upload */}
          <button
            onClick={handleBulkUpload}
            className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive('/vendor/bulk-upload')
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className={`mr-3 ${isActive('/vendor/bulk-upload') ? 'text-blue-600' : 'text-gray-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </span>
            Bulk Upload
          </button>

          {/* Sales */}
          <button
            onClick={handleSales}
            className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive('/vendor/sales')
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className={`mr-3 ${isActive('/vendor/sales') ? 'text-blue-600' : 'text-gray-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </span>
            Sales
          </button>

          {/* Notifications */}
          <button
            onClick={handleNotifications}
            className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive('/vendor/notifications')
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className={`mr-3 ${isActive('/vendor/notifications') ? 'text-blue-600' : 'text-gray-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 8a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            Notifications
          </button>

          {/* Settings */}
          <button
            onClick={handleSettings}
            className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive('/vendor/settings')
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className={`mr-3 ${isActive('/vendor/settings') ? 'text-blue-600' : 'text-gray-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            Settings
          </button>
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 bg-white">
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
};

export default VendorSidebar;