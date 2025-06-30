import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import GuestSidebar from '../components/Common/GuestSidebar';
import { useAuth } from '../contexts/AuthContext';
import productService from '../services/productService';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // ✅ FIXED: Better layout detection using useLocation hook
  const isInAuthenticatedLayout = location.pathname.startsWith('/shopper/') || 
                                  location.pathname.startsWith('/vendor/');
  
  // ✅ FIXED: Only show guest sidebar for guest routes AND unauthenticated users
  const showGuestSidebar = !isInAuthenticatedLayout && !isAuthenticated;

  // Load product details
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('Product ID is required');
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 Loading product details for ID:', id);
        console.log('🔍 Current path:', location.pathname);
        console.log('🔍 Is in authenticated layout:', isInAuthenticatedLayout);
        console.log('🔍 Show guest sidebar:', showGuestSidebar);
        console.log('🔍 User:', user);
        console.log('🔍 Is authenticated:', isAuthenticated);
        
        const response = await productService.getProductById(id);
        
        if (response.product) {
          setProduct(response.product);
          console.log('✅ Product loaded:', response.product.name);
        } else {
          throw new Error('Product not found');
        }
      } catch (err) {
        console.error('❌ Failed to load product:', err);
        setError(err.message || 'Failed to load product details');
        
        if (err.message?.includes('not found')) {
          setTimeout(() => navigate('/browse'), 3000);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate, location.pathname, isInAuthenticatedLayout, showGuestSidebar, user, isAuthenticated]);

  const formatPrice = (price) => {
    if (!price) return 'Price not available';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const displayPrice = product ? formatPrice(product.pricePerYard || product.price) : '';

  // Main content JSX
  const productContent = (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Debug info - remove in production */}
      <div className="mb-4 p-2 bg-yellow-100 text-xs text-gray-600 rounded">
        Path: {location.pathname} | In Layout: {isInAuthenticatedLayout.toString()} | Show Guest Sidebar: {showGuestSidebar.toString()} | User: {user?.role || 'none'} | Auth: {isAuthenticated.toString()}
      </div>

      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/browse" className="text-gray-500 hover:text-gray-700">
              Products
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-900 font-medium">{product?.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={productService.getImageUrl(product?.images?.[selectedImageIndex] || product?.image)}
              alt={product?.name || 'Product'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/api/placeholder/600/600';
              }}
            />
          </div>

          {product?.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square bg-gray-100 rounded overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={productService.getImageUrl(image)}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/150/150';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product?.name}</h1>
            <p className="text-2xl font-semibold text-blue-600">{displayPrice}</p>
            {product?.pricePerYard && (
              <p className="text-sm text-gray-500">per yard</p>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {product?.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{product.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {product?.materialType && (
                <div>
                  <span className="block text-sm font-medium text-gray-600">Material</span>
                  <span className="text-gray-900">{product.materialType}</span>
                </div>
              )}
              {product?.pattern && (
                <div>
                  <span className="block text-sm font-medium text-gray-600">Pattern</span>
                  <span className="text-gray-900">{product.pattern}</span>
                </div>
              )}
              {product?.quantity && (
                <div>
                  <span className="block text-sm font-medium text-gray-600">Available</span>
                  <span className="text-gray-900">{product.quantity} yards</span>
                </div>
              )}
            </div>
          </div>

          {/* Quantity and Add to Cart - Only show for shoppers and guests */}
          {(!user || user.role === 'shopper') && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (yards)
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product?.quantity || 999}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center border border-gray-300 rounded-md py-2"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product?.quantity || 999, quantity + 1))}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                {isAuthenticated ? (
                  <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                    Add to Cart
                  </button>
                ) : (
                  <Link 
                    to="/login/shopper"
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center"
                  >
                    Login to Purchase
                  </Link>
                )}
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Vendor Actions - Only show for product owner */}
          {user?.role === 'vendor' && user?.id === product?.vendorId && (
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900">Vendor Actions</h3>
              <div className="flex space-x-4">
                <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  Edit Product
                </button>
                <button className="flex-1 border border-red-300 text-red-700 py-3 px-6 rounded-lg hover:bg-red-50 transition-colors font-semibold">
                  Hide Product
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    const loadingContent = (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );

    if (showGuestSidebar) {
      return (
        <div className="min-h-screen bg-gray-50 flex">
          <GuestSidebar />
          <div className="flex-1">
            {loadingContent}
          </div>
        </div>
      );
    }

    return loadingContent;
  }

  // Error state
  if (error) {
    const errorContent = (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            to="/browse" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );

    if (showGuestSidebar) {
      return (
        <div className="min-h-screen bg-gray-50 flex">
          <GuestSidebar />
          <div className="flex-1">
            {errorContent}
          </div>
        </div>
      );
    }

    return errorContent;
  }

  // ✅ FIXED: Conditional layout rendering
  if (showGuestSidebar) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <GuestSidebar />
        <div className="flex-1">
          <main>
            {productContent}
          </main>
        </div>
      </div>
    );
  }

  // ✅ FIXED: For authenticated users in layout context, return content only
  return productContent;
};

export default ProductDetailPage;