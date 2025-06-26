import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProductCard = ({ product, showVendorInfo = false, className = '' }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);

  // ✅ FIXED: Generate context-aware product URLs
  const getProductUrl = () => {
    const productId = product.id || product._id;
    
    // Check current route context
    if (location.pathname.startsWith('/shopper/')) {
      return `/shopper/product/${productId}`;
    }
    
    if (location.pathname.startsWith('/vendor/')) {
      return `/vendor/product/${productId}`;
    }
    
    // Default to public route for guests or direct access
    return `/product/${productId}`;
  };

  const productUrl = getProductUrl();

  // ✅ Debug logging to verify URL generation
  console.log('🔗 ProductCard URL generation:', {
    productId: product.id || product._id,
    currentPath: location.pathname,
    generatedUrl: productUrl,
    userRole: user?.role || 'none'
  });

  const handleImageError = () => {
    setImageError(true);
  };

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

  return (
    <Link 
      to={productUrl}
      className={`group block bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      {/* Product Image */}
      <div className="aspect-[4/3] bg-gray-100 rounded-t-lg overflow-hidden relative">
        <img
          src={getImageSrc()}
          alt={product.name || 'Product'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={handleImageError}
        />
        
        {/* Status Badge */}
        {product.status && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium">
            {/* ✅ FIXED: Add debug logging to see actual status values */}
            {process.env.NODE_ENV === 'development' && console.log('🔍 Product status debug:', {
              productName: product.name,
              status: product.status,
              display: product.display,
              quantity: product.quantity,
              statusType: typeof product.status
            })}
            {product.status === 'In Stock' || 
             product.status === 'available' || 
             product.status === 'in_stock' ||
             (product.quantity && parseInt(product.quantity) > 0) ||
             product.display !== false ? (
              <span className="bg-green-100 text-green-800">In Stock</span>
            ) : (
              <span className="bg-red-100 text-red-800">Out of Stock</span>
            )}
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

        {/* Vendor Info - Only show when requested and available */}
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
      </div>
    </Link>
  );
};

export default ProductCard;