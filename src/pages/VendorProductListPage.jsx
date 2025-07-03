import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/Product/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { useVendorProducts } from '../hooks/useVendorProducts';
import productService from '../services/productService';

// ✅ Enhanced helper function to determine product status
const getProductStatus = (product) => {
  // ✅ PRIORITY 1: Check explicit inactive statuses first
  if (
    product.status === 'INACTIVE' ||
    product.status === 'inactive' ||
    product.status === false ||
    product.status === 'unavailable' ||
    product.display === false
  ) {
    return false;
  }
  
  // ✅ PRIORITY 2: Check explicit active statuses
  if (
    product.status === 'ACTIVE' ||
    product.status === 'active' ||
    product.status === true ||
    product.status === 'available' ||
    product.isActive === true ||
    product.active === true ||
    product.available === true
  ) {
    return true;
  }
  
  // ✅ PRIORITY 3: Fall back to display field only if status is undefined/null
  return product.display === true || product.display === 'true';
};

// ✅ Enhanced helper function to get product image
const getProductImage = (product) => {
  // Handle base64 encoded images (from localStorage)
  if (product.image && product.image.startsWith('data:image/')) {
    return product.image;
  }
  
  // Handle API image URLs
  if (product.image && typeof product.image === 'string') {
    if (product.image.startsWith('http')) {
      return product.image;
    }
    if (product.image.startsWith('/')) {
      return `${process.env.REACT_APP_API_BASE_URL}${product.image}`;
    }
    return `${process.env.REACT_APP_API_BASE_URL}/uploads/${product.image}`;
  }
  
  // Handle image object format from API
  if (product.image && typeof product.image === 'object' && product.image.url) {
    return product.image.url;
  }
  
  // Handle images array
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === 'string') {
      if (firstImage.startsWith('http') || firstImage.startsWith('data:')) {
        return firstImage;
      }
      return `${process.env.REACT_APP_API_BASE_URL}/uploads/${firstImage}`;
    }
    if (typeof firstImage === 'object' && firstImage.url) {
      return firstImage.url;
    }
  }
  
  if (product.imageUrl) {
    return product.imageUrl;
  }
  
  return null;
};

// ✅ ADD: View mode constants
const VIEW_MODES = {
  LIST: 'list',
  GRID: 'grid'
};

// ✅ ADD: Filter constants matching design
const FILTER_TABS = {
  ALL: 'all',
  AVAILABLE: 'available', 
  DISABLED: 'disabled'
};

