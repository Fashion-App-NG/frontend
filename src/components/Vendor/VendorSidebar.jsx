import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// React Component: Vendor navigation sidebar matching design specs
export const VendorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // React Event Handler: Logout functionality
  const handleLogout = () => {
    logout();
    navigate('/login/vendor');
  };

  return (
    <div className="fixed top-0 left-0 w-[254px] h-screen bg-[#f9f9f9] rounded-lg z-10">
      {/* Logo Section */}
      <div className="pt-[45px] pl-[21px] pb-[10px]">
        <div className="w-[135px] h-[38px] relative">
          <div className="absolute w-[9px] h-[29px] bg-black left-[2px] top-[3px] rounded-sm" />
          <div className="absolute left-0 top-[1px] text-yellow-400 text-xl">⭐</div>
          <div className="absolute left-[42px] top-0 font-bold text-black text-[16px] leading-[120%]">
            <div className="whitespace-pre">FASHION  </div>
            <div>CULTURE</div>
          </div>
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="absolute top-[68px] right-[20px] opacity-50">
        <div className="flex items-center gap-[2px]">
          <div className="w-2 h-3 border-r-2 border-b-2 border-gray-600 transform rotate-45"></div>
          <div className="w-2 h-3 border-r-2 border-b-2 border-gray-600 transform rotate-45"></div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="mt-[100px] w-[254px]">
        {/* Dashboard - Active */}
        <div className="h-[47px] flex items-center px-[24px] gap-[20px] bg-[#cfe1ca] rounded-none">
          <div className="w-[18px] h-[18px] text-gray-700">🏠</div>
          <span className="text-[#303030] text-[16px] leading-[120%] font-medium">Dashboard</span>
        </div>

        {/* Orders */}
        <div className="h-[56px] flex items-center px-[19px] gap-[14px] hover:bg-gray-100 cursor-pointer">
          <div className="w-[28px] h-[28px] text-gray-700">📦</div>
          <span className="text-[#2e2e2e] text-[16px] leading-[120%]">Orders</span>
        </div>

        {/* Products - Active when on product pages */}
        <div 
          className={`h-[47px] flex items-center px-[21px] gap-[22px] cursor-pointer transition-colors ${
            location.pathname.includes('/vendor/products') 
              ? 'bg-[#cfe1ca] rounded-none' 
              : 'hover:bg-gray-100'
          }`}
          onClick={() => navigate('/vendor/products/add')}
        >
          <div className="w-[20px] h-[18px] text-gray-700">📋</div>
          <span className="text-[#2e2e2e] text-[16px] leading-[120%]">Products</span>
        </div>

        {/* Sales */}
        <div className="h-[47px] flex items-center px-[22px] gap-[21px] hover:bg-gray-100 cursor-pointer">
          <div className="w-[20px] h-[18px] text-gray-700">💰</div>
          <span className="text-[#2e2e2e] text-[16px] leading-[120%]">Sales</span>
        </div>

        {/* Notifications */}
        <div className="h-[49px] flex items-center px-[24px] gap-[19px] hover:bg-gray-100 cursor-pointer">
          <div className="w-[21px] h-[21px] text-gray-700">🔔</div>
          <span className="text-[#2e2e2e] text-[16px] leading-[120%]">Notifications</span>
        </div>

        {/* Settings */}
        <div className="h-[50px] flex items-center px-[25px] gap-[17px] hover:bg-gray-100 cursor-pointer">
          <div className="w-[22px] h-[22px] text-gray-700">⚙️</div>
          <span className="text-[#2e2e2e] text-[16px] leading-[120%]">Settings</span>
        </div>
      </div>

      {/* Divider Lines */}
      <div className="absolute top-[550px] left-[1px] w-[252px] h-[1px] border-t border-[rgba(207,207,207,0.36)]" />
      <div className="absolute top-[650px] left-[1px] w-[252px] h-[1px] border-t border-[rgba(207,207,207,0.36)]" />
      <div className="absolute top-[800px] left-[1px] w-[252px] h-[1px] border-t border-[rgba(207,207,207,0.36)]" />

      {/* Bottom Section */}
      <div className="absolute bottom-[100px] left-0 w-full">
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between px-[27px] py-[14px]">
          <div className="flex items-center gap-[20px]">
            <div className="w-[20px] h-[20px] text-gray-700">🌙</div>
            <span className="text-[#2e2e2e] text-[16px] leading-[120%]">Dark Mode</span>
          </div>
          <div className="w-[30px] h-[17px] relative">
            <div className="absolute inset-0 bg-[#e4e7ec] rounded-full" />
            <div className="absolute left-[1px] top-[1px] w-[16.2px] h-[14.9px] bg-white rounded-full" />
          </div>
        </div>

        {/* Logout */}
        <div 
          className="flex items-center px-[33px] py-[14px] gap-[16px] cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={handleLogout}
        >
          <div className="w-[24px] h-[24px] text-gray-700">🚪</div>
          <span className="text-[#2e2e2e] text-[16px] leading-[120%]">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default VendorSidebar;