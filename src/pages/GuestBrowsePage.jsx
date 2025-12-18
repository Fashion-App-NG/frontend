import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestSidebar from '../components/Common/GuestSidebar';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import ProductBrowsePage from './ProductBrowsePage';

const GuestBrowsePage = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, isAuthenticated, loading } = useAuth(); // ✅ Add loading back
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ ROLE-BASED REDIRECT
  useEffect(() => {
    // ✅ CRITICAL: Wait for auth to finish loading
    if (loading) return;

    // ✅ Only redirect if authenticated
    if (isAuthenticated && user) {
      if (user.role === 'vendor') {
        navigate('/vendor/dashboard', { 
          replace: true,
          state: { 
            message: 'Vendors cannot browse products. Please sign out to browse as a guest.',
            type: 'info'
          }
        });
      } else if (user.role === 'shopper') {
        navigate('/shopper/browse', { replace: true });
      }
    }
  }, [isAuthenticated, user, loading, navigate]); // ✅ Add loading to dependencies

  // ✅ Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ CRITICAL: Show loading state while auth initializes
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Only render for true guests (not authenticated)
  if (isAuthenticated) {
    return null; // Redirect in progress
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ✅ Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ✅ Responsive Sidebar */}
      <GuestSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* ✅ Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ✅ Responsive Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Left Section: Hamburger + Title */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                {/* ✅ Hamburger Menu (Mobile/Tablet) */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                  aria-label="Open menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Title */}
                <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 truncate">
                  Browse Fabrics
                </h1>
                
                {/* ✅ Get Started Badge (Hidden on Mobile) */}
                <button
                  onClick={() => navigate('/get-started')}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-sm text-sm font-medium whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden lg:inline">Get Started</span>
                </button>
              </div>
              
              {/* Right Section: Cart Button */}
              <button
                onClick={() => navigate('/guest/cart')}
                className="relative bg-blue-600 text-white px-3 sm:px-4 md:px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-semibold transition-colors flex-shrink-0 ml-2"
              >
                <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs min-w-[1.5rem] h-6 flex items-center justify-center font-bold px-1">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* ✅ Main Content */}
        <main className="flex-1">
          <ProductBrowsePage />
        </main>

        {/* ✅ Floating "Get Started" Button (Mobile Only) */}
        <button
          onClick={() => navigate('/get-started')}
          className="md:hidden fixed bottom-6 right-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:from-teal-600 hover:to-teal-700 transition-all flex items-center gap-2 font-semibold z-50 group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Join</span>
        </button>
      </div>
    </div>
  );
};

export default GuestBrowsePage;