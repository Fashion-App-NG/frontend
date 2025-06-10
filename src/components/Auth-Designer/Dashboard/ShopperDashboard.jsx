import React from 'react';
import { SearchIcon } from 'lucide-react';
import { SidebarSection } from './sections/SidebarSection';
import { DiscoverSection } from './sections/DiscoverSection';
import { FeaturedSection } from './sections/FeaturedSection';
import { PopularFabricsSection } from './sections/PopularFabricsSection';
import { RecommendationSection } from './sections/RecommendationSection';
import { useAuth } from '../../../contexts/AuthContext';

export const ShopperDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="w-full max-w-[1440px] min-h-screen bg-[#d8dfe9] overflow-hidden mx-auto">
      <div className="relative flex">
        {/* Sidebar */}
        <div className="w-[18%] h-screen fixed">
          <SidebarSection />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col ml-[18%]">
          {/* Top navigation bar */}
          <header className="w-full py-7 px-6 flex items-center justify-between border-b border-gray-200 bg-white/50 backdrop-blur-sm">
            {/* User greeting */}
            <div className="flex flex-col w-[202px] items-start gap-1">
              <h1 className="font-['Urbanist',Helvetica] font-bold text-[#3e3e3e] text-[32px] leading-normal">
                Hey {user?.firstName || 'Shopper'}!
              </h1>
              <p className="font-['Urbanist',Helvetica] font-normal text-[#2d2d2d] text-base leading-[16px]">
                What would you like to shop?
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
            <img
              className="w-32 h-9"
              alt="User profile and cart"
              src="https://c.animaapp.com/mbr2jpx2DSKBSz/img/component-25.svg"
            />
          </header>

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
              <DiscoverSection />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShopperDashboard;