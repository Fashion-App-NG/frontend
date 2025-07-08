import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const ProductCard = ({ product, showVendorInfo = false, className = '', onClick, onAction, isInCart, favorites }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { isAddingToCart } = useCart();
  const [imageError, setImageError] = useState(false);

  // ✅ Generate context-aware product URLs
  const getProductUrl = () => {
    const productId = product.id || product._id;
    
    if (location.pathname.startsWith('/shopper/')) {
      return `/shopper/product/${productId}`;
    }
    
    if (location.pathname.startsWith('/vendor/')) {
      return `/vendor/product/${productId}`;
    }
    
    return `/product/${productId}`;
  };

  const productUrl = getProductUrl();

  // ✅ Debug logging to verify URL generation (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 ProductCard URL generation:', {
      productId: product.id || product._id,
      currentPath: location.pathname,
      generatedUrl: productUrl,
      userRole: user?.role || 'none'
    });
  }

  // Log environment variables and calculated base URL
  console.log('🔍 Environment check:', {
    REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    calculatedBaseURL: `${process.env.REACT_APP_API_BASE_URL}/api`
  });

  // ✅ FIXED: Improved image source logic to handle API data
  const getImageSrc = () => {
    if (imageError) {
      return '/api/placeholder/300/300';
    }
    
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
    
    return '/api/placeholder/300/300';
  };

  const formatPrice = (price) => {
    if (!price) return 'Price not available';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const productImage = getImageSrc();

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(product);
    }
  };

  // ✅ FIX: Proper add to cart handler using onAction
  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // ✅ DEBUG: Log product structure before adding to cart
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 ProductCard - Product data before add to cart:', {
        productId: product.id || product._id,
        name: product.name,
        vendorId: product.vendorId,
        vendor: product.vendor,
        createdBy: product.createdBy,
        allFields: Object.keys(product)
      });
    }
    
    if (onAction) {
      onAction(product, 'add_to_cart');
    }
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onAction) {
      onAction(product, 'toggle_favorite');
    }
  };

  return (
    <Link 
      to={productUrl}
      data-testid="product-card"
      className={`group block bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 ${className}`}
      onClick={handleClick}
    >
      {/* Product Image */}
      <div className="aspect-[4/3] bg-gray-100 rounded-t-lg overflow-hidden relative">
        {!imageError && productImage ? (
          <img 
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center bg-gray-200"
            data-testid="image-fallback"
          >
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        {product.status && (
          <div className="absolute top-2 right-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium shadow-sm ${
              product.status === 'ACTIVE' || 
              product.status === 'In Stock' || 
              product.status === 'available' || 
              product.status === 'in_stock' ||
              (product.quantity && parseInt(product.quantity) > 0) ||
              product.display !== false
                ? 'bg-white text-green-800 border border-gray-200'
                : product.status === 'Low in Stock'
                ? 'bg-white text-yellow-800 border border-gray-200'
                : 'bg-white text-red-800 border border-gray-200'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                product.status === 'ACTIVE' || 
                product.status === 'In Stock' || 
                product.status === 'available' || 
                product.status === 'in_stock' ||
                (product.quantity && parseInt(product.quantity) > 0) ||
                product.display !== false
                  ? 'bg-[#28b446]'
                  : product.status === 'Low in Stock'
                  ? 'bg-[#fbbb00]'
                  : 'bg-[#cd0000]'
              }`}></span>
              {product.status === 'ACTIVE' || 
               product.status === 'In Stock' || 
               product.status === 'available' || 
               product.status === 'in_stock' ||
               (product.quantity && parseInt(product.quantity) > 0) ||
               product.display !== false
                ? 'In Stock'
                : product.status === 'Low in Stock'
                ? 'Low in Stock'
                : 'Out Of Stock'
              }
            </span>
          </div>
        )}

        {/* Image Count Badge */}
        {product.images && product.images.length > 1 && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold shadow-sm">
            {product.images.length}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="mb-2">
          <span className="text-lg font-semibold text-blue-600">
            {formatPrice(product.pricePerYard || product.price)}
          </span>
          {product.pricePerYard && (
            <span className="text-sm text-gray-500 ml-1">per yard</span>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-1 text-sm text-gray-600">
          {product.materialType && (
            <div className="flex justify-between">
              <span>Material:</span>
              <span className="font-medium">{product.materialType}</span>
            </div>
          )}
          
          {product.quantity && (
            <div className="flex justify-between">
              <span>Available:</span>
              <span className="font-medium">{product.quantity} yards</span>
            </div>
          )}
        </div>

        {/* Vendor Info */}
        {showVendorInfo && product.vendor && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              By: <span className="font-medium">{product.vendor.storeName || product.vendor.name}</span>
            </p>
          </div>
        )}

        {/* Local Product Badge */}
        {product.isLocalProduct && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Recently Added
            </span>
          </div>
        )}

        {/* ✅ FIX: Action buttons for shoppers only */}
        {(!user || user.role === 'shopper') && onAction && (
          <div className="flex gap-2 mt-4">
            <button 
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                isInCart 
                  ? 'bg-green-600 text-white cursor-default'
                  : isAddingToCart
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isAddingToCart ? 'Adding...' : isInCart ? 'In Cart' : 'Add to Cart'}
            </button>
            
            <button 
              onClick={handleToggleFavorite}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                favorites?.has(product.id || product._id)
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={favorites?.has(product.id || product._id) ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <svg className="w-4 h-4" fill={favorites?.has(product.id || product._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;