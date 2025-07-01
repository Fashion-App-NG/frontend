import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/Product/ProductCard';
import ProductFilters from '../components/Product/ProductFilters';
import { useAuth } from '../contexts/AuthContext';
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

// ✅ Enhanced helper function to get product image - MATCH ProductCard logic
const getProductImage = (product) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🖼️ Getting image for ${product.name}:`, {
      images: product.images,
      image: product.image,
      imageUrl: product.imageUrl,
      imageUrls: product.imageUrls
    });
  }

  // ✅ COPY the exact logic from ProductCard.jsx getImageSrc()
  
  // Handle base64 encoded images (from localStorage)
  if (product.image && product.image.startsWith('data:image/')) {
    return product.image;
  }
  
  // Handle API image URLs
  if (product.image && typeof product.image === 'string') {
    // If it's already a full URL, use it
    if (product.image.startsWith('http')) {
      return product.image;
    }
    // If it's a relative path, construct full URL
    if (product.image.startsWith('/')) {
      return `${process.env.REACT_APP_API_BASE_URL}${product.image}`;
    }
    // If it's just a filename, construct full path
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
  
  // Handle imageUrls array
  if (product.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
    const firstImage = product.imageUrls[0];
    if (typeof firstImage === 'string') {
      if (firstImage.startsWith('http') || firstImage.startsWith('data:')) {
        return firstImage;
      }
      return `${process.env.REACT_APP_API_BASE_URL}/uploads/${firstImage}`;
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

// ✅ ADD: Sort options constants (already suggested but ensure it's added)
const SORT_OPTIONS = {
  DATE: 'date',
  NAME: 'name',
  PRICE: 'price',
  QUANTITY: 'quantity'
};

const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc'
};

export const VendorProductListPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // ✅ Add view mode state with LIST as default for vendors
  const [viewMode, setViewMode] = useState(() => {
    // Check URL params for view preference
    const urlViewMode = searchParams.get('view');
    return urlViewMode === 'grid' ? 'grid' : 'list'; // Default to 'list' for vendors
  });

  // Initialize filters from URL params
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    materialType: searchParams.get('materialType') || '',
    pattern: searchParams.get('pattern') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || SORT_OPTIONS.DATE, // ✅ Use constant
    sortOrder: searchParams.get('sortOrder') || SORT_ORDER.DESC // ✅ Use constant
  }));

  // ENHANCED: Load vendor products using correct endpoint with debug logging
  const loadVendorProducts = useCallback(async (currentFilters) => {
    if (!user?.id) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ No user ID available for loading vendor products');
      }
      setError('Vendor ID not found. Please log in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Loading vendor products for vendor ID:', user.id);
      }
      
      // ✅ Use the vendor-specific endpoint from productService
      const response = await productService.getVendorProducts(user.id);
      
      if (response.error) {
        throw new Error(response.error);
      }

      let vendorProducts = response.products || [];
      
      // ✅ ENHANCED: Detailed product structure logging
      if (process.env.NODE_ENV === 'development') {
        console.log('📦 Raw vendor products count:', vendorProducts.length);
        
        if (vendorProducts.length > 0) {
          const sampleProduct = vendorProducts[0];
          console.log('🔍 Sample product structure:', {
            id: sampleProduct.id || sampleProduct._id,
            name: sampleProduct.name,
            status: sampleProduct.status,
            statusType: typeof sampleProduct.status,
            display: sampleProduct.display,
            displayType: typeof sampleProduct.display,
            images: sampleProduct.images,
            imagesType: typeof sampleProduct.images,
            imagesLength: sampleProduct.images?.length,
            imagesSample: sampleProduct.images?.[0],
            allImageFields: {
              images: sampleProduct.images,
              image: sampleProduct.image,
              imageUrl: sampleProduct.imageUrl,
              imageUrls: sampleProduct.imageUrls,
              productImages: sampleProduct.productImages
            },
            allStatusFields: {
              status: sampleProduct.status,
              display: sampleProduct.display,
              isActive: sampleProduct.isActive,
              active: sampleProduct.active,
              available: sampleProduct.available,
              visibility: sampleProduct.visibility
            },
            fullProduct: sampleProduct
          });
          
          // ✅ FIX: Limit detailed logging to first 5 products to improve performance
          const sampleSize = 5;
          console.log('📊 Sample products status/image summary (first 5):');
          vendorProducts.slice(0, sampleSize).forEach((product, index) => {
            console.log(`Sample Product ${index + 1}: ${product.name}`, {
              status: product.status,
              display: product.display,
              hasImages: !!(product.images?.length > 0),
              imageCount: product.images?.length || 0,
              firstImage: product.images?.[0]
            });
          });
          
          if (vendorProducts.length > sampleSize) {
            console.log(`... and ${vendorProducts.length - sampleSize} more products (details suppressed for performance)`);
          }
        }
      }

      // SORT BY UPLOAD DATE DESCENDING (newest first)
      vendorProducts.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.dateCreated || 0);
        const dateB = new Date(b.createdAt || b.dateCreated || 0);
        return dateB - dateA; // Descending order (newest first)
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('📅 Products sorted by upload date (newest first)');
      }

      // ✅ Apply client-side filtering since the API endpoint may not support all filters
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
      
      // ✅ Apply sorting
      if (currentFilters.sortBy && currentFilters.sortBy !== 'date') {
        vendorProducts.sort((a, b) => {
          let aVal = a[currentFilters.sortBy];
          let bVal = b[currentFilters.sortBy];
          
          // Handle different data types
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
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Products loaded and processed:', {
          total: vendorProducts.length,
          withImages: vendorProducts.filter(p => p.images?.length > 0).length,
          activeProducts: vendorProducts.filter(p => getProductStatus(p)).length
        });
      }
      
    } catch (error) {
      console.error('❌ Error loading vendor products:', error);
      setError(error.message || 'Failed to load products');
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleFiltersChange = useCallback((newFilters) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Filters changed:', newFilters);
    }
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

  useEffect(() => {
    if (user?.id) {
      loadVendorProducts(filters);
    }
  }, [user?.id, loadVendorProducts, filters]);

  // Redirect unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/login/vendor" replace />;
  }

  // Role-based access control
  if (user && user.role !== 'vendor') {
    if (user.role === 'shopper') {
      return <Navigate to="/shopper/dashboard" replace />;
    }
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // Handle authentication issues
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

  // ✅ FIXED: Return content only (no sidebar - let VendorLayout handle it)
  return (
    <div className="min-h-screen bg-[#d8dfe9]">
      {/* ✅ REMOVED: ml-[254px] since VendorLayout handles spacing */}
      <div className="w-full"> {/* ✅ CHANGED: from flex-1 ml-[254px] to w-full */}
        {/* Header */}
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
                  <>Showing {totalCount} of your product{totalCount !== 1 ? 's' : ''} (sorted by upload date)</>
                ) : (
                  'No products found'
                )}
              </p>
            </div>
            
            <div className="flex gap-3">
              {/* ✅ View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode(VIEW_MODES.LIST)} // ✅ Use constant
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === VIEW_MODES.LIST // ✅ Use constant
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode(VIEW_MODES.GRID)} // ✅ Use constant
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === VIEW_MODES.GRID // ✅ Use constant
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Grid
                </button>
              </div>

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

        {/* ✅ PRESERVED: Your amazing filters functionality */}
        <ProductFilters 
          onFiltersChange={handleFiltersChange}
          loading={loading}
        />

        {/* ✅ PRESERVED: Loading State */}
        {loading && (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6"
            : "space-y-4 mt-6"
          }>
            {[...Array(8)].map((_, index) => (
              <div key={index} className={viewMode === 'grid' 
                ? "bg-white rounded-lg shadow-sm border animate-pulse"
                : "bg-white rounded-lg shadow-sm border p-4 animate-pulse"
              }>
                <div className={viewMode === 'grid' 
                  ? "h-48 bg-gray-200 rounded-lg mb-4"
                  : "flex items-center space-x-4"
                }>
                  {viewMode === 'list' && <div className="w-16 h-16 bg-gray-200 rounded"></div>}
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ PRESERVED: Error State */}
        {error && !loading && (
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

        {/* ✅ PRESERVED: Your beautiful Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6"
            : "space-y-4 mt-6"
          }>
            {products.map((product) => (
              viewMode === 'grid' ? (
                <ProductCard
                  key={product.id || product._id}
                  product={product}
                  showVendorInfo={false}
                  className="relative group"
                />
              ) : (
                <ProductListItem key={product.id} product={product} />
              )
            ))}
          </div>
        )}

        {/* ✅ PRESERVED: Empty State with your smart filter/no-filter logic */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

// ✅ UPDATED: ProductListItem with better error handling
const ProductListItem = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const productImage = getProductImage(product);
  const isActive = getProductStatus(product);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📋 Rendering list item for ${product.name}:`, {
      hasImage: !!productImage,
      imageSource: productImage,
      isActive: isActive,
      statusCalculation: {
        originalStatus: product.status,
        originalDisplay: product.display,
        calculatedActive: isActive
      }
    });
  }

  const handleImageError = () => {
    setImageError(true);
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ Image failed to load for ${product.name}:`, productImage);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        {/* Enhanced Product Image with same logic as ProductCard */}
        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
          {!imageError && productImage ? (
            <img 
              src={productImage}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
            <span>₦{(product.pricePerYard || product.price)?.toLocaleString()}</span>
            <span>•</span>
            <span>{product.quantity} yards</span>
            {product.materialType && (
              <>
                <span>•</span>
                <span>{product.materialType}</span>
              </>
            )}
          </div>
        </div>

        {/* Enhanced Status & Actions */}
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
          
          {process.env.NODE_ENV === 'development' && (
            <span className="text-xs text-gray-400" title={`Status: ${product.status}, Display: ${product.display}`}>
              🔍
            </span>
          )}
          
          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ ADD: Default export to match App.jsx import
export default VendorProductListPage;