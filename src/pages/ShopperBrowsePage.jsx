import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import ProductBrowsePage from './ProductBrowsePage';

const ShopperBrowsePage = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [DEBUG] ShopperBrowsePage is rendering - If you see this, the route is using me');
  }

  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Top Bar - ONLY FOR MOBILE */}
      <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          {/* Search + Actions Row */}
          <div className="flex items-center gap-2 mb-3">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => navigate('/shopper/cart')}
              className="relative p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Favorites Button */}
            <button
              onClick={() => navigate('/shopper/favorites')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Tabs Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button 
              onClick={() => navigate('/shopper/browse')}
              className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium text-sm whitespace-nowrap"
            >
              All Products
            </button>
            <button 
              onClick={() => navigate('/shopper/browse?inStock=true')}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-lg text-sm whitespace-nowrap"
            >
              In Stock
            </button>
            <button 
              onClick={() => navigate('/shopper/favorites')}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-lg text-sm whitespace-nowrap"
            >
              Favorites
            </button>
          </div>
        </div>
      </div>

      {/* Product Browse Content - This handles both mobile and desktop */}
      <ProductBrowsePage searchQuery={searchQuery} />
    </div>
  );
};

export default ShopperBrowsePage;