import { ShoppingBagIcon, UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
    // ✅ LEARNING: Multiple navigation strategies for reliability
    navigate('/browse?guest=true', { 
      state: { userType: 'guest' },
      replace: false
    });
  };

  const handleAdminClick = () => {
    navigate('/admin/login');
  };

  // ✅ LEARNING: Environment-aware feature flagging
  const showAdminCard = process.env.NODE_ENV === 'development';

  return (
    <div className="relative flex h-screen w-full bg-[#f9f9f9] overflow-hidden">
      <div className="flex flex-col w-full max-w-[1000px] px-[60px] py-[80px]">
        {/* Logo Section - Updated to Fáàrí */}
        <div className="flex items-center justify-center gap-3 mb-16">
          <img
            src="/assets/logos/faari-icon-md@2x.png"
            alt="Fáàrí Logo"
            className="h-12 w-12 object-contain"
          />
          <div className="font-['Urbanist',Helvetica] font-bold text-[#2d2d2d] text-2xl leading-normal">
            Fáàrí
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
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Fáàrí
          </h1>
          <p className="text-gray-600 mb-4">
            Your Fashion Marketplace
          </p>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Discover the latest trends, connect with fashion vendors, or browse as a guest. Choose your experience below.
          </p>
        </div>

        {/* User Type Cards */}
        <div className={`grid grid-cols-1 gap-6 mb-12 ${showAdminCard ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
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
            className="group relative overflow-hidden bg-gradient-to-br from-[#fef3c7] to-[#fde68a] hover:from-[#fde68a] hover:to-[#fcd34d] border-2 border-[#f59e0b] rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            onClick={handleVendorClick}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[#f59e0b] p-3 rounded-full">
                  <ShoppingBagIcon className="w-6 h-6 text-white" />
                </div>
                <span className="bg-[#f59e0b] text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Sell
                </span>
              </div>
              <div>
                <p className="font-['Urbanist',Helvetica] font-bold text-[#f59e0b] text-xl mb-2">
                  Vendor Account
                </p>
                <p className="font-['Urbanist',Helvetica] font-normal text-[#d97706] text-sm">
                  Manage your store, products, and orders
                </p>
              </div>
            </div>
          </div>

          {/* Admin Card - Only in Development */}
          {showAdminCard && (
            <div
              className="group relative overflow-hidden bg-gradient-to-br from-[#fce7f3] to-[#fbcfe8] hover:from-[#fbcfe8] hover:to-[#f9a8d4] border-2 border-[#ec4899] rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              onClick={handleAdminClick}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-[#ec4899] p-3 rounded-full">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-[#ec4899] text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Admin
                  </span>
                </div>
                <div>
                  <p className="font-['Urbanist',Helvetica] font-bold text-[#ec4899] text-xl mb-2">
                    Admin Portal
                  </p>
                  <p className="font-['Urbanist',Helvetica] font-normal text-[#db2777] text-sm">
                    System administration and management
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto text-center">
          <p className="font-['Urbanist',Helvetica] font-normal text-[#636363] text-sm">
            © 2025 Fáàrí. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side Image */}
      <div 
        className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: 'url(/assets/faari-hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#7DD3C0' // Fallback color matching your logo
        }}
      >
        {/* Optional overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#7DD3C0]/90 to-[#5DBFAC]/90"></div>
        
        <div className="text-white text-center p-12 relative z-10">
          <h2 className="text-4xl font-bold mb-4">Join Fáàrí Today</h2>
          <p className="text-xl">Your Fashion Journey Starts Here</p>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;