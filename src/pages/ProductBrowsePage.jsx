import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductFilters from '../components/Product/ProductFilters';
import ProductGrid from '../components/Product/ProductGrid';
import ProductViewToggle from '../components/Product/ProductViewToggle';
import productService from '../services/productService';

const ProductBrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [view, setView] = useState('grid'); // ✅ Default to grid for shoppers

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

  // ✅ Load view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('shopperProductView');
    if (savedView && ['grid', 'list'].includes(savedView)) {
      setView(savedView);
    }
  }, []);

  // ✅ Fix: Remove unnecessary filters dependency
  const loadProducts = useCallback(async (currentFilters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getAllProducts(currentFilters);
      
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
  }, []); // ✅ Remove filters dependency since we use currentFilters parameter

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
  }, [setSearchParams, loadProducts]);

  // ✅ Handle view change
  const handleViewChange = useCallback((newView) => {
    setView(newView);
    localStorage.setItem('shopperProductView', newView);
  }, []);

  useEffect(() => {
    loadProducts(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
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
                  <span className="ml-2">matching your criteria</span>
                )}
              </p>
            )}
          </div>

          {/* ✅ View Toggle */}
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
        loading={loading}
      />

      <ProductGrid 
        products={products}
        loading={loading}
        error={error}
        showVendorInfo={true}
        view={view}
        emptyMessage="No products match your search criteria. Try adjusting your filters."
      />
    </div>
  );
};

export default ProductBrowsePage;