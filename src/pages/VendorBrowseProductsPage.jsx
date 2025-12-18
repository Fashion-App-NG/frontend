import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductFilters from '../components/Product/ProductFilters';
import ProductGrid from '../components/Product/ProductGrid';
import { useAuth } from '../contexts/AuthContext';
import productService from '../services/productService';

const VendorBrowseProductsPage = () => {
  const { user } = useAuth();
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

  // ✅ Load vendor-specific products
  const loadVendorProducts = async (currentFilters) => {
    if (!user?.id) {
      setError('Vendor ID not found');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading vendor products for:', user.id);
      
      // ✅ Use vendor-specific endpoint
      const response = await productService.getVendorProducts(user.id);
      
      let vendorProducts = response.products || [];
      
      // ✅ Apply client-side filtering since vendor endpoint may not support all filters
      if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        vendorProducts = vendorProducts.filter(product => 
          product.name?.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm)
        );
      }
      
      if (currentFilters.materialType) {
        vendorProducts = vendorProducts.filter(product => 
          product.materialType?.toLowerCase() === currentFilters.materialType.toLowerCase()
        );
      }
      
      if (currentFilters.pattern) {
        vendorProducts = vendorProducts.filter(product => 
          product.pattern?.toLowerCase() === currentFilters.pattern.toLowerCase()
        );
      }
      
      if (currentFilters.minPrice) {
        const minPrice = parseFloat(currentFilters.minPrice);
        vendorProducts = vendorProducts.filter(product => 
          parseFloat(product.pricePerYard || 0) >= minPrice
        );
      }
      
      if (currentFilters.maxPrice) {
        const maxPrice = parseFloat(currentFilters.maxPrice);
        vendorProducts = vendorProducts.filter(product => 
          parseFloat(product.pricePerYard || 0) <= maxPrice
        );
      }
      
      // ✅ Apply sorting
      if (currentFilters.sortBy) {
        vendorProducts.sort((a, b) => {
          let aVal = a[currentFilters.sortBy];
          let bVal = b[currentFilters.sortBy];
          
          if (currentFilters.sortBy === 'pricePerYard') {
            aVal = parseFloat(aVal || 0);
            bVal = parseFloat(bVal || 0);
          } else if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal?.toLowerCase() || '';
          }
          
          if (currentFilters.sortOrder === 'desc') {
            return bVal > aVal ? 1 : -1;
          } else {
            return aVal > bVal ? 1 : -1;
          }
        });
      }
      
      setProducts(vendorProducts);
      setTotalCount(vendorProducts.length);
      
      console.log('✅ Vendor products loaded:', vendorProducts.length);
      
    } catch (err) {
      console.error('❌ Failed to load vendor products:', err);
      setError(err.message || 'Failed to load your products');
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
    
    loadVendorProducts(newFilters);
  }, [setSearchParams, user?.id]);

  useEffect(() => {
    loadVendorProducts(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Products</h1>
            <p className="text-gray-600">
              {!loading && totalCount > 0 ? (
                <>Showing {totalCount} of your product{totalCount !== 1 ? 's' : ''}</>
              ) : !loading ? (
                'No products found'
              ) : (
                'Loading your products...'
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              to="/vendor/upload" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Product
            </Link>
            <Link 
              to="/vendor/bulk-upload" 
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Bulk Upload
            </Link>
          </div>
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
        showVendorInfo={false}
        emptyMessage={`No products match your search criteria. ${products.length === 0 && !loading ? 'Start by adding your first product!' : ''}`}
      />
      
      {/* ✅ Empty state with action */}
      {!loading && products.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500 mb-4">Start building your catalog by adding your first product</p>
          <div className="flex gap-3 justify-center">
            <Link 
              to="/vendor/upload"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Single Product
            </Link>
            <Link 
              to="/vendor/bulk-upload"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Bulk Upload
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorBrowseProductsPage;