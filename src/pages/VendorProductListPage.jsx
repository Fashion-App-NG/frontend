import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import ProductViewToggle from '../components/Product/ProductViewToggle';
import ProductCard from '../components/Product/VendorProductCard';
import { ProductActionDropdown } from '../components/Vendor/ProductActionDropdown';
import { RestockModal } from '../components/Vendor/RestockModal';
import { useAuth } from '../contexts/AuthContext';
import { useVendorProducts } from '../hooks/useVendorProducts';
import productService from '../services/productService';

// ✅ Check if all these components exist and are properly exported:
// - ProductCard should export default
// - ProductViewToggle should export default  
// - ProductActionDropdown should export named
// - RestockModal should export named
// - useVendorProducts should export named

// ✅ Enhanced helper function to determine product status
export const getProductStatus = (product) => {
  // ✅ Check for INACTIVE states first (higher priority)
  if (
    product.status === 'INACTIVE' ||
    product.status === 'inactive' ||
    product.status === false ||
    product.status === 'unavailable'
  ) {
    return false;
  }
  
  // ✅ Check for ACTIVE states (higher priority than display)
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
  
  // ✅ Only use display as fallback when status is undefined/null
  if (product.display === false) {
    return false;
  }
  
  return product.display === true || product.display === 'true';
};

// ✅ Enhanced helper function to get product image
export const getProductImage = (product) => {
  // ✅ Handle data URLs (base64 images)
  if (product.image && typeof product.image === 'string' && product.image.startsWith('data:image/')) {
    return product.image;
  }
  
  // ✅ Handle string URLs
  if (product.image && typeof product.image === 'string') {
    if (product.image.startsWith('http')) {
      return product.image;
    }
    return `${process.env.REACT_APP_API_BASE_URL}/uploads/${product.image}`;
  }
  
  // ✅ Handle image objects with url property
  if (product.image && typeof product.image === 'object' && product.image.url) {
    return product.image.url;
  }
  
  // ✅ Handle images array
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === 'string') {
      if (firstImage.startsWith('http')) {
        return firstImage;
      }
      return `${process.env.REACT_APP_API_BASE_URL}/uploads/${firstImage}`;
    }
    if (typeof firstImage === 'object' && firstImage.url) {
      return firstImage.url;
    }
  }
  
  // ✅ Handle imageUrls array
  if (product.imageUrls && product.imageUrls.length > 0) {
    const firstImageUrl = product.imageUrls[0];
    if (firstImageUrl.startsWith('http')) {
      return firstImageUrl;
    }
    return `${process.env.REACT_APP_API_BASE_URL}/uploads/${firstImageUrl}`;
  }
  
  // ✅ Handle single imageUrl property
  if (product.imageUrl) {
    if (product.imageUrl.startsWith('http')) {
      return product.imageUrl;
    }
    return `${process.env.REACT_APP_API_BASE_URL}/uploads/${product.imageUrl}`;
  }
  
  return null;
};

// ✅ Filter constants
const FILTER_TABS = {
  ALL: 'all',
  AVAILABLE: 'available', 
  DISABLED: 'disabled'
};

// Add VIEW_MODES back
const VIEW_MODES = {
  LIST: 'list',
  GRID: 'grid'
};

const VendorProductListPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ✅ State variables
  const [products, setProducts] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationData, setPaginationData] = useState(null);
  const [limit] = useState(20); // Items per page
  
  // ✅ Filter tab state
  const [activeFilterTab, setActiveFilterTab] = useState(FILTER_TABS.ALL);
  
  // ✅ Action menu states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRestockModal, setShowRestockModal] = useState(false);
  
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
    updateProduct
    // ✅ Removed unused: createProduct, deleteProduct
  } = useVendorProducts();
  
  const navigate = useNavigate();

  // ✅ Load vendor products with filtering
  const loadVendorProducts = useCallback(async (currentFilters) => {
    if (!user?.id) {
      setError('Vendor ID not found. Please log in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ Pass pagination params to API
      const response = await productService.getVendorProducts(user.id, currentPage, limit);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // ✅ Store pagination data from API response
      setTotalCount(response.totalCount || 0);
      setPaginationData(response.pagination || null);

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

      // ✅ Material type filter
      if (currentFilters.materialType) {
        vendorProducts = vendorProducts.filter(product => 
          product.materialType?.toLowerCase() === currentFilters.materialType.toLowerCase()
        );
      }

      // ✅ Price range filter
      if (currentFilters.minPrice) {
        const minPrice = parseFloat(currentFilters.minPrice);
        vendorProducts = vendorProducts.filter(product => 
          (product.pricePerYard || product.price || 0) >= minPrice
        );
      }

      if (currentFilters.maxPrice) {
        const maxPrice = parseFloat(currentFilters.maxPrice);
        vendorProducts = vendorProducts.filter(product => 
          (product.pricePerYard || product.price || 0) <= maxPrice
        );
      }
      
      // ✅ Filter by status based on active tab
      if (activeFilterTab === FILTER_TABS.AVAILABLE) {
        vendorProducts = vendorProducts.filter(product => getProductStatus(product));
      } else if (activeFilterTab === FILTER_TABS.DISABLED) {
        vendorProducts = vendorProducts.filter(product => !getProductStatus(product));
      }
      
      // ✅ Apply sorting
      vendorProducts.sort((a, b) => {
        let aValue, bValue;
        
        switch (currentFilters.sortBy) {
          case 'name':
            aValue = a.name || '';
            bValue = b.name || '';
            break;
          case 'price':
            aValue = a.pricePerYard || a.price || 0;
            bValue = b.pricePerYard || b.price || 0;
            break;
          case 'quantity':
            aValue = a.quantity || 0;
            bValue = b.quantity || 0;
            break;
          case 'date':
          default:
            aValue = new Date(a.createdAt || a.dateCreated || 0);
            bValue = new Date(b.createdAt || b.dateCreated || 0);
            break;
        }
        
        if (currentFilters.sortOrder === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });
      
      setProducts(vendorProducts);
      
    } catch (error) {
      console.error('❌ Error loading vendor products:', error);
      setError(error.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, activeFilterTab, currentPage, limit]); // ✅ Fixed dependencies

  // ✅ Filter tab counts - now using totalCount and current page products
  const getFilterCounts = () => {
    // Use totalCount from API for "All Products"
    const all = totalCount;
    
    // Count available/disabled from current page products only
    const available = products.filter(p => getProductStatus(p)).length;
    const disabled = products.filter(p => !getProductStatus(p)).length;
    
    return { all, available, disabled };
  };

  // ✅ Hide product handler
  const handleHideProduct = useCallback(async (product) => {
    if (!window.confirm(`Are you sure you want to hide "${product.name}"?`)) {
      return;
    }

    try {
      await updateProduct(product.id, { display: false, status: 'INACTIVE' });
      await loadVendorProducts(filters);
    } catch (error) {
      console.error('Failed to hide product:', error);
    }
  }, [updateProduct, loadVendorProducts, filters]);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    
    // ✅ Fix: Use params.set instead of append
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value.toString().trim()) {
        params.set(key, value); // ✅ Use set instead of append
      }
    });
    
    setSearchParams(params);
    loadVendorProducts(newFilters);
  }, [setSearchParams, loadVendorProducts]);

  // ✅ Filter tab handler
  const handleFilterTabChange = useCallback((tab) => {
    setActiveFilterTab(tab);
    loadVendorProducts(filters); // ✅ Direct call
  }, [loadVendorProducts, filters]);

  // Update handleProductClick to ensure proper ID
  const handleProductClick = useCallback((product) => {
    const productId = product.id || product._id;
    if (!productId) {
      console.error('Product ID is missing:', product);
      return;
    }
    navigate(`/vendor/products/${productId}`);
  }, [navigate]);

  // Update handleProductAction to ensure proper ID
  const handleProductAction = useCallback((product, action) => {
    const productId = product.id || product._id;
    if (!productId) {
      console.error('Product ID is missing for action:', action, product);
      return;
    }
    
    setSelectedProduct(product);
    
    switch (action) {
      case 'edit':
        navigate(`/vendor/products/${productId}/edit`);
        break;
      case 'restock':
        setShowRestockModal(true);
        break;
      case 'hide':
        handleHideProduct(product);
        break;
      default:
        break;
    }
  }, [navigate, handleHideProduct]);

  // Update handleRestock to use proper ID
  const handleRestock = useCallback(async (stockData) => {
    const productId = selectedProduct?.id || selectedProduct?._id;
    if (!productId) {
      console.error('Selected product ID is missing:', selectedProduct);
      return;
    }

    try {
      await updateProduct(productId, {
        quantity: stockData.newQuantity,
        stockHistory: [
          ...(selectedProduct.stockHistory || []),
          {
            date: new Date().toISOString(),
            previousQuantity: selectedProduct.quantity || 0,
            newQuantity: stockData.newQuantity,
            change: stockData.change,
            reason: stockData.reason,
            notes: stockData.notes
          }
        ]
      });
      
      setShowRestockModal(false);
      setSelectedProduct(null);
      await loadVendorProducts(filters);
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  }, [selectedProduct, updateProduct, loadVendorProducts, filters]);

  // Add back viewMode state in the main component
  const [viewMode, setViewMode] = useState(() => {
    const urlViewMode = searchParams.get('view');
    return urlViewMode === 'grid' ? VIEW_MODES.GRID : VIEW_MODES.LIST;
  });

  // Add back view mode handler
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

  // ✅ Fixed: proper dependency array
  useEffect(() => {
    if (user?.id) {
      loadVendorProducts(filters);
    }
  }, [user?.id, loadVendorProducts, activeFilterTab, filters]); // ✅ Add filters dependency

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
    <>
      <div className="bg-gray-50 min-h-screen" data-testid="vendor-product-page">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
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

        {/* Filter Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {/* Left: Filter Tabs */}
              <div className="flex space-x-8">
                {Object.entries({
                  [FILTER_TABS.ALL]: { label: 'All Products', count: filterCounts.all },
                  [FILTER_TABS.AVAILABLE]: { label: 'Available (this page)', count: filterCounts.available },
                  [FILTER_TABS.DISABLED]: { label: 'Disabled (this page)', count: filterCounts.disabled }
                }).map(([key, { label, count }]) => (
                  <button
                    key={key}
                    onClick={() => handleFilterTabChange(key)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeFilterTab === key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {label} ({count})
                  </button>
                ))}
              </div>

              {/* Right: View Toggle */}
              <ProductViewToggle 
                currentView={viewMode}
                onViewChange={handleViewModeChange}
                defaultView={VIEW_MODES.LIST}
                className="ml-4"
              />
            </div>
          </div>
        </div>

        {/* Sorting and Additional Filters */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {/* Left: Additional Filters */}
              <div className="flex items-center space-x-4">
                {/* Material Type Filter */}
                <select
                  value={filters.materialType}
                  onChange={(e) => handleFiltersChange({ ...filters, materialType: e.target.value })}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Materials</option>
                  <option value="cotton">Cotton</option>
                  <option value="silk">Silk</option>
                  <option value="linen">Linen</option>
                  <option value="polyester">Polyester</option>
                  <option value="wool">Wool</option>
                </select>

                {/* Price Range Filter */}
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => handleFiltersChange({ ...filters, minPrice: e.target.value })}
                    className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => handleFiltersChange({ ...filters, maxPrice: e.target.value })}
                    className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Right: Sort Controls */}
              <div className="flex items-center space-x-3">
                <label className="text-sm text-gray-700">Sort by:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFiltersChange({ ...filters, sortBy: e.target.value })}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="date">Upload Date</option>
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="quantity">Quantity</option>
                </select>
                
                <button
                  onClick={() => handleFiltersChange({ 
                    ...filters, 
                    sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
                  })}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 flex items-center"
                >
                  {filters.sortOrder === 'asc' ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                      Ascending
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                      </svg>
                      Descending
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Product List Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Product List</h1>
            <p className="text-gray-600 mt-1">Monthly</p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Products Table/Grid */}
          {!isLoading && !error && (
            <>
              {viewMode === VIEW_MODES.LIST ? (
                <div className="bg-white shadow-sm rounded-lg overflow-visible">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product Name
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price per yard
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <ProductTableRow
                          key={product.id || product._id}
                          product={product}
                          onClick={() => handleProductClick(product)}
                          onAction={handleProductAction}
                        />
                      ))}
                    </tbody>
                  </table>
                  </div>

                  {/* Empty State */}
                  {products.length === 0 && (
                    <div className="text-center py-12">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m-2 0v5a2 2 0 002 2h14a2 2 0 002-2v-5" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                      <p className="text-gray-500 mb-4">Get started by uploading your first product.</p>
                      <Link
                        to="/vendor/upload"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Product
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  data-testid="product-grid-container" // ✅ Add this
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
                  {/* Empty state for grid view */}
                  {products.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m-2 0v5a2 2 0 002 2h14a2 2 0 002-2v-5" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                      <p className="text-gray-500 mb-4">Get started by uploading your first product.</p>
                      <Link
                        to="/vendor/upload"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Product
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Pagination Controls */}
          {!isLoading && !error && paginationData && paginationData.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-200">
              {/* Left: Page info */}
              <div className="text-sm text-gray-700">
                Showing page {paginationData.currentPage} of {paginationData.totalPages}
                <span className="ml-2 text-gray-500">
                  ({totalCount} total products)
                </span>
              </div>

              {/* Right: Pagination buttons */}
              <div className="flex items-center space-x-2">
                {/* Previous button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!paginationData.hasPrevPage}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    paginationData.hasPrevPage
                      ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </div>
                </button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {(() => {
                    const pages = [];
                    const totalPages = paginationData.totalPages;
                    const current = paginationData.currentPage;
                    
                    // Always show first page
                    pages.push(1);
                    
                    // Show ellipsis if needed
                    if (current > 3) {
                      pages.push('...');
                    }
                    
                    // Show pages around current
                    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
                      pages.push(i);
                    }
                    
                    // Show ellipsis if needed
                    if (current < totalPages - 2) {
                      pages.push('...');
                    }
                    
                    // Always show last page if more than 1 page
                    if (totalPages > 1) {
                      pages.push(totalPages);
                    }
                    
                    return pages.map((page, index) => {
                      if (page === '...') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            page === current
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    });
                  })()}
                </div>

                {/* Next button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(paginationData.totalPages, prev + 1))}
                  disabled={!paginationData.hasNextPage}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    paginationData.hasNextPage
                      ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center">
                    Next
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restock Modal */}
      <RestockModal
        isOpen={showRestockModal}
        onClose={() => {
          setShowRestockModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onRestock={handleRestock}
      />
    </>
  );
};

// ✅ ProductTableRow component
const ProductTableRow = ({ product, onClick, onAction }) => {
  const [imageError, setImageError] = useState(false); // ✅ Now useState is available
  const productImage = getProductImage(product);
  const isActive = getProductStatus(product);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'; // ✅ Changed from fake date
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown'; // ✅ Handle invalid dates
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Unknown'; // ✅ Changed from fake date
    }
  };

  const formatPrice = (price) => {
    if (!price || price <= 0) return 'Not set'; // ✅ Changed from fake price
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
      {/* Product Image */}
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

      {/* ID - Right aligned */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
        #{product.id?.toString().slice(-4) || product._id?.toString().slice(-4) || '2490'}
      </td>

      {/* Quantity - Right aligned */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
        {product.quantity || 10} Pcs
      </td>

      {/* Date */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatDate(product.createdAt || product.date)}
      </td>

      {/* Price per yard - Right aligned */}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <span className="text-sm font-medium text-gray-900">
          {formatPrice(product.pricePerYard || product.price)}
        </span>
      </td>

      {/* Status */}
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
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
        <ProductActionDropdown
          product={product}
          onAction={onAction}
        />
      </td>
    </tr>
  );
};

// Keep only the default export
export default VendorProductListPage;