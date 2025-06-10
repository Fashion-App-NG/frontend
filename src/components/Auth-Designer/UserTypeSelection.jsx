import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../Common/Logo';

export const UserTypeSelection = () => {
  const navigate = useNavigate();

  const handleShopperClick = () => {
    navigate('/register/shopper');
  };

  const handleVendorClick = () => {
    // For now, show an alert that it's coming soon
    alert('Vendor registration coming soon! Please check back later.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Already have an account? Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Join Fashion Culture
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Choose how you'd like to be part of our fashion community
          </p>
        </div>

        {/* User Type Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Shopper Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Shop Fashion</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Discover the latest trends, shop from curated collections, and enjoy a personalized fashion experience.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Browse curated fashion collections
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Secure checkout and fast delivery
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Track your orders in real-time
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Personalized recommendations
                </li>
              </ul>
              <button
                onClick={handleShopperClick}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                Start Shopping
              </button>
            </div>
          </div>

          {/* Vendor Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative">
            <div className="h-48 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M5 21H3m2 0h2m0 0v-3a2 2 0 012-2h2a2 2 0 012 2v3m-6 0h6" />
              </svg>
            </div>
            
            {/* Coming Soon Badge */}
            <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
              Coming Soon
            </div>
            
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sell Fashion</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Join our marketplace as a vendor and reach thousands of fashion enthusiasts with your products.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-500">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Easy product listing and management
                </li>
                <li className="flex items-center text-gray-500">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Integrated payment processing
                </li>
                <li className="flex items-center text-gray-500">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Real-time sales analytics
                </li>
                <li className="flex items-center text-gray-500">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Marketing and promotion tools
                </li>
              </ul>
              <button
                onClick={handleVendorClick}
                disabled
                className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 text-lg">
            Questions about joining Fashion Culture?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold">
              Contact our support team
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default UserTypeSelection;