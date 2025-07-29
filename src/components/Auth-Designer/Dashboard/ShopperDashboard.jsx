import { SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import productService from '../../../services/productService';
import ProductCard from '../../Product/ProductCard';
import { DiscoverSection } from './sections/DiscoverSection';
import { FeaturedSection } from './sections/FeaturedSection';
import { PopularFabricsSection } from './sections/PopularFabricsSection';
import { RecommendationSection } from './sections/RecommendationSection';

const ShopperDashboard = ({ isGuest = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats] = useState({
    totalOrders: 0,
    cartItems: 0,
    favorites: 0
  });

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const response = await productService.getAllProducts({ sortBy: 'newest', sortOrder: 'desc' });
        setFeaturedProducts(response.products?.slice(0, 4) || []);
      } catch (error) {
        console.error('Failed to load featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  const displayUser = isGuest ? { firstName: 'Guest' } : user;

  const quickActions = [
    {
      name: 'Browse Products',
      description: 'Discover new fabrics and materials',
      href: isGuest ? '/browse' : '/shopper/browse',
      icon: 'grid',
      color: 'blue'
    },
    {
      name: 'View Cart',
      description: 'Check items in your shopping cart',
      href: '/shopper/cart',
      icon: 'cart',
      color: 'green'
    },
    {
      name: 'My Orders',
      description: 'Track your recent purchases',
      href: '/shopper/orders',
      icon: 'clipboard',
      color: 'purple'
    },
    {
      name: 'Favorites',
      description: 'View your saved products',
      href: '/shopper/favorites',
      icon: 'heart',
      color: 'red'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        {/* Top navigation bar */}
        <header className="w-full py-7 px-6 flex items-center justify-between border-b border-gray-200 bg-[#d8dfe9] backdrop-blur-sm sticky top-0 z-20">
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

          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.email?.split('@')[0] || 'Shopper'}!
            </h1>
            <p className="text-gray-600">
              Discover the latest fabrics and materials from our verified vendors.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cart Items</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.cartItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Favorites</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.favorites}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.href}
                  className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className={`p-2 bg-${action.color}-100 rounded-lg w-fit mb-3`}>
                    <svg className={`w-6 h-6 text-${action.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {action.icon === 'grid' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      )}
                      {action.icon === 'cart' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                      )}
                      {action.icon === 'clipboard' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      )}
                      {action.icon === 'heart' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      )}
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{action.name}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Products - temporarily hidden due to API/auth issues */}
          {false && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Featured Products</h2>
                <Link 
                  to="/shopper/browse" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View all products →
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 animate-pulse">
                      <div className="aspect-[4/3] bg-gray-200 rounded-t-lg"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : featuredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showVendorInfo={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
                  <p className="text-gray-500">Check back later for new arrivals</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ShopperDashboard;