import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // keep for isAuthenticated, toggleFavorite
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import productService from '../services/productService';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  console.log('[DEBUG] NODE_ENV:', process.env.NODE_ENV);

  useEffect(() => {
    if (!productId) {
      console.error('No productId in route params');
      return;
    }
    console.log('[DEBUG] About to fetch product from backend:', productId);

    const loadProduct = async () => {
      try {
        console.log('[DEBUG] Calling productService.getProductById with:', productId);
        const response = await productService.getProductById(productId);
        console.log('[DEBUG] ProductService response:', response);
        if (response.error) throw new Error(response.error);
        setProduct(response.product);
      } catch (error) {
        setError(error.message);
        console.error('[DEBUG] Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await addToCart({
        ...product,
        vendorId: product.vendorId || product.vendor?.id,
        quantity: quantity,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      alert('Please log in to add favorites');
      return;
    }

    const success = await toggleFavorite(product._id || product.id);
    if (success) {
      // Success feedback could be a toast notification
    }
  };

  // Debug: Log every time quantity changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG] Quantity state changed:', quantity);
    }
  }, [quantity]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <Link to="/shopper/browse" className="text-blue-600 hover:text-blue-800">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const isProductFavorited = isFavorite(product._id || product.id);
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map(img => img.url)
    : ['/images/default-product.jpg'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/shopper/browse" className="text-blue-600 hover:text-blue-800 font-medium">
                ← Products
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/shopper/browse" className="text-gray-700 hover:text-gray-900">
                Explore Products
              </Link>
              {isAuthenticated && (
                <Link to="/shopper/dashboard" className="text-gray-700 hover:text-gray-900">
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-yellow-50 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {process.env.NODE_ENV === 'development' && (
            <p className="text-sm">
              Path: product/{productId}/4dc0e608/70f0d4 |{' '}
              <Link to="/shopper/browse" className="text-blue-600">Layout files</Link> |{' '}
              <span>Show Guest Sidebar Tabs</span> |{' '}
              <span>User: Shopper</span> |{' '}
              <span>Auth: true</span>
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={e => {
                  if (!e.target.src.endsWith('/default-product.jpg')) {
                    e.target.src = '/images/default-product.jpg';
                  }
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-200 rounded-lg overflow-hidden ${selectedImage === index ? 'ring-2 ring-blue-500' : ''
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/default-product.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-2xl font-semibold text-blue-600 mb-4">
              ₦{product.pricePerYard?.toLocaleString()} <span className="text-sm text-gray-500">per yard</span>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <span className="text-sm font-medium text-gray-700">Description</span>
                <p className="text-gray-600">{product.description || product.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Material</span>
                  <p className="text-gray-900">{product.materialType || 'Tencel'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Pattern</span>
                  <p className="text-gray-900">{product.pattern || 'Paisley'}</p>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Available</span>
                <p className="text-gray-900">{product.quantity || 105} yards</p>
              </div>

              <p className="text-sm text-gray-600">
                Vendor: {product.vendorName || 'Fashion Store'}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity (yards)
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg w-32">
                <button
                  onClick={() => {
                    const newQty = Math.max(1, quantity - 1);
                    if (process.env.NODE_ENV === 'development') {
                      console.log('[DEBUG] Quantity decremented:', newQty);
                    }
                    setQuantity(newQty);
                  }}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.quantity || 105}
                  value={quantity}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 1);
                    if (process.env.NODE_ENV === 'development') {
                      console.log('[DEBUG] Quantity input changed:', val);
                    }
                    setQuantity(val);
                  }}
                  className="flex-1 text-center py-2 border-0 focus:ring-0"
                />
                <button
                  onClick={() => {
                    const newQty = Math.min((product.quantity || 105), quantity + 1);
                    if (process.env.NODE_ENV === 'development') {
                      console.log('[DEBUG] Quantity incremented:', newQty);
                    }
                    setQuantity(newQty);
                  }}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || isInCart(product._id || product.id)}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInCart(product._id || product.id) 
                  ? 'In Cart' 
                  : isAddingToCart 
                    ? 'Adding...' 
                    : 'Add to Cart'}
              </button>
              <button
                onClick={handleToggleFavorite}
                className={`p-3 rounded-lg border transition-colors ${isProductFavorited
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-red-600'
                  }`}
              >
                <svg className="w-6 h-6" fill={isProductFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;