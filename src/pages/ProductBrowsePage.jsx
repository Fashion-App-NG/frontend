import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductFilters from '../components/Product/ProductFilters';
import ProductGrid from '../components/Product/ProductGrid';
import productService from '../services/productService';

const ProductBrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Initialize filters from URL params
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    materialType: searchParams.get('materialType') || '',
    pattern: searchParams.get('pattern') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'name',
    sortOrder: searchParams.get('sortOrder') || 'asc'
  }));

  // Load products with current filters
  const loadProducts = useCallback(async (currentFilters = filters) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading products with filters:', currentFilters);
      
      // Clean filters (remove empty values)
      const cleanFilters = {};
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value.toString().trim()) {
          cleanFilters[key] = value;
        }
      });

      const response = await productService.getAllProducts(cleanFilters);
      
      setProducts(response.products || []);
      setTotalCount(response.products?.length || 0);
      
      console.log('✅ Products loaded:', response.products?.length || 0);
      
    } catch (err) {
      console.error('❌ Failed to load products:', err);
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value.toString().trim()) {
        params.set(key, value);
      }
    });
    setSearchParams(params);
    
    // Load products with new filters
    loadProducts(newFilters);
  }, [loadProducts, setSearchParams]);

  // Initial load
  useEffect(() => {
    loadProducts();
  }, []); // Only run once on mount

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Browse Fabrics
          </h1>
          
          {!loading && (
            <p className="text-gray-600">
              {totalCount > 0 ? (
                <>Showing {totalCount} product{totalCount !== 1 ? 's' : ''}</>
              ) : (
                'No products found'
              )}
              {(filters.search || filters.materialType || filters.pattern) && (
                <span className="ml-2">
                  matching your criteria
                </span>
              )}
            </p>
          )}
        </div>

        {/* Filters */}
        <ProductFilters 
          onFiltersChange={handleFiltersChange}
          loading={loading}
        />

        {/* Products Grid */}
        <ProductGrid 
          products={products}
          loading={loading}
          error={error}
          showVendorInfo={true}
          emptyMessage="No products match your search criteria. Try adjusting your filters."
        />

        {/* Load More (for future pagination) */}
        {!loading && products.length > 0 && products.length >= 20 && (
          <div className="text-center mt-8">
            <button 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => {
                // Future: implement pagination
                console.log('Load more products...');
              }}
            >
              Load More Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductBrowsePage;