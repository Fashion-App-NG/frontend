import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBagIcon, UserIcon } from 'lucide-react';

export const UserTypeSelection = () => {
  const navigate = useNavigate();

  const handleShopperClick = () => {
    navigate('/login', { state: { userType: 'shopper' } });
  };

  const handleVendorClick = () => {
    navigate('/login/vendor'); // Changed from /register/vendor to /login/vendor
  };

  const handleGuestClick = () => {
    // Navigate directly to shopping dashboard as guest
    navigate('/dashboard', { state: { userType: 'guest' } });
  };

  return (
    <div className="relative flex h-screen w-full bg-[#f9f9f9] overflow-hidden">
      <div className="flex flex-col w-full max-w-[1000px] px-[60px] py-[80px]">
        {/* Logo Section */}
        <div className="flex items-center gap-1 h-[38px] mb-16">
          <img
            className="w-[38px] h-[31px]"
            alt="Fashion Culture Logo"
            src="https://c.animaapp.com/mbormqrhVzbcgH/img/subtract.svg"
          />
          <div className="font-['Urbanist',Helvetica] font-bold text-black text-base leading-[19.2px]">
            FASHION&nbsp;&nbsp;
            <br />
            CULTURE
          </div>
        </div>

        {/* Welcome Section */}
        <div className="flex flex-col mb-12 gap-2">
          <p className="font-['Urbanist',Helvetica] font-normal text-[#2d2d2d] text-base">
            Welcome to Fashion Culture!
          </p>
          <h2 className="font-['Urbanist',Helvetica] font-bold text-[#2d2d2d] text-4xl">
            How would you like to explore?
          </h2>
        </div>

        {/* Shopping Section */}
        <div className="mb-12">
          <h3 className="font-['Urbanist',Helvetica] font-semibold text-[#2d2d2d] text-xl mb-6">
            🛍️ Shopping Experience
          </h3>
          <div className="grid grid-cols-2 gap-6 max-w-[600px]">
            {/* Shopper Login Card */}
            <div
              className="group relative overflow-hidden bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] hover:from-[#e0f2fe] hover:to-[#bae6fd] border-2 border-[#0ea5e9] rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              onClick={handleShopperClick}
            >
              <div className="flex flex-col h-[160px] p-6 justify-between">
                <div className="flex items-center justify-between">
                  <ShoppingBagIcon className="w-8 h-8 text-[#0ea5e9]" />
                  <span className="bg-[#0ea5e9] text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Sign In
                  </span>
                </div>
                <div>
                  <p className="font-['Urbanist',Helvetica] font-bold text-[#0ea5e9] text-xl mb-2">
                    Shopper Account
                  </p>
                  <p className="font-['Urbanist',Helvetica] font-normal text-[#0369a1] text-sm">
                    Full shopping experience with saved favorites and order history
                  </p>
                </div>
              </div>
            </div>

            {/* Guest Browse Card */}
            <div
              className="group relative overflow-hidden bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] hover:from-[#f1f5f9] hover:to-[#e2e8f0] border-2 border-[#64748b] rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              onClick={handleGuestClick}
            >
              <div className="flex flex-col h-[160px] p-6 justify-between">
                <div className="flex items-center justify-between">
                  <UserIcon className="w-8 h-8 text-[#64748b]" />
                  <span className="bg-[#64748b] text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Browse
                  </span>
                </div>
                <div>
                  <p className="font-['Urbanist',Helvetica] font-bold text-[#64748b] text-xl mb-2">
                    Guest Browse
                  </p>
                  <p className="font-['Urbanist',Helvetica] font-normal text-[#475569] text-sm">
                    Explore products without creating an account
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Section */}
        <div className="mb-8">
          <h3 className="font-['Urbanist',Helvetica] font-semibold text-[#2d2d2d] text-xl mb-6">
            🏪 Business Portal
          </h3>
          <div className="max-w-[300px]">
            {/* Vendor Card */}
            <div
              className="group relative overflow-hidden bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] hover:from-[#dcfce7] hover:to-[#bbf7d0] border-2 border-[#22c55e] rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              onClick={handleVendorClick}
            >
              <div className="flex flex-col h-[160px] p-6 justify-between">
                <div className="flex items-center justify-between">
                  <div className="relative w-8 h-8">
                    <img
                      className="w-full h-full object-contain"
                      alt="Vendor Icon"
                      src="https://c.animaapp.com/mbormqrhVzbcgH/img/vector-55.svg"
                    />
                  </div>
                  <span className="bg-[#22c55e] text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Sign In {/* Changed from "New!" to "Sign In" */}
                  </span>
                </div>
                <div>
                  <p className="font-['Urbanist',Helvetica] font-bold text-[#22c55e] text-xl mb-2">
                    Vendor Portal
                  </p>
                  <p className="font-['Urbanist',Helvetica] font-normal text-[#15803d] text-sm">
                    Access your store dashboard and manage inventory
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-['Urbanist',Helvetica] font-semibold text-[#2d2d2d] text-lg mb-3">
                👤 For Shoppers
              </h4>
              <ul className="space-y-2 text-sm text-[#666]">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span><strong>Guest:</strong> Browse products, add to cart</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span><strong>Account:</strong> Save favorites, order history, secure checkout</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-['Urbanist',Helvetica] font-semibold text-[#2d2d2d] text-lg mb-3">
                🏪 For Vendors
              </h4>
              <ul className="space-y-2 text-sm text-[#666]">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Manage product inventory</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Process orders and track sales</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Image */}
      <div className="flex-1 h-full relative overflow-hidden">
        <img
          className="h-full w-full object-cover"
          alt="Fashion model"
          src="https://c.animaapp.com/mbormqrhVzbcgH/img/mask-group.png"
          style={{
            filter: 'brightness(0.95) contrast(1.1) saturate(1.1)',
            objectPosition: 'center 40%'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#f9f9f9]/20"></div>
      </div>
    </div>
  );
};

export default UserTypeSelection;