export const VendorProductListPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ✅ Add missing state variables
  const [products, setProducts] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // ✅ ADD: Filter tab state
  const [activeFilterTab, setActiveFilterTab] = useState(FILTER_TABS.ALL);
  
  const [viewMode, setViewMode] = useState(() => {
    const urlViewMode = searchParams.get('view');
    return urlViewMode === 'grid' ? VIEW_MODES.GRID : VIEW_MODES.LIST;
  });
  
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    materialType: searchParams.get('materialType') || '',
    pattern: searchParams.get('pattern') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'date',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  }));
  
  const { 
    loadProducts,
    createProduct
  } = useVendorProducts();
  
  const navigate = useNavigate();

  // Enhanced: Load vendor products with filtering
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
      
      // Apply client-side filtering
      if (currentFilters.search && currentFilters.search.trim()) {
        const searchTerm = currentFilters.search.toLowerCase();
        vendorProducts = vendorProducts.filter(product => 
          product.name?.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          product.materialType?.toLowerCase().includes(searchTerm)
        );
      }
      
      // ✅ Filter by status based on active tab
      if (activeFilterTab === FILTER_TABS.AVAILABLE) {
        vendorProducts = vendorProducts.filter(product => getProductStatus(product));
      } else if (activeFilterTab === FILTER_TABS.DISABLED) {
        vendorProducts = vendorProducts.filter(product => !getProductStatus(product));
      }
      
      // Sort by upload date descending (newest first)
      vendorProducts.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.dateCreated || 0);
        const dateB = new Date(b.createdAt || b.dateCreated || 0);
        return dateB - dateA;
      });
      
      setProducts(vendorProducts);
      setTotalCount(vendorProducts.length);
      
    } catch (error) {
      console.error('❌ Error loading vendor products:', error);
      setError(error.message || 'Failed to load products');
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id, activeFilterTab]);

  // ✅ ADD: Filter tab counts
  const getFilterCounts = () => {
    const all = products.length;
    const available = products.filter(p => getProductStatus(p)).length;
    const disabled = products.filter(p => !getProductStatus(p)).length;
    
    return { all, available, disabled };
  };

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value.toString().trim()) {
        params.append(key, value);
      }
    });
    
    if (viewMode !== VIEW_MODES.LIST) {
      params.append('view', viewMode);
    }
    
    setSearchParams(params);
    loadVendorProducts(newFilters);
  }, [setSearchParams, loadVendorProducts, viewMode]);

  // ✅ ADD: Filter tab handler
  const handleFilterTabChange = useCallback((tab) => {
    setActiveFilterTab(tab);
    // Reload products with new filter
    loadVendorProducts(filters);
  }, [loadVendorProducts, filters]);

  const handleViewModeChange = useCallback((newViewMode) => {
    setViewMode(newViewMode);
    localStorage.setItem('vendorProductView', newViewMode);
    
    const params = new URLSearchParams(searchParams);
    if (newViewMode !== VIEW_MODES.LIST) {
      params.set('view', newViewMode);
    } else {
      params.delete('view');
    }
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleProductClick = useCallback((product) => {
    navigate(`/vendor/products/${product.id}`);
  }, [navigate]);

  const handleCreateProduct = useCallback(async (productData) => {
    try {
      await createProduct(productData);
      loadVendorProducts(filters);
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  }, [createProduct, loadVendorProducts, filters]);

  useEffect(() => {
    if (user?.id) {
      loadVendorProducts(filters);
    }
  }, [user?.id, loadVendorProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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

  const filterCounts = getFilterCounts();

  return (
    <div className="min-h-screen bg-[#d8dfe9]" data-testid="vendor-product-page">
      <div className="w-full">
        {/* ✅ NEW: Header matching design */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {/* Left: Search */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-[#f9f9f9] placeholder-[#2e2e2e] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search Products"
                    value={filters.search}
                    onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center space-x-3 ml-4">
                <Link 
                  to="/vendor/bulk-upload"
                  className="px-6 py-2.5 text-base font-medium text-[#b2b2b2] bg-[#f9f9f9] border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Bulk Upload
                </Link>
                <Link 
                  to="/vendor/upload"
                  className="px-6 py-2.5 text-base font-medium text-[#edff8c] bg-[#2e2e2e] rounded-lg hover:bg-gray-800 transition-colors flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ NEW: Filter Tabs matching design */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {/* Filter Tabs */}
              <div className="flex space-x-1">
                <button
                  onClick={() => handleFilterTabChange(FILTER_TABS.ALL)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeFilterTab === FILTER_TABS.ALL
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All Products ({filterCounts.all})
                </button>
                <button
                  onClick={() => handleFilterTabChange(FILTER_TABS.AVAILABLE)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeFilterTab === FILTER_TABS.AVAILABLE
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Available ({filterCounts.available})
                </button>
                <button
                  onClick={() => handleFilterTabChange(FILTER_TABS.DISABLED)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeFilterTab === FILTER_TABS.DISABLED
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Disabled ({filterCounts.disabled})
                </button>
              </div>

              {/* Right: View Toggle & Filter */}
              <div className="flex items-center space-x-3">
                {/* View Mode Toggle - Keep for grid functionality */}
                <div 
                  data-testid="view-toggle-container"
                  className="flex items-center bg-gray-100 rounded-lg p-1"
                >
                  <button
                    onClick={() => handleViewModeChange(VIEW_MODES.LIST)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === VIEW_MODES.LIST
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => handleViewModeChange(VIEW_MODES.GRID)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === VIEW_MODES.GRID
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Grid
                  </button>
                </div>

                {/* Filter Button */}
                <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ NEW: Product Table matching design */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Table Header */}
            <div className="bg-white border-b border-gray-200">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">Product List</h1>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Monthly</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div data-testid="loading-spinner" className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading your products...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div data-testid="error-state-container" className="p-8 text-center">
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

            {/* Products Table/Grid */}
            {!isLoading && !error && products.length > 0 && (
              <>
                {viewMode === VIEW_MODES.LIST ? (
                  <ProductTable 
                    products={products} 
                    onProductClick={handleProductClick}
                  />
                ) : (
                  <div 
                    data-testid="product-grid-container"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6"
                  >
                    {products.map((product) => (
                      <ProductCard
                        key={product.id || product._id}
                        product={product}
                        showVendorInfo={false}
                        className="relative group"
                        onClick={() => handleProductClick(product)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!isLoading && !error && products.length === 0 && (
              <div data-testid="empty-state-container" className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeFilterTab !== FILTER_TABS.ALL ? 
                    'No products match this filter' : 
                    'No products yet'
                  }
                </h3>
                <p className="text-gray-500 mb-4">
                  {activeFilterTab !== FILTER_TABS.ALL ? 
                    'Try selecting a different filter tab' : 
                    'Start building your catalog by adding your first product'
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  {activeFilterTab !== FILTER_TABS.ALL ? (
                    <button
                      onClick={() => handleFilterTabChange(FILTER_TABS.ALL)}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Show All Products
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
      </div>
    </div>
  );
};

// ✅ NEW: ProductTable component matching design exactly
const ProductTable = ({ products, onProductClick }) => {
  return (
    <div data-testid="product-list-container" className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Table Header */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
              Product Image
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
              Product Name
              <svg className="w-3 h-3 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
              ID
              <svg className="w-3 h-3 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
              Qty
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
              Price per yard
              <svg className="w-3 h-3 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
              Status
              <svg className="w-3 h-3 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <ProductTableRow 
              key={product.id || product._id}
              product={product}
              onClick={() => onProductClick(product)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ✅ NEW: ProductTableRow component matching design
const ProductTableRow = ({ product, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const productImage = getProductImage(product);
  const isActive = getProductStatus(product);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  const formatPrice = (price) => {
    if (!price) return '₦0';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <tr 
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
      data-testid={`product-row-${product.id}`}
    >
      {/* Product Image - Exact Design Size */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex-shrink-0 w-[85.7px] h-16 bg-gray-200 rounded-lg overflow-hidden">
          {!imageError && productImage ? (
            <img 
              src={productImage}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </td>

      {/* Product Name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{product.name}</div>
          <div className="text-sm text-gray-500">{product.materialType || 'Tie-and-dye fabric'}</div>
        </div>
      </td>

      {/* ID */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        #{product.id?.toString().slice(-4) || '2490'}
      </td>

      {/* Quantity */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {product.quantity || 0} Pcs
      </td>

      {/* Date */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatDate(product.createdAt || product.date)}
      </td>

      {/* Price per yard */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-900">
            {formatPrice(product.pricePerYard || product.price)}
          </span>
        </div>
      </td>

      {/* Status - EXACT Design Match with Colored Dots */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium shadow-sm ${
          isActive
            ? 'bg-white text-green-800 border border-gray-200'
            : product.status === 'Low in Stock'
            ? 'bg-white text-yellow-800 border border-gray-200'
            : 'bg-white text-red-800 border border-gray-200'
        }`}>
          <span className={`w-2 h-2 rounded-full mr-2 ${
            isActive
              ? 'bg-[#28b446]'
              : product.status === 'Low in Stock'
              ? 'bg-[#fbbb00]'
              : 'bg-[#cd0000]'
          }`}></span>
          {isActive ? 'In Stock' : product.status === 'Low in Stock' ? 'Low in Stock' : 'Out Of Stock'}
        </span>
      </td>

      {/* Action */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button 
          className="text-gray-400 hover:text-gray-600"
          onClick={(e) => {
            e.stopPropagation();
            // Handle action menu
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </td>
    </tr>
  );
};

// ✅ Export helper functions and components
export { getProductImage, getProductStatus, ProductTable, ProductTableRow };
export default VendorProductListPage;