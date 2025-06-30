import {
  BellIcon,
  CompassIcon,
  HeartIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  ShoppingBagIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';

export const SidebarSection = ({ isGuest = false }) => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();

  // ✅ LEARNING: Smart dashboard navigation based on auth state
  const handleDashboardClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard'); // Authenticated user dashboard
    } else {
      navigate('/browse', { state: { userType: 'guest' } }); // Guest dashboard
    }
  };

  const handleNavigation = (path) => {
    // Special handling for dashboard
    if (path === '/dashboard') {
      handleDashboardClick();
    } else {
      navigate(path);
    }
  };

  // ✅ FIXED: Add missing handleLogout function
  const handleLogout = async () => {
    try {
      await logout(); // Call logout from auth context
      navigate('/', { 
        state: { 
          message: 'Successfully logged out',
          type: 'success'
        } 
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate even if logout API fails
      navigate('/');
    }
  };

  const navigationItems = [
    { 
      icon: <LayoutDashboardIcon className="w-5 h-5" />, 
      label: "Dashboard", 
      path: "/dashboard",
      // No requiresAuth since we handle it dynamically
    },
    { icon: <CompassIcon className="w-5 h-5" />, label: "Explore", path: "/explore" },
    { icon: <ShoppingBagIcon className="w-5 h-5" />, label: "Orders", path: "/orders", requiresAuth: true },
    { icon: <HeartIcon className="w-5 h-5" />, label: "Favourites", path: "/favourites", requiresAuth: true },
    { icon: <BellIcon className="w-5 h-5" />, label: "Notifications", path: "/notifications", requiresAuth: true },
    { icon: <SettingsIcon className="w-5 h-5" />, label: "Settings", path: "/settings", requiresAuth: true },
  ];

  return (
    <div className="w-full h-full bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ea356ae0f1da43fbbc02727416114024/eee8f71bfde6a3b1e04aa9edd9c252a82b00ff2c?placeholderIfAbsent=true"
            alt="Fashion App Logo"
            className="w-[38px] h-[31px] object-contain cursor-pointer"
            onClick={() => navigate('/')}
          />
          <div 
            className="font-['Urbanist',Helvetica] font-bold text-black text-base leading-[19.2px] cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="whitespace-pre-wrap">FASHION  </div>
            <div>CULTURE</div>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4">
        <ul className="space-y-2 px-4">
          {navigationItems.map((item, index) => {
            const isRestricted = item.requiresAuth && isGuest;
            
            return (
              <li key={index}>
                <button
                  onClick={() => !isRestricted && handleNavigation(item.path)}
                  disabled={isRestricted}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                    isRestricted
                      ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  <span className="font-['Urbanist',Helvetica] font-medium">
                    {item.label}
                  </span>
                  {isRestricted && (
                    <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Sign up
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section - Logout or Sign Up */}
      <div className="p-4 border-t border-gray-100">
        {isGuest ? (
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#0ea5e9] text-white py-3 rounded-lg font-['Urbanist',Helvetica] font-medium hover:bg-[#0284c7] transition-colors duration-200"
          >
            Sign Up Now
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
          >
            <LogOutIcon className="w-5 h-5" />
            <span className="font-['Urbanist',Helvetica] font-medium">
              Logout
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SidebarSection;