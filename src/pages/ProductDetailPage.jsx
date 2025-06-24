import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import productService from '../services/productService';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Load product details
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);

      try {
        console.log('🔄 Loading product details for:', id);
        
        const response = await productService.getProduct(id);
        setProduct(response.product);
        
        console.log('✅ Product loaded:', response.product?.name);
        
      } catch (err) {
        console.error('❌ Failed to load product:', err);
        setError(err.message || 'Product not found');
        
        // If product not found, redirect after a delay
        if (err.message?.includes('not found')) {
          setTimeout(() => navigate('/products'), 3000);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            to="/products" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  // No product found
  if (!product) {
    return null;
  }

  const images = product.images || [];
  const hasMultipleImages = images.length > 1;
  const isVendorOwner = user?.role === 'vendor' && user?.id === product.vendorId;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link to="/products" className="text-blue-600 hover:text-blue-800">
                Products
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600 truncate">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={productService.getImageUrl(images[selectedImageIndex], '/api/placeholder/600/600')}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {hasMultipleImages && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 transition-colors ${
                      selectedImageIndex === index 
                        ? 'border-blue-500' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={productService.getImageUrl(image, '/api/placeholder/150/150')}
                      alt={`${product.name} - view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="text-2xl font-bold text-blue-600">
                  {productService.formatPrice(product.pricePerYard)}
                  <span className="text-lg font-normal text-gray-500">/yard</span>
                </div>
                
                {product.status && product.status !== 'available' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    {product.status}
                  </span>
                )}
              </div>

              {/* Material Type and Pattern */}
              <div className="flex items-center gap-2 mb-4">
                {product.materialType && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {product.materialType}
                  </span>
                )}
                {product.pattern && product.pattern !== 'solid' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {product.pattern}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Product Details */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Product ID</dt>
                  <dd className="text-sm text-gray-900">{product.idNumber || product.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Available Quantity</dt>
                  <dd className="text-sm text-gray-900">{product.quantity} yards</dd>
                </div>
                {product.materialType && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Material</dt>
                    <dd className="text-sm text-gray-900 capitalize">{product.materialType}</dd>
                  </div>
                )}
                {product.pattern && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Pattern</dt>
                    <dd className="text-sm text-gray-900 capitalize">{product.pattern}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Vendor Info */}
            {product.vendor && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Vendor</h3>
                <p className="text-gray-600">{product.vendor.storeName || product.vendor.name}</p>
              </div>
            )}

            {/* Actions */}
            {!isVendorOwner && (
              <div className="border-t border-gray-200 pt-6 space-y-4">
                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (yards)
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.quantity}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Total: {productService.formatPrice(product.pricePerYard * quantity)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => {
                      // TODO: Add to cart functionality
                      console.log('Add to cart:', { productId: product.id, quantity });
                    }}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Contact vendor functionality
                      console.log('Contact vendor for:', product.id);
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Contact Vendor
                  </button>
                </div>
              </div>
            )}

            {/* Vendor Actions */}
            {isVendorOwner && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => {
                      // TODO: Edit product functionality
                      navigate(`/vendor/products/edit/${product.id}`);
                    }}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Edit Product
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Hide product functionality
                      if (window.confirm('Are you sure you want to hide this product?')) {
                        console.log('Hide product:', product.id);
                      }
                    }}
                    className="flex-1 border border-red-300 text-red-700 px-6 py-3 rounded-lg hover:bg-red-50 transition-colors font-medium"
                  >
                    Hide Product
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;