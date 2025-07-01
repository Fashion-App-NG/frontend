import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import ProductFilters from '../components/Product/ProductFilters';
import ProductGrid from '../components/Product/ProductGrid';
import ProductViewToggle from '../components/Product/ProductViewToggle';
import { useAuth } from '../contexts/AuthContext';
import productService from '../services/productService';

const VendorProductListPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [view, setView] = useState('list');

  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    materialType: searchParams.get('materialType') || '',
    pattern: searchParams.get('pattern') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'name',
    sortOrder: searchParams.get('sortOrder') || 'asc'
  }));

  useEffect(() => {
    const savedView = localStorage.getItem('vendorProductView');
    if (savedView && ['grid', 'list'].includes(savedView)) {
      setView(savedView);
    }
  }, []);

  const loadVendorProducts = useCallback(async (currentFilters) => {
    if (!user?.id) {
      setError('Vendor ID not found. Please log in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await productService.getVendorProducts(user.id);
      
      if (response.error) {
        throw new Error(response.error);
      }

      let vendorProducts = response.products || [];
      
      if (currentFilters.search && currentFilters.search.trim()) {
        const searchTerm = currentFilters.search.toLowerCase();
        vendorProducts = vendorProducts.filter(product => 
          product.name?.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          product.materialType?.toLowerCase().includes(searchTerm)
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
          parseFloat(product.pricePerYard || product.price || 0) >= minPrice
        );
      }
      
      if (currentFilters.maxPrice) {
        const maxPrice = parseFloat(currentFilters.maxPrice);
        vendorProducts = vendorProducts.filter(product => 
          parseFloat(product.pricePerYard || product.price || 0) <= maxPrice
        );
      }
      
      if (currentFilters.sortBy) {
        vendorProducts.sort((a, b) => {
          let aVal = a[currentFilters.sortBy];
          let bVal = b[currentFilters.sortBy];
          
          if (currentFilters.sortBy === 'pricePerYard' || currentFilters.sortBy === 'price') {
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
      
    } catch (err) {
      console.error('Failed to load vendor products:', err);
      setError(err.message || 'Failed to load your products. Please try again.');
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

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
  }, [setSearchParams, loadVendorProducts]);

  const handleViewChange = useCallback((newView) => {
    setView(newView);
    localStorage.setItem('vendorProductView', newView);
  }, []);

  // ✅ Fix: Load products only when user changes, pass current filters directly
  useEffect(() => {
    if (user?.id) {
      loadVendorProducts(filters);
    }
    // ✅ ESLint disable comment to acknowledge the intentional omission
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loadVendorProducts]);

  if (!isAuthenticated) {
    return <Navigate to="/login/vendor" replace />;
  }

  if (user && user.role !== 'vendor') {
    if (user.role === 'shopper') {
      return <Navigate to="/shopper/dashboard" replace />;
    }
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  if (!user?.id) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-500 mb-4">Please log in to view your products</p>
          <Link 
            to="/login/vendor"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login as Vendor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="w-full">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Products</h1>
              <p className="text-gray-600">
                {loading ? (
                  'Loading your products...'
                ) : error ? (
                  'Error loading products'
                ) : totalCount > 0 ? (
                  <>Showing {totalCount} of your product{totalCount !== 1 ? 's' : ''}</>
                ) : (
                  'No products found'
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <ProductViewToggle 
                currentView={view}
                onViewChange={handleViewChange}
                defaultView="list"
                disabled={loading}
              />
              
              <div className="flex gap-3">
                <Link 
                  to="/vendor/upload" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                </Link>
                <Link 
                  to="/vendor/bulk-upload" 
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Bulk Upload
                </Link>
              </div>
            </div>
          </div>
        </div>

        <ProductFilters 
          onFiltersChange={handleFiltersChange}
          loading={loading}
        />

        {!loading && error && (
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => loadVendorProducts(filters)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <ProductGrid 
            products={products}
            loading={loading}
            error={error}
            showVendorInfo={false}
            view={view}
            emptyMessage={
              filters.search || filters.materialType || filters.pattern ? 
                'No products match your filters. Try adjusting your search criteria.' : 
                'Start building your catalog by adding your first product!'
            }
          />
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filters.search || filters.materialType || filters.pattern ? 
                'No products match your filters' : 
                'No products yet'
              }
            </h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.materialType || filters.pattern ? 
                'Try adjusting your search criteria' : 
                'Start building your catalog by adding your first product'
              }
            </p>
            <div className="flex gap-3 justify-center">
              {(filters.search || filters.materialType || filters.pattern) ? (
                <button
                  onClick={() => {
                    const defaultFilters = {
                      search: '',
                      materialType: '',
                      pattern: '',
                      minPrice: '',
                      maxPrice: '',
                      sortBy: 'name',
                      sortOrder: 'asc'
                    };
                    setFilters(defaultFilters);
                    setSearchParams({});
                    loadVendorProducts(defaultFilters);
                  }}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProductListPage;