import React from 'react';
import { SearchIcon } from 'lucide-react';
import { SidebarSection } from './sections/SidebarSection';
import { DiscoverSection } from './sections/DiscoverSection';
import { FeaturedSection } from './sections/FeaturedSection';
import { PopularFabricsSection } from './sections/PopularFabricsSection';
import { RecommendationSection } from './sections/RecommendationSection';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const ShopperDashboard = ({ isGuest = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Guest user object for display purposes
  const displayUser = isGuest ? { firstName: 'Guest' } : user;

  return (
    <div className="w-full max-w-[1440px] min-h-screen bg-[#d8dfe9] overflow-hidden mx-auto">
      <div className="relative flex">
        {/* Sidebar */}
        <div className="w-[18%] h-screen fixed">
          <SidebarSection isGuest={isGuest} />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col ml-[18%]">
          {/* Top navigation bar */}
          <header className="w-full py-7 px-6 flex items-center justify-between border-b border-gray-200 bg-white/50 backdrop-blur-sm">
            {/* User greeting */}
            <div className="flex flex-col w-[300px] items-start gap-1">
              <div className="flex items-center gap-3">
                <h1 className="font-['Urbanist',Helvetica] font-bold text-[#3e3e3e] text-[32px] leading-normal">
                  Hey {displayUser?.firstName || 'Shopper'}!
                </h1>
                {isGuest && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Guest Mode
                  </span>
                )}
              </div>
              <p className="font-['Urbanist',Helvetica] font-normal text-[#2d2d2d] text-base leading-[16px]">
                {isGuest ? 'Browse our amazing products!' : 'What would you like to shop?'}
              </p>
            </div>

            {/* Search bar */}
            <div className="flex w-[284px] items-center">
              <div className="flex items-center gap-2 px-3 py-2 relative flex-1 grow bg-[#f4f4f4] rounded-[50px]">
                <SearchIcon className="w-6 h-6 text-gray-500" />
                <input
                  className="border-0 bg-transparent outline-none focus:outline-none placeholder:text-gray-600 text-base flex-1"
                  type="text"
                  placeholder="Search"
                />
              </div>
            </div>

            {/* User profile/cart icons */}
            <div className="flex items-center gap-4">
              <img
                className="w-32 h-9"
                alt="User profile and cart"
                src="https://c.animaapp.com/mbr2jpx2DSKBSz/img/component-25.svg"
              />
              {isGuest && (
                <button
                  onClick={() => navigate('/')}
                  className="bg-[#0ea5e9] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0284c7] transition-colors"
                >
                  Sign Up
                </button>
              )}
            </div>
          </header>

          {/* Guest Welcome Banner */}
          {isGuest && (
            <div className="mx-6 mt-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-['Urbanist',Helvetica] font-semibold text-blue-900 text-lg">
                    Welcome, Guest! 👋
                  </h3>
                  <p className="font-['Urbanist',Helvetica] font-normal text-blue-700 text-sm mt-1">
                    You're browsing as a guest. Sign up to save favorites and complete purchases!
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/register/shopper')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main content sections */}
          <main className="flex-1 relative p-6 space-y-8">
            {/* Hero Section with Featured and Recommendation */}
            <div className="grid grid-cols-12 gap-6 h-[300px]">
              {/* Recommendation Section */}
              <div className="col-span-5">
                <RecommendationSection />
              </div>
              
              {/* Featured Section */}
              <div className="col-span-7 flex items-center justify-center">
                <FeaturedSection />
              </div>
            </div>

            {/* Popular Fabrics Section */}
            <div className="w-full">
              <PopularFabricsSection />
            </div>

            {/* Discover/Recommendation Products */}
            <div className="w-full">
              <DiscoverSection isGuest={isGuest} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShopperDashboard;