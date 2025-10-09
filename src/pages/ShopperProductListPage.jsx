import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/Product/ProductCard';
import ProductViewToggle from '../components/Product/ProductViewToggle';
import { ShopperProductTableRow } from '../components/Shopper/ShopperProductTableRow';
import { useCart } from '../contexts/CartContext';
import useDebounce from '../hooks/useDebounce';
import productService from '../services/productService';

// ✅ Enhanced helper function to get product image (preserves image count logic)
const getProductImage = (product) => {
  if (product.image && product.image.startsWith('data:image/')) {
    return product.image;
  }
  
  if (product.image && typeof product.image === 'string') {
    if (product.image.startsWith('http')) {
      return product.image;
    }
    if (product.image.startsWith('/')) {
      return `${process.env.REACT_APP_API_BASE_URL}${product.image}`;
    }
    return `${process.env.REACT_APP_API_BASE_URL}/uploads/${product.image}`;
  }
  
  if (product.image && typeof product.image === 'object' && product.image.url) {
    return product.image.url;
  }
  
  // ✅ PRESERVE: Image array handling with count badge logic
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

// ✅ Filter constants for shoppers
const FILTER_TABS = {
  ALL: 'all',
  IN_STOCK: 'in_stock',
  FAVORITES: 'favorites'
};

// ✅ View modes
const VIEW_MODES = {
  LIST: 'list',
  GRID: 'grid'
};

// ✅ Enhanced ShopperProductListPage
export const ShopperProductListPage = () => {
  const { addToCart, isInCart, cartCount } = useCart(); // ✅ Add cartCount here
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // ✅ State variables
  const [products, setProducts] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  
  // ✅ Filter tab state
  const [activeFilterTab, setActiveFilterTab] = useState(FILTER_TABS.ALL);
  
  // ✅ View mode state (preserved from vendor implementation)
  const [viewMode, setViewMode] = useState(() => {
    const savedView = localStorage.getItem('shopperProductView');
    const urlViewMode = searchParams.get('view');
    return urlViewMode === 'list' ? VIEW_MODES.LIST : savedView === 'list' ? VIEW_MODES.LIST : VIEW_MODES.GRID;
  });
  
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
  const debouncedFilters = useDebounce(filters, 400);

  // ✅ Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // ✅ Load products with enhanced filtering for shoppers
  const loadShopperProducts = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);

    try {
      // ✅ ADD: Include pagination parameters
      const response = await productService.getAllProducts({
        ...currentFilters,
        page: pagination.currentPage,
        limit: 20
      });
      
      if (response.error) {
        throw new Error(response.error);
      }

      let shopperProducts = response.products || [];
      
      // ✅ UPDATE: Store pagination from API response
      if (response.pagination) {
        setPagination(response.pagination);
      }
      
      // Filter out inactive products for shoppers
      shopperProducts = shopperProducts.filter(product => 
        product.display !== false && 
        product.status !== 'INACTIVE' &&
        (product.quantity === undefined || product.quantity > 0)
      );
      
      // ✅ Apply client-side filtering (search, material, vendor, price)
      if (currentFilters.search && currentFilters.search.trim()) {
        const searchTerm = currentFilters.search.toLowerCase();
        shopperProducts = shopperProducts.filter(product => 
          product.name?.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          product.materialType?.toLowerCase().includes(searchTerm) ||
          product.vendor?.storeName?.toLowerCase().includes(searchTerm)
        );
      }

      if (currentFilters.materialType) {
        shopperProducts = shopperProducts.filter(product => 
          product.materialType?.toLowerCase() === currentFilters.materialType.toLowerCase()
        );
      }

      if (currentFilters.vendor) {
        shopperProducts = shopperProducts.filter(product => 
          product.vendor?.storeName?.toLowerCase().includes(currentFilters.vendor.toLowerCase()) ||
          product.vendor?.name?.toLowerCase().includes(currentFilters.vendor.toLowerCase())
        );
      }

      if (currentFilters.minPrice) {
        const minPrice = parseFloat(currentFilters.minPrice);
        shopperProducts = shopperProducts.filter(product => 
          (product.pricePerYard || product.price || 0) >= minPrice
        );
      }

      if (currentFilters.maxPrice) {
        const maxPrice = parseFloat(currentFilters.maxPrice);
        shopperProducts = shopperProducts.filter(product => 
          (product.pricePerYard || product.price || 0) <= maxPrice
        );
      }
      
      // Filter by status based on active tab
      if (activeFilterTab === FILTER_TABS.IN_STOCK) {
        shopperProducts = shopperProducts.filter(product => 
          product.quantity && product.quantity > 0
        );
      } else if (activeFilterTab === FILTER_TABS.FAVORITES) {
        shopperProducts = shopperProducts.filter(product => 
          favorites.has(product.id || product._id)
        );
      }
      
      // Apply sorting
      shopperProducts.sort((a, b) => {
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
          case 'vendor':
            aValue = a.vendor?.storeName || a.vendor?.name || '';
            bValue = b.vendor?.storeName || b.vendor?.name || '';
            break;
          case 'rating':
            aValue = a.rating || 0;
            bValue = b.rating || 0;
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
      
      setProducts(shopperProducts);
      
    } catch (error) {
      console.error('❌ Error loading products:', error);
      setError(error.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilterTab, favorites, pagination.currentPage]); // ✅ ADD pagination.currentPage dependency

  // ✅ Filter counts for shoppers
  const getFilterCounts = () => {
    const all = products.length;
    const inStock = products.filter(p => p.quantity && p.quantity > 0).length;
    const favoriteCount = products.filter(p => favorites.has(p.id || p._id)).length;
    
    return { all, inStock, favorites: favoriteCount };
  };

  // ✅ Handle filter changes
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value.toString().trim()) {
        params.set(key, value);
      }
    });
    
    setSearchParams(params);
  }, [setSearchParams]);

  // ✅ Handle view mode change (preserved functionality)
  const handleViewModeChange = useCallback((newViewMode) => {
    setViewMode(newViewMode);
    localStorage.setItem('shopperProductView', newViewMode);
    
    const params = new URLSearchParams(searchParams);
    if (newViewMode !== VIEW_MODES.GRID) {
      params.set('view', newViewMode);
    } else {
      params.delete('view');
    }
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  // ✅ Filter tab handler
  const handleFilterTabChange = useCallback((tab) => {
    setActiveFilterTab(tab);
    setTimeout(() => loadShopperProducts(filters), 0);
  }, [loadShopperProducts, filters]);

  // ✅ Product navigation
  const handleProductClick = (product) => {
    const id = product.id || product._id;
    if (!id) {
      console.error('Product ID missing for navigation:', product);
      return;
    }
    navigate(`/shopper/product/${id}`);
  };

  // ✅ Shopper-specific actions
  const handleProductAction = useCallback((product, action) => {
    const productId = product.id || product._id;
    if (!productId) {
      console.error('Product ID is missing for action:', action, product);
      return;
    }
    
    switch (action) {
      case 'add_to_cart':
        // Use getPriceWithPlatformFee for consistent pricing in both views
        addToCart({
          id: productId,
          name: product.name,
          price: product.pricePerYard || product.price,
          pricePerYard: product.pricePerYard || product.price, 
          platformFee: product.platformFee, // Include the entire platformFee object
          image: getProductImage(product),
          vendor: product.vendor,
          vendorId: product.vendorId || product.vendor?.id,
          vendorName: product.vendorName || product.vendor?.storeName || product.vendor?.name,
          quantity: 1
        });
        break;
      case 'toggle_favorite':
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          if (newFavorites.has(productId)) {
            newFavorites.delete(productId);
          } else {
            newFavorites.add(productId);
          }
          return newFavorites;
        });
        break;
      case 'view_vendor':
        navigate(`/vendor/${product.vendor?.id || product.vendorId}`);
        break;
      default:
        break;
    }
  }, [addToCart, navigate]);

  // ✅ EXISTING: Debounced filters effect
  useEffect(() => {
    loadShopperProducts(debouncedFilters);
  }, [debouncedFilters, loadShopperProducts]);

  // ✅ ADD: Separate effect for pagination changes
  useEffect(() => {
    // Only refetch when currentPage changes (not on initial mount with debouncedFilters)
    if (pagination.currentPage > 1) {
      loadShopperProducts(filters);
    }
  }, [pagination.currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const filterCounts = getFilterCounts();

  return (
    <div className="bg-[#d8dfe9] min-h-screen" data-testid="shopper-product-page">
      {/* Header */}
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
                  placeholder="Search products, vendors..."
                  value={filters.search}
                  onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
                />
              </div>
            </div>

            {/* Right: Shopping Actions */}
            <div className="flex items-center space-x-3 ml-4">
              <Link 
                to="/shopper/cart"
                className="relative px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                Cart
                {/* ✅ ADD: Cart count badge */}
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              <Link 
                to="/shopper/favorites"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Favorites
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
                [FILTER_TABS.IN_STOCK]: { label: 'In Stock', count: filterCounts.inStock },
                [FILTER_TABS.FAVORITES]: { label: 'Favorites', count: filterCounts.favorites }
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
              defaultView={VIEW_MODES.GRID}
              className="ml-4"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Sorting and Filtering */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left: Filters */}
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

              {/* Vendor Filter */}
              <input
                type="text"
                placeholder="Filter by vendor"
                value={filters.vendor}
                onChange={(e) => handleFiltersChange({ ...filters, vendor: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />

              {/* Price Range */}
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min ₦"
                  value={filters.minPrice}
                  onChange={(e) => handleFiltersChange({ ...filters, minPrice: e.target.value })}
                  className="w-20 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max ₦"
                  value={filters.maxPrice}
                  onChange={(e) => handleFiltersChange({ ...filters, maxPrice: e.target.value })}
                  className="w-20 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                <option value="date">Newest</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="vendor">Vendor</option>
                <option value="rating">Rating</option>
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
          <h1 className="text-2xl font-semibold text-gray-900">Browse Products</h1>
          <p className="text-gray-600 mt-1">
            {!isLoading && products.length > 0 ? (
              <>
                Showing {products.length} of {pagination.totalCount} products
                {pagination.totalPages > 1 && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
              </>
            ) : !isLoading ? (
              'No products found'
            ) : (
              'Loading products...'
            )}
          </p>
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

        {/* Products Display */}
        {!isLoading && !error && (
          <>
            {viewMode === VIEW_MODES.LIST ? (
              // ✅ TABLE LAYOUT - Similar to vendor but shopper-optimized
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Material
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price/Yard
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Available
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product, index) => (
                      <ShopperProductTableRow 
                        key={product.id || product._id}
                        product={product}
                        index={index}
                        onAction={handleProductAction}
                        favorites={favorites}
                        isInCart={isInCart(product.id || product._id)}
                        onClick={() => handleProductClick(product)}
                      />
                    ))}
                  </tbody>
                </table>

                {/* Empty state for table */}
                {products.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m-2 0v5a2 2 0 002 2h14a2 2 0 002-2v-5" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your filters or search terms.</p>
                    <button
                      onClick={() => {
                        setFilters({
                          search: '',
                          materialType: '',
                          pattern: '',
                          vendor: '',
                          minPrice: '',
                          maxPrice: '',
                          sortBy: 'date',
                          sortOrder: 'desc'
                        });
                        setActiveFilterTab(FILTER_TABS.ALL);
                      }}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // ✅ GRID LAYOUT - Keep existing grid implementation
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id || product._id}
                    product={product}
                    showVendorInfo={true}
                    className="relative group cursor-pointer"
                    onClick={() => handleProductClick(product)}
                    onAction={handleProductAction}
                    favorites={favorites}
                    isInCart={isInCart(product.id || product._id)}
                  />
                ))}

                {/* Empty state for grid */}
                {products.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m-2 0v5a2 2 0 002 2h14a2 2 0 002-2v-5" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your filters or search terms.</p>
                    <button
                      onClick={() => {
                        setFilters({
                          search: '',
                          materialType: '',
                          pattern: '',
                          vendor: '',
                          minPrice: '',
                          maxPrice: '',
                          sortBy: 'date',
                          sortOrder: 'desc'
                        });
                        setActiveFilterTab(FILTER_TABS.ALL);
                      }}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Pagination Controls */}
        {!isLoading && !error && products.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => {
                  const newPage = pagination.currentPage - 1;
                  setPagination(prev => ({ ...prev, currentPage: newPage }));
                }}
                disabled={!pagination.hasPrevPage}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  const newPage = pagination.currentPage + 1;
                  setPagination(prev => ({ ...prev, currentPage: newPage }));
                }}
                disabled={!pagination.hasNextPage}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span>
                  {' '}({pagination.totalCount} total products)
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => {
                      const newPage = pagination.currentPage - 1;
                      setPagination(prev => ({ ...prev, currentPage: newPage }));
                    }}
                    disabled={!pagination.hasPrevPage}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => {
                      const newPage = pagination.currentPage + 1;
                      setPagination(prev => ({ ...prev, currentPage: newPage }));
                    }}
                    disabled={!pagination.hasNextPage}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopperProductListPage;