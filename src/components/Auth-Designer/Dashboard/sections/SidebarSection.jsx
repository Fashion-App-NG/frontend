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
} from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';

const navigationItems = [
  { icon: <LayoutDashboardIcon className="w-5 h-5" />, label: "Dashboard", path: "/dashboard" },
  { icon: <CompassIcon className="w-5 h-5" />, label: "Explore", path: "/explore" },
  { icon: <ShoppingBagIcon className="w-5 h-5" />, label: "Orders", path: "/orders" },
  { icon: <HeartIcon className="w-5 h-5" />, label: "Favourites", path: "/favourites" },
  { icon: <BellIcon className="w-5 h-5" />, label: "Notifications", path: "/notifications" },
  { icon: <SettingsIcon className="w-5 h-5" />, label: "Settings", path: "/settings" },
];

export const SidebarSection = () => {
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
      <nav className="mt-[75px]">
        <ul className="flex flex-col">
          {navigationItems.map((item, index) => (
            <li key={index}>
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
          ))}
        </ul>
      </nav>

      <div className="mt-auto">
        <div className="h-px bg-gray-300 my-4" />

        {/* Dark Mode Toggle */}
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

        <div className="h-px bg-gray-300 my-4" />

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-4 px-[33px] py-3.5 hover:bg-gray-200 transition-colors"
        >
          <LogOutIcon className="w-6 h-6" />
          <span className="font-['Urbanist',Helvetica] font-normal text-[#2d2d2d] text-base">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarSection;