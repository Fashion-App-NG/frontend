import {
  BellIcon,
  CompassIcon,
  HeartIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MoonIcon,
  SettingsIcon,
  ShoppingBagIcon
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';

export const SidebarSection = ({ isGuest = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
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
      return;
    }
    navigate(path);
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
    <aside className="flex flex-col w-full h-screen bg-[#f9f9f9] rounded-lg">
      {/* Logo - Clickable to home */}
      <div className="px-[21px] pt-[45px] pb-[10px]">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ea356ae0f1da43fbbc02727416114024/eee8f71bfde6a3b1e04aa9edd9c252a82b00ff2c?placeholderIfAbsent=true"
            alt="Fashion App Logo"
            className="w-[38px] h-[31px] object-contain"
          />
          <div className="font-['Urbanist',Helvetica] font-bold text-black text-base leading-[19.2px]">
            <div className="whitespace-pre-wrap">FASHION  </div>
            <div>CULTURE</div>
          </div>
        </button>
      </div>

      {/* Navigation items with updated handler */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const shouldShow = !item.requiresAuth || !isGuest;
            
            if (!shouldShow) return null;

            return (
              <li key={item.label}>
                <button 
                  onClick={() => handleNavigation(item.path)}
                  className={`flex w-full items-center gap-5 px-[29px] py-3.5 transition-colors ${
                    location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/browse')
                      ? 'bg-gray-300 text-[#2d2d2d]' 
                      : 'hover:bg-gray-200 text-[#2d2d2d]'
                  }`}
                >
                  {item.icon}
                  <span className="font-['Urbanist',Helvetica] font-normal text-base">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto">
        <div className="h-px bg-gray-300 my-4" />

        {/* Dark Mode Toggle - Only for authenticated users */}
        {!isGuest && (
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-5">
              <MoonIcon className="w-5 h-5" />
              <span className="font-['Urbanist',Helvetica] font-normal text-[#2d2d2d] text-base">
                Dark Mode
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        )}

        <div className="h-px bg-gray-300 my-4" />

        {/* Logout/Back Button */}
        <button 
          onClick={isGuest ? () => navigate('/') : handleLogout}
          className="flex w-full items-center gap-4 px-[33px] py-3.5 hover:bg-gray-200 transition-colors"
        >
          <LogOutIcon className="w-6 h-6" />
          <span className="font-['Urbanist',Helvetica] font-normal text-[#2d2d2d] text-base">
            {isGuest ? 'Back to Home' : 'Logout'}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarSection;