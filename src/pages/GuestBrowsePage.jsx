import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import GuestSidebar from '../components/Common/GuestSidebar';
import ProductBrowsePage from './ProductBrowsePage';

const GuestBrowsePage = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <GuestSidebar />
      <div className="flex-1">
        {/* ✅ Add cart header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-semibold text-gray-900">Browse Fabrics</h1>
              
              <button
                onClick={() => navigate('/guest/cart')}
                className="relative bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-semibold transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <main>
          <ProductBrowsePage />
        </main>
      </div>
    </div>
  );
};

export default GuestBrowsePage;