import { useNavigate } from 'react-router-dom';
import GuestSidebar from '../components/Common/GuestSidebar';
import { useCart } from '../contexts/CartContext';
import ProductBrowsePage from './ProductBrowsePage';

const GuestBrowsePage = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <GuestSidebar />
      <div className="flex-1 relative">
        {/* ✅ Enhanced cart header with Get Started button */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">Browse Fabrics</h1>
                
                {/* ✅ ADD: Get Started badge/link */}
                <button
                  onClick={() => navigate('/get-started')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-sm text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Get Started
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                {/* ✅ Mobile Get Started button */}
                <button
                  onClick={() => navigate('/get-started')}
                  className="sm:hidden flex items-center gap-1 px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Join
                </button>

                {/* Cart button */}
                <button
                  onClick={() => navigate('/guest/cart')}
                  className="relative bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-semibold transition-colors"
                >
                  <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  <span className="hidden sm:inline">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <main>
          <ProductBrowsePage />
        </main>

        {/* ✅ OPTIONAL: Floating "Get Started" button */}
        <button
          onClick={() => navigate('/get-started')}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:from-teal-600 hover:to-teal-700 transition-all flex items-center gap-2 font-semibold z-50 group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Join Fáàrí</span>
        </button>
      </div>
    </div>
  );
};

export default GuestBrowsePage;