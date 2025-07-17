import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/Product/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import productService from '../services/productService';
import useDebounce from '../hooks/useDebounce';

const BrowseProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchParams, setSearchParams] = useSearchParams();

  const { user, isAuthenticated } = useAuth();
  const { cartCount } = useCart();

  // Filters state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    materialType: searchParams.get('materialType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });
  const debouncedFilters = useDebounce(filters, 400);

  const loadProducts = useCallback(async (filters) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim()) {
          queryParams.append(key, value);
        }
      });

      const response = await productService.getAllProducts(queryParams.toString());
      
      if (response.error) {
        throw new Error(response.error);
      }

      setProducts(response.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      setError(error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(debouncedFilters);
  }, [debouncedFilters, loadProducts]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  };

  const handleProductClick = (product) => {
    window.location.href = `/product/${product._id || product.id}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                FASHION CULTURE
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, vendors..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                  className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <Link to="/shopper/cart" className="relative">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.293 1.293A1 1 0 007 16h8M7 13v5a2 2 0 002 2h8a2 2 0 002-2v-5" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link to="/shopper/favorites" className="text-gray-700 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>

              {isAuthenticated ? (
                <Link to="/shopper/dashboard" className="text-gray-700 hover:text-gray-900">
                  Dashboard
                </Link>
              ) : (
                <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">CULTURE</h2>
            <p className="text-sm text-gray-600 mb-6">Shopper Dashboard</p>
            
            <nav className="space-y-2">
              <Link to="/shopper/dashboard" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Dashboard
              </Link>
              
              <Link to="/shopper/browse" className="flex items-center px-3 py-2 text-blue-600 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2M7 7h10" />
                </svg>
                Browse Products
              </Link>
              
              <Link to="/shopper/orders" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                My Orders
              </Link>
              
              <Link to="/shopper/cart" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.293 1.293A1 1 0 007 16h8M7 13v5a2 2 0 002 2h8a2 2 0 002-2v-5" />
                </svg>
                Shopping Cart
              </Link>
              
              <Link to="/shopper/favorites" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Favorites
              </Link>

              <Link to="/shopper/notifications" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 6h16v12H4z" />
                </svg>
                Notifications
              </Link>

              <Link to="/shopper/settings" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>

              <Link to="/shopper/profile" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>
            </nav>

            {/* User Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.[0] || user?.email?.[0] || 'S'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName || 'shopper0'}
                  </p>
                  <p className="text-xs text-gray-500">Shopper</p>
                </div>
              </div>
              <button className="mt-4 text-sm text-red-600 hover:text-red-800">
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex space-x-8">
                <button className="py-2 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
                  All Products (44)
                </button>
                <button className="py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                  In Stock (44)
                </button>
                <button className="py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                  Favorites (1)
                </button>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex items-center space-x-4">
            <select
              value={filters.materialType}
              onChange={(e) => handleFilterChange({ ...filters, materialType: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Materials</option>
              <option value="cotton">Cotton</option>
              <option value="silk">Silk</option>
              <option value="linen">Linen</option>
              <option value="polyester">Polyester</option>
            </select>

            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min ₦"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange({ ...filters, minPrice: e.target.value })}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max ₦"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange({ ...filters, maxPrice: e.target.value })}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="name">Name</option>
              <option value="pricePerYard">Price</option>
            </select>
          </div>

          {/* Products Grid */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse Products</h1>
            <p className="text-gray-600">Showing {products.length} products</p>
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {products.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  showVendorInfo={true}
                  onClick={handleProductClick}
                />
              ))}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m-2 0v5a2 2 0 002 2h14a2 2 0 002-2v-5" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BrowseProductsPage;