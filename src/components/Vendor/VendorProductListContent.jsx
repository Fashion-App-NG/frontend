import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import vendorService from '../../services/vendorService';

export const VendorProductListContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ FIXED: Add user to dependency array
  const loadProducts = useCallback(async () => {
    if (!user?.id) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ No user ID available for loading products');
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const hasToken = localStorage.getItem('token');
      const hasUser = localStorage.getItem('user');

      if (process.env.NODE_ENV === 'development') {
        console.log('🔑 IMMEDIATE TOKEN CHECK:', {
          hasToken: !!hasToken,
          tokenLength: hasToken?.length || 0,
          tokenStart: hasToken?.substring(0, 30) || 'none',
          hasUserStorage: !!hasUser,
          userId: user?.id,
          userRole: user?.role
        });
      }

      if (!hasToken) {
        console.error('❌ No authentication token found');
        setError('Authentication required. Please log in again.');
        setTimeout(() => {
          navigate('/login/vendor');
        }, 2000);
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('🌐 About to call vendorService.getVendorProducts with:', {
          userId: user.id,
          hasToken: !!hasToken
        });
      }

      const response = await vendorService.getVendorProducts(user.id);
      
      if (response && response.products) {
        setProducts(response.products);
      } else {
        setProducts([]);
      }

    } catch (error) {
      console.error('❌ Failed to load vendor products:', {
        message: error.message,
        status: error.status,
        userId: user.id
      });
      
      if (error.message?.includes('Authentication failed') || error.message?.includes('401')) {
        setError('Your session has expired. Please log in again.');
        localStorage.clear();
        setTimeout(() => {
          navigate('/login/vendor');
        }, 2000);
      } else if (error.status === 403) {
        setError('You do not have permission to view these products.');
      } else if (error.status === 404) {
        setProducts([]);
        setError(null);
      } else {
        setError(`Failed to load products: ${error.message || 'Unknown error'}`);
      }
      
    } finally {
      setLoading(false);
    }
  }, [user, navigate]); // ✅ FIXED: Only user and navigate - user.id is redundant since user captures user.id changes

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (location.state?.productAdded) {
      localStorage.removeItem('vendorProducts');
    }
  }, [location.state]);

  // ✅ FIXED: Safe price rendering
  const ProductRow = ({ product, index }) => {
    const [imageError, setImageError] = useState(false);
    
    const handleImageError = (e) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Image failed to load for product:', product.name, 'src:', e.target.src);
      }
      setImageError(true);
    };

    const handleImageLoad = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Image loaded successfully for:', product.name);
      }
    };

    const getDisplayImage = () => {
      if (imageError) {
        return '/api/placeholder/86/66';
      }
      
      if (product.isLocalProduct && product.image && product.image.startsWith('data:image/')) {
        return product.image;
      }
      
      if (product.hasStorageIssue) {
        return '/api/placeholder/86/66';
      }
      
      return product.image || '/api/placeholder/86/66';
    };

    // ✅ FIXED: Safe price formatting
    const formatPrice = (price) => {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return '₦0';
      }
      return `₦${numPrice.toLocaleString()}`;
    };

    // ✅ FIXED: Generate safe product data
    const safeProduct = {
      id: product.id || `product-${index}`,
      name: product.name || 'Unnamed Product',
      description: product.description || 'No description',
      price: product.pricePerYard || product.price || 0,
      quantity: product.quantity || 0,
      date: product.createdAt ? new Date(product.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
      status: product.status || 'Available',
      statusColor: product.status === 'Out of Stock' ? '#cd0000' : '#28b446',
      materialType: product.materialType,
      hasStorageIssue: product.hasStorageIssue || false,
      imageCount: product.images?.length || 1,
      isLocalProduct: product.isLocalProduct || false
    };

    return (
      <div className="flex items-center py-4 border-b border-[#e8e8e8] last:border-b-0">
        <div className="flex items-center gap-[62px] flex-1">
          <div className="relative">
            <img 
              src={getDisplayImage()}
              alt={safeProduct.name}
              className="w-[86px] h-[66px] rounded-lg object-cover bg-gray-100"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            
            {safeProduct.hasStorageIssue && (
              <div className="absolute -top-1 -left-1 bg-yellow-500 text-white text-xs rounded px-1 font-semibold">
                !
              </div>
            )}
            
            {safeProduct.imageCount > 1 && (
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {safeProduct.imageCount}
              </div>
            )}
            
            {safeProduct.isLocalProduct && !safeProduct.hasStorageIssue && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs rounded px-1 font-semibold">
                NEW
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-[59px] flex-1">
            <div className="w-[101px]">
              <div className="font-medium text-[12px] leading-[150%]">{safeProduct.name}</div>
              <div className="font-medium text-[12px] leading-[150%] text-gray-600">{safeProduct.description}</div>
              {safeProduct.materialType && (
                <div className="text-[10px] text-blue-600 bg-blue-50 px-1 rounded mt-1">
                  {safeProduct.materialType}
                </div>
              )}
              {safeProduct.hasStorageIssue && (
                <div className="text-[10px] text-yellow-600 bg-yellow-50 px-1 rounded mt-1">
                  Limited storage
                </div>
              )}
            </div>

            <div className="flex items-center gap-[44px]">
              <div className="w-[163px] flex justify-between">
                <span className="font-medium text-[12px] leading-[150%]">{safeProduct.id}</span>
                <span className="font-medium text-[12px] leading-[150%] w-[57px]">{safeProduct.quantity} Pcs</span>
              </div>

              <div className="flex items-center gap-[28px]">
                <span className="font-medium text-[12px] leading-[150%] w-[75px]">{safeProduct.date}</span>
                <div className="flex items-center">
                  <span className="font-medium text-[12px] leading-[150%] text-[#111]">
                    {formatPrice(safeProduct.price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-[30px]">
          <div className="flex items-center bg-white rounded-lg px-3 py-1 shadow-sm">
            <div 
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: safeProduct.statusColor }}
            />
            <span className="text-[12px] font-medium leading-[150%]">{safeProduct.status}</span>
          </div>
          
          <button className="w-6 h-6 flex items-center justify-center">
            <div className="flex flex-col gap-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full" />
              <div className="w-1 h-1 bg-gray-400 rounded-full" />
              <div className="w-1 h-1 bg-gray-400 rounded-full" />
            </div>
          </button>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#d8dfe9]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2e2e2e] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 ml-[254px]"> {/* ✅ REMOVED: min-h-screen bg-[#d8dfe9] wrapper and header duplication */}
      {/* ✅ REMOVED: Duplicate header - let global header handle this */}
      
      {/* Success/Error Messages */}
      {location.state?.message && (
        <div className={`mx-6 mt-4 p-4 rounded-md ${
          location.state.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : location.state.type === 'warning'
            ? 'bg-yellow-100 border border-yellow-400 text-yellow-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {location.state.message}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">⚠️</div>
            <div>
              <p className="font-semibold">Failed to load products</p>
              <p className="text-sm">{error}</p>
              <button 
                onClick={loadProducts}
                className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[24px] font-bold text-black leading-[150%]">
            My Products
          </h2>
          
          <div className="flex gap-3">
            <Link
              to="/vendor/upload"
              className="px-4 py-3 bg-[#2e2e2e] text-[#edff8c] rounded-[5px] font-semibold hover:bg-[#1a1a1a] transition-colors"
            >
              Add Product
            </Link>
            <Link
              to="/vendor/bulk-upload"
              className="px-4 py-3 bg-[#22c55e] text-white rounded-[5px] font-semibold hover:bg-[#16a34a] transition-colors"
            >
              Bulk Upload
            </Link>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-[#f9f9f9] rounded-[10px] p-6">
          {/* ✅ PRESERVED: All existing product list functionality */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">Start by adding your first product to the catalog</p>
              <Link
                to="/vendor/upload"
                className="inline-flex items-center px-4 py-2 bg-[#2e2e2e] text-[#edff8c] rounded-[5px] font-semibold hover:bg-[#1a1a1a] transition-colors"
              >
                Add Product
              </Link>
            </div>
          ) : (
            <>
              {/* Header Row */}
              <div className="flex items-center py-3 border-b border-[#e8e8e8] text-[#666] text-[12px] font-semibold">
                <div className="flex-1 flex items-center gap-[62px]">
                  <div className="w-[86px]">Image</div>
                  <div className="flex items-center gap-[59px] flex-1">
                    <div className="w-[101px]">Product Name</div>
                    <div className="flex items-center gap-[44px]">
                      <div className="w-[163px] flex justify-between">
                        <span>ID</span>
                        <span>Quantity</span>
                      </div>
                      <div className="flex items-center gap-[28px]">
                        <span className="w-[75px]">Date</span>
                        <span>Price</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-[30px]">
                  <span>Status</span>
                  <span className="w-6">Actions</span>
                </div>
              </div>

              {/* Product Rows */}
              {products.map((product, index) => (
                <ProductRow key={product.id || index} product={product} index={index} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProductListContent;