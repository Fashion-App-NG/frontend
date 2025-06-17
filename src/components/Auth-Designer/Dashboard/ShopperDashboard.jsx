import { SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { DiscoverSection } from './sections/DiscoverSection'; // ✅ Now displays "Discover Your Fashion Culture"
import { FeaturedSection } from './sections/FeaturedSection';
import { PopularFabricsSection } from './sections/PopularFabricsSection';
import { RecommendationSection } from './sections/RecommendationSection'; // ✅ Now displays "Recommendations" product grid
import { SidebarSection } from './sections/SidebarSection';

export const ShopperDashboard = ({ isGuest = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const displayUser = isGuest ? { firstName: 'Guest' } : user;

  return (
    <div className="w-full min-h-screen bg-[#d8dfe9] overflow-hidden">
      <div className="relative flex">
        {/* Fixed Sidebar */}
        <div className="w-[280px] h-screen fixed left-0 top-0 z-10">
          <SidebarSection isGuest={isGuest} />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col ml-[280px] min-h-screen max-w-[calc(100vw-280px)]">
          {/* Top navigation bar */}
          <header className="w-full py-7 px-6 flex items-center justify-between border-b border-gray-200 bg-[#d8dfe9] backdrop-blur-sm sticky top-0 z-20">
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

          {/* Main content sections */}
          <main className="flex-1 p-6 space-y-6">
            {/* Hero Section - Fixed layout with correct components */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="grid grid-cols-12 gap-6 min-h-[300px]">
                {/* ✅ FIXED: DiscoverSection now shows "Discover Your Fashion Culture" */}
                <div className="col-span-5">
                  <DiscoverSection />
                </div>
                
                {/* Featured Section */}
                <div className="col-span-7 flex items-center justify-center">
                  <FeaturedSection />
                </div>
              </div>
            </div>

            {/* Combined Popular Fabrics and Recommendations Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-8">
              {/* Popular Fabrics Section */}
              <PopularFabricsSection />
              
              {/* ✅ FIXED: RecommendationSection now shows "Recommendations" product grid */}
              <RecommendationSection isGuest={isGuest} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShopperDashboard;