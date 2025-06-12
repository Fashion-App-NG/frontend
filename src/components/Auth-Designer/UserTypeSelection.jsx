import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBagIcon, UserIcon } from 'lucide-react';

export const UserTypeSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // ✅ Check for logout/auth messages
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      setMessageType(location.state.type || 'info');
      
      // Clear the message after showing it
      navigate(location.pathname, { replace: true, state: {} });
      
      // Auto-hide message after 5 seconds
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname]);

  const handleShopperClick = () => {
    navigate('/login', { state: { userType: 'shopper' } });
  };

  const handleVendorClick = () => {
    navigate('/login/vendor');
  };

  const handleGuestClick = () => {
    navigate('/dashboard', { state: { userType: 'guest' } });
  };

  return (
    <div className="relative flex h-screen w-full bg-[#f9f9f9] overflow-hidden">
      <div className="flex flex-col w-full max-w-[1000px] px-[60px] py-[80px]">
        {/* Logo Section */}
        <div className="flex items-center gap-1 h-[38px] mb-16">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ea356ae0f1da43fbbc02727416114024/eee8f71bfde6a3b1e04aa9edd9c252a82b00ff2c?placeholderIfAbsent=true"
            alt="Fashion App Logo"
            className="aspect-[1.89] object-contain w-[38px] self-stretch shrink-0 my-auto"
          />
          <div className="font-['Urbanist',Helvetica] font-bold text-[#2d2d2d] text-lg leading-normal flex-1">
            Fashion App
          </div>
        </div>

        {/* ✅ Success/Info Messages */}
        {message && (
          <div className={`mb-8 px-4 py-3 rounded-lg border ${
            messageType === 'success' 
              ? 'bg-green-100 border-green-400 text-green-700' 
              : messageType === 'error'
              ? 'bg-red-100 border-red-400 text-red-700'
              : 'bg-blue-100 border-blue-400 text-blue-700'
          }`}>
            <p className="font-['Urbanist',Helvetica] font-medium text-sm">
              {message}
            </p>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="font-['Urbanist',Helvetica] font-bold text-[#2d2d2d] text-4xl md:text-5xl lg:text-[56px] leading-tight mb-4">
            Welcome to Fashion App
          </h1>
          <p className="font-['Urbanist',Helvetica] font-normal text-[#666] text-lg md:text-xl leading-relaxed max-w-2xl">
            Discover the latest trends, connect with fashion vendors, or browse as a guest. Choose your experience below.
          </p>
        </div>

        {/* User Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Shopper Card */}
          <div
            className="group relative overflow-hidden bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] hover:from-[#dbeafe] hover:to-[#bfdbfe] border-2 border-[#0ea5e9] rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            onClick={handleShopperClick}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[#0ea5e9] p-3 rounded-full">
                  <ShoppingBagIcon className="w-6 h-6 text-white" />
                </div>
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
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[#64748b] p-3 rounded-full">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <span className="bg-[#64748b] text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Browse
                </span>
              </div>
              <div>
                <p className="font-['Urbanist',Helvetica] font-bold text-[#64748b] text-xl mb-2">
                  Guest Browsing
                </p>
                <p className="font-['Urbanist',Helvetica] font-normal text-[#475569] text-sm">
                  Explore our collection without creating an account
                </p>
              </div>
            </div>
          </div>

          {/* Vendor Card */}
          <div
            className="group relative overflow-hidden bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] hover:from-[#dcfce7] hover:to-[#bbf7d0] border-2 border-[#22c55e] rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            onClick={handleVendorClick}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[#22c55e] p-3 rounded-full">
                  <img
                    className="w-6 h-6 filter brightness-0 invert"
                    alt="Vendor icon"
                    src="https://c.animaapp.com/mbormqrhVzbcgH/img/vector-55.svg"
                  />
                </div>
                <span className="bg-[#22c55e] text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Sign In
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

        {/* Information Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-['Urbanist',Helvetica] font-semibold text-[#2d2d2d] text-lg mb-3">
                For Shoppers
              </h3>
              <ul className="space-y-2 text-sm text-[#666]">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#0ea5e9] rounded-full"></div>
                  Personalized recommendations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#0ea5e9] rounded-full"></div>
                  Wishlist and favorites
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#0ea5e9] rounded-full"></div>
                  Order tracking
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-['Urbanist',Helvetica] font-semibold text-[#2d2d2d] text-lg mb-3">
                For Vendors
              </h3>
              <ul className="space-y-2 text-sm text-[#666]">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#22c55e] rounded-full"></div>
                  Inventory management
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#22c55e] rounded-full"></div>
                  Sales analytics
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#22c55e] rounded-full"></div>
                  Customer insights
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right side image */}
      <div className="hidden lg:block flex-1 relative">
        <img
          src="https://c.animaapp.com/mbgdqa1w85bFXv/img/mask-group.png"
          alt="Fashion showcase"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#f9f9f9] opacity-30"></div>
      </div>
    </div>
  );
};

export default UserTypeSelection;