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
  const loadProducts = async (currentFilters) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading products with filters:', currentFilters);
      
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
  };

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
  }, [setSearchParams]);

  useEffect(() => {
    loadProducts(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ FIX: Always return content only - let parent layout handle sidebars
  return (
    <div className="p-6 max-w-7xl mx-auto">
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
              <span className="ml-2">matching your criteria</span>
            )}
          </p>
        )}
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
        emptyMessage="No products match your search criteria. Try adjusting your filters."
      />
    </div>
  );
};

export default ProductBrowsePage;