import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// React Component: Vendor navigation sidebar matching design specs
export const VendorSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // ✅ ADD: Import logout
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to check if current path matches
  const isActive = (path) => {
    if (path === '/vendor' || path === '/vendor/dashboard') {
      return location.pathname === '/vendor/dashboard' || location.pathname === '/vendor';
    }
    return location.pathname === path;
  };

  // ✅ ADD: Logout handler
  const handleSignOut = async () => {
    try {
      console.log('🔐 Vendor signing out...');
      const success = await logout();
      if (success) {
        navigate('/browse', { replace: true });
      }
    } catch (error) {
      console.error('❌ Vendor sign out error:', error);
      navigate('/browse', { replace: true }); // Still navigate on error
    }
  };

  const menuItems = [
    { path: '/vendor/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/vendor/orders', icon: '📦', label: 'Orders' },
    { path: '/vendor/products', icon: '👕', label: 'My Products' },
    { path: '/vendor/upload', icon: '⬆️', label: 'Add Product' },
    { path: '/vendor/bulk-upload', icon: '📤', label: 'Bulk Upload' },
    { path: '/vendor/sales', icon: '💰', label: 'Sales' },
    { path: '/vendor/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <>
      {/* Mobile hamburger button - only visible on small screens */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar - hidden on mobile unless menu is open */}
      <div className={`fixed left-0 top-0 h-screen transition-transform duration-300 transform ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:w-[254px] bg-white border-r border-gray-200 flex flex-col z-40`}>
        {/* Header - shows icon only when collapsed */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          {isCollapsed ? (
            <Link to="/vendor/dashboard" className="flex justify-center">
              <img 
                src="/assets/logos/faari-icon-sm.png" 
                alt="Fáàrí" 
                className="h-10 w-10 object-contain"
              />
            </Link>
          ) : (
            <Link to="/vendor/dashboard" className="block">
              <div className="flex items-center space-x-3 mb-3">
                <img 
                  src="/assets/logos/faari-icon-md.png" 
                  alt="Fáàrí" 
                  className="h-14 w-14 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Fáàrí</h1>
                  <p className="text-xs text-gray-500">Vendor Portal</p>
                </div>
              </div>
              
              {/* Vendor Info */}
              <div className="flex items-center space-x-2 mt-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-semibold">
                    {(user?.vendorProfile?.storeName || user?.storeName)?.charAt(0)?.toUpperCase() ||
                     user?.firstName?.charAt(0)?.toUpperCase() ||
                     'V'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {user?.vendorProfile?.storeName || user?.storeName || 'Vendor'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'vendor@example.com'}
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* Debug Info in Development */}
          {process.env.NODE_ENV === 'development' && !isCollapsed && (
            <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
              <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
              <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
              <p><strong>Store:</strong> {user?.vendorProfile?.storeName || user?.storeName || 'N/A'}</p>
            </div>
          )}
        </div>

        {/* Navigation - icon only when collapsed */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg mb-1 ${
                isCollapsed ? 'justify-center' : ''
              } ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <span className={`${isCollapsed ? 'text-xl' : 'mr-3 text-lg'}`}>{item.icon}</span>
              {!isCollapsed && item.label}
            </Link>
          ))}
        </nav>

        {/* Footer - FIXED: Use button with logout handler */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className={`flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? "Sign out" : ''}
          >
            <span className={`${isCollapsed ? 'text-xl' : 'mr-3'}`}>🚪</span>
            {!isCollapsed && "Sign out"}
          </button>
        </div>
      </div>
    </>
  );
};

export default VendorSidebar;