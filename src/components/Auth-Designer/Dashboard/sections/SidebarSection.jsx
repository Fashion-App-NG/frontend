import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BellIcon,
  CompassIcon,
  HeartIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MoonIcon,
  SettingsIcon,
  ShoppingBagIcon,
  UserPlusIcon,
  LogInIcon,
} from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';

const navigationItems = [
  { icon: <LayoutDashboardIcon className="w-5 h-5" />, label: "Dashboard", path: "/dashboard" },
  { icon: <CompassIcon className="w-5 h-5" />, label: "Explore", path: "/explore" },
  { icon: <ShoppingBagIcon className="w-5 h-5" />, label: "Orders", path: "/orders", requiresAuth: true },
  { icon: <HeartIcon className="w-5 h-5" />, label: "Favourites", path: "/favourites", requiresAuth: true },
  { icon: <BellIcon className="w-5 h-5" />, label: "Notifications", path: "/notifications", requiresAuth: true },
  { icon: <SettingsIcon className="w-5 h-5" />, label: "Settings", path: "/settings", requiresAuth: true },
];

export const SidebarSection = ({ isGuest = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGuestAction = (action) => {
    if (action === 'signup') {
      navigate('/register/shopper');
    } else if (action === 'signin') {
      navigate('/login');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-[254px] h-full bg-[#f4f4f4] rounded-lg flex flex-col">
      {/* Logo Section */}
      <div className="flex items-start p-2.5 mt-[45px] ml-[21px]">
        <div className="flex items-start gap-2.5">
          <div className="relative w-8 h-[31px]">
            <div className="absolute w-[30px] h-[29px] top-0.5 left-px bg-black" />
            <img
              className="absolute w-8 h-[31px] top-0 left-0"
              alt="Star"
              src="https://c.animaapp.com/mbr2jpx2DSKBSz/img/star-1.svg"
            />
          </div>
          <div className="font-['Urbanist',Helvetica] font-bold text-black text-base tracking-[0] leading-[19.2px]">
            FASHION&nbsp;&nbsp;
            <br />
            CULTURE
          </div>
        </div>

        <div className="inline-flex items-center gap-0.5 ml-auto mr-8 rotate-180">
          <img
            className="relative w-[8.17px] h-[14.33px] mt-[-1.00px] mb-[-1.00px] ml-[-1.00px] -rotate-180"
            alt="Vector"
            src="https://c.animaapp.com/mbr2jpx2DSKBSz/img/vector-32.svg"
          />
          <img
            className="relative w-[8.17px] h-[14.33px] mt-[-1.00px] mb-[-1.00px] mr-[-1.00px] -rotate-180"
            alt="Vector"
            src="https://c.animaapp.com/mbr2jpx2DSKBSz/img/vector-32.svg"
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-[75px] flex-1">
        <ul className="flex flex-col">
          {navigationItems.map((item, index) => {
            // Show item if it doesn't require auth, or if user is not a guest
            const shouldShow = !item.requiresAuth || !isGuest;
            
            if (!shouldShow) return null;

            return (
              <li key={item.label}>
                <button 
                  onClick={() => handleNavigation(item.path)}
                  className={`flex w-full items-center gap-5 px-[29px] py-3.5 transition-colors ${
                    isActive(item.path) 
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

          {/* Guest-specific options */}
          {isGuest && (
            <>
              <li className="mt-4 px-4">
                <div className="h-px bg-gray-300 mb-4" />
                <p className="text-xs text-gray-500 mb-3 px-2">Guest Actions</p>
              </li>
              <li>
                <button 
                  onClick={() => handleGuestAction('signup')}
                  className="flex w-full items-center gap-5 px-[29px] py-3.5 transition-colors hover:bg-blue-100 text-blue-600"
                >
                  <UserPlusIcon className="w-5 h-5" />
                  <span className="font-['Urbanist',Helvetica] font-medium text-base">
                    Sign Up
                  </span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleGuestAction('signin')}
                  className="flex w-full items-center gap-5 px-[29px] py-3.5 transition-colors hover:bg-green-100 text-green-600"
                >
                  <LogInIcon className="w-5 h-5" />
                  <span className="font-['Urbanist',Helvetica] font-medium text-base">
                    Sign In
                  </span>
                </button>
              </li>
            </>
          )}
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