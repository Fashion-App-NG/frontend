import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductFilters from '../components/Product/ProductFilters';
import ProductGrid from '../components/Product/ProductGrid';
import ProductViewToggle from '../components/Product/ProductViewToggle';
import { useCart } from '../contexts/CartContext';
import useDebounce from '../hooks/useDebounce';
import productService from '../services/productService';

const ShopperProductListPage = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [DEBUG] ShopperProductListPage is rendering - THIS is what authenticated shoppers see');
  }

  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [view, setView] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Initialize filters from URL params
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    materialType: searchParams.get('materialType') || '',
    pattern: searchParams.get('pattern') || '',
    vendor: searchParams.get('vendor') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'date',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  }));
  
  const debouncedFilters = useDebounce(filters, 500); // ✅ Increase to 500ms

  // Load view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('shopperProductView');
    if (savedView && ['grid', 'list'].includes(savedView)) {
      setView(savedView);
    }
  }, []);

  const loadProducts = useCallback(async (currentFilters) => {
    try {
      setLoading(true);
      setError(null);

      // ✅ FIX: Pass plain object, not URLSearchParams
      const response = await productService.getAllProducts(currentFilters);
      
      if (response.error) {
        throw new Error(response.error);
      }

      setProducts(response.products || []);
      setTotalCount(response.total || response.totalCount || response.products?.length || 0);
      
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err.message || 'Failed to load products. Please try again.');
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []); // ✅ EMPTY dependency array - function never changes

  // ✅ FIX: Stable reference to avoid infinite loops
  const loadProductsRef = useRef(loadProducts);
  useEffect(() => {
    loadProductsRef.current = loadProducts;
  }, [loadProducts]);

  // ✅ Only trigger API call when debounced filters change
  useEffect(() => {
    loadProductsRef.current(debouncedFilters);
  }, [debouncedFilters]); // ✅ Only debouncedFilters in dependency

  // FIX: Update URL params WITHOUT triggering loadProducts
  const updateURLParams = useCallback((newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value.toString().trim()) {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  }, [setSearchParams]);

  // FIX: Handle filter updates WITHOUT triggering API calls
  const handleFilterUpdate = useCallback((newFilters) => {
    setFilters(newFilters); // Updates local state only
    updateURLParams(newFilters); // Updates URL only
    // Debounced filters will trigger API call after 500ms
  }, [updateURLParams]);

  // FIX: This should ONLY be called by desktop filter "Apply" button or dropdowns
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    updateURLParams(newFilters);
    loadProducts(newFilters); // Only called when user explicitly applies filters
    setShowFilters(false);
  }, [updateURLParams, loadProducts]);

  // NEW: Add the missing handleViewChange function
  const handleViewChange = useCallback((newView) => {
    setView(newView);
    localStorage.setItem('shopperProductView', newView);
  }, []);

  // Count active filters
  const activeFilterCount = [
    filters.search,
    filters.materialType,
    filters.pattern,
    filters.minPrice,
    filters.maxPrice
  ].filter(Boolean).length;

  const handleProductClick = (product) => {
    navigate(`/shopper/product/${product._id || product.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Top Bar */}
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
                  value={filters.search}
                  onChange={(e) => {
                    // ✅ FIX: Just update state, don't call loadProducts
                    handleFilterUpdate({ ...filters, search: e.target.value });
                  }}
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
              All Products ({totalCount})
            </button>
            <button 
              onClick={() => handleFiltersChange({ ...filters, inStock: true })}
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

        {/* Filter Button Row */}
        <div className="px-4 py-2 border-t border-gray-100">
          <button
            onClick={() => setShowFilters(true)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm font-medium">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Browse Fabrics
              </h1>
              {!loading && (
                <p className="text-gray-600">
                  {totalCount > 0 ? `Showing ${totalCount} products` : 'No products found'}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/shopper/cart')}
                className="relative px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>

              <ProductViewToggle 
                currentView={view}
                onViewChange={handleViewChange}
                defaultView="grid"
                disabled={loading}
              />
            </div>
          </div>

          <ProductFilters 
            onFiltersChange={handleFiltersChange}
            onFilterUpdate={handleFilterUpdate} // ✅ NEW: For text inputs
            loading={loading}
            initialFilters={filters}
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-0">
        <ProductGrid 
          products={products}
          loading={loading}
          error={error}
          showVendorInfo={true}
          view={view}
          onClick={handleProductClick}
          emptyMessage="No products match your search criteria. Try adjusting your filters."
        />
      </div>

      {/* Mobile Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowFilters(false)}
          />
          
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* ✅ FIX: Pass BOTH handlers to mobile filters */}
              <ProductFilters 
                onFiltersChange={handleFiltersChange}
                onFilterUpdate={handleFilterUpdate} // ✅ ADD THIS
                loading={loading}
                initialFilters={filters}
                isMobile={true}
              />
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                {/* ✅ FIX: Clear button should reset filters */}
                <button
                  onClick={() => {
                    const emptyFilters = {
                      search: '',
                      materialType: '',
                      pattern: '',
                      vendor: '',
                      minPrice: '',
                      maxPrice: '',
                      sortBy: 'date',
                      sortOrder: 'desc'
                    };
                    setFilters(emptyFilters);
                    handleFiltersChange(emptyFilters); // Apply cleared filters
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                >
                  Clear All
                </button>
                
                {/* ✅ FIX: Apply button should apply current filters */}
                <button
                  onClick={() => {
                    handleFiltersChange(filters); // Apply current local filters
                    setShowFilters(false);
                  }}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopperProductListPage;