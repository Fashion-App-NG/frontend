import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductFilters from '../components/Product/ProductFilters';
import ProductGrid from '../components/Product/ProductGrid';
import ProductViewToggle from '../components/Product/ProductViewToggle';
import useDebounce from '../hooks/useDebounce';
import productService from '../services/productService';

const ProductBrowsePage = ({ searchQuery = '' }) => {
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
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  }));

  // Update filters when searchQuery prop changes
  useEffect(() => {
    if (searchQuery) {
      setFilters(prev => ({ ...prev, search: searchQuery }));
    }
  }, [searchQuery]);

  const debouncedFilters = useDebounce(filters, 400);

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

      const queryParams = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value.toString().trim()) {
          queryParams.append(key, value);
        }
      });

      const response = await productService.getAllProducts(queryParams.toString());
      
      if (response.error) {
        throw new Error(response.error);
      }

      setProducts(response.products || []);
      setTotalCount(response.total || response.products?.length || 0);
      
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err.message || 'Failed to load products. Please try again.');
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value.toString().trim()) {
        params.set(key, value);
      }
    });
    setSearchParams(params);
    
    loadProducts(newFilters);
    setShowFilters(false);
  }, [setSearchParams, loadProducts]);

  const handleViewChange = useCallback((newView) => {
    setView(newView);
    localStorage.setItem('shopperProductView', newView);
  }, []);

  useEffect(() => {
    loadProducts(debouncedFilters);
  }, [debouncedFilters, loadProducts]);

  // Count active filters
  const activeFilterCount = [
    filters.search,
    filters.materialType,
    filters.pattern,
    filters.minPrice,
    filters.maxPrice
  ].filter(Boolean).length;

  const handleProductClick = (product) => {
    window.location.href = `/product/${product._id || product.id}`;
  };

  return (
    <div className="w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
        {/* Header Section - Desktop Only */}
        <div className="hidden lg:block mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              {!loading && (
                <p className="text-gray-600">
                  {totalCount > 0 ? (
                    <>Showing {totalCount} product{totalCount !== 1 ? 's' : ''}</>
                  ) : (
                    'No products found'
                  )}
                  {(filters.search || filters.materialType || filters.pattern) && (
                    <span className="ml-1">matching your criteria</span>
                  )}
                </p>
              )}
            </div>

            <ProductViewToggle 
              currentView={view}
              onViewChange={handleViewChange}
              defaultView="grid"
              disabled={loading}
            />
          </div>
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setShowFilters(true)}
          className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors mb-4"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Desktop Filters */}
        <div className="hidden lg:block">
          <ProductFilters 
            onFiltersChange={handleFiltersChange}
            loading={loading}
            initialFilters={filters}
          />
        </div>

        {/* Product Grid */}
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
              <ProductFilters 
                onFiltersChange={handleFiltersChange}
                loading={loading}
                initialFilters={filters}
                isMobile={true}
              />
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleFiltersChange({
                      search: '',
                      materialType: '',
                      pattern: '',
                      minPrice: '',
                      maxPrice: '',
                      sortBy: 'newest',
                      sortOrder: 'desc'
                    });
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
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

export default ProductBrowsePage;