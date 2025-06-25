import { useState } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, showVendorInfo = true, className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // ✅ FIX: Better product ID extraction with fallbacks
  const getProductId = () => {
    return product?.id || product?._id || product?.productId || null;
  };

  const getDisplayImage = () => {
    if (imageError) {
      return '/api/placeholder/300/200';
    }
    
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      
      if (typeof firstImage === 'string') {
        if (firstImage.startsWith('http') || firstImage.startsWith('data:')) {
          return firstImage;
        }
        return `${process.env.REACT_APP_API_BASE_URL}/uploads/${firstImage}`;
      } else if (typeof firstImage === 'object' && firstImage.url) {
        return firstImage.url;
      }
    }
    
    if (product.image) {
      if (typeof product.image === 'string') {
        if (product.image.startsWith('http') || product.image.startsWith('data:')) {
          return product.image;
        }
        return `${process.env.REACT_APP_API_BASE_URL}/uploads/${product.image}`;
      } else if (typeof product.image === 'object' && product.image.url) {
        return product.image.url;
      }
    }
    
    return '/api/placeholder/300/200';
  };

  const getSecondaryImage = () => {
    if (product.images && product.images.length > 1) {
      const secondImage = product.images[1];
      
      if (typeof secondImage === 'string') {
        if (secondImage.startsWith('http') || secondImage.startsWith('data:')) {
          return secondImage;
        }
        return `${process.env.REACT_APP_API_BASE_URL}/uploads/${secondImage}`;
      } else if (typeof secondImage === 'object' && secondImage.url) {
        return secondImage.url;
      }
    }
    return null;
  };

  const formatPrice = (price) => {
    if (!price) return 'Price not available';
    const actualPrice = product.pricePerYard || product.price;
    return `₦${parseFloat(actualPrice || 0).toLocaleString()}`;
  };

  // ✅ DEBUG: Log product info for debugging
  const productId = getProductId();
  if (process.env.NODE_ENV === 'development' && !productId) {
    console.warn('🚨 ProductCard missing ID:', { 
      product: product,
      name: product?.name,
      hasId: !!product?.id,
      has_id: !!product?._id,
      hasProductId: !!product?.productId
    });
  }

  // ✅ FIX: Don't render Link if no valid product ID
  if (!productId) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-100 opacity-50 ${className}`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg bg-gray-100">
          <img
            src={getDisplayImage()}
            alt={product?.name || 'Product'}
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-full text-sm font-semibold">
              {formatPrice(product?.pricePerYard || product?.price)}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
            {product?.name || 'Unnamed Product'}
          </h3>
          <p className="text-sm text-red-500">No product ID available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${productId}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg bg-gray-100">
          <img
            src={getDisplayImage()}
            alt={product?.name || 'Product'}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isHovered && getSecondaryImage() ? 'opacity-0' : 'opacity-100'
            }`}
            onError={handleImageError}
            loading="lazy"
          />
          
          {getSecondaryImage() && (
            <img
              src={getSecondaryImage()}
              alt={`${product?.name || 'Product'} - alternate view`}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
              loading="lazy"
            />
          )}

          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-full text-sm font-semibold">
              {formatPrice(product?.pricePerYard || product?.price)}
            </span>
          </div>

          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                console.log('Add to favorites:', productId);
              }}
            >
              <svg className="w-4 h-4 text-gray-600 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
            {product?.name || 'Unnamed Product'}
          </h3>
          
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {product?.description || 'No description available'}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span>{product?.materialType || 'Material'}</span>
            <span>{product?.pattern || 'Pattern'}</span>
          </div>

          {showVendorInfo && (product?.vendorInfo || product?.vendor) && (
            <div className="flex items-center text-xs text-gray-600">
              <div className="w-4 h-4 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                <svg className="w-2 h-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="truncate">
                {product?.vendorInfo?.businessName || 
                 product?.vendorInfo?.email || 
                 product?.vendor?.storeName || 
                 product?.vendor?.name || 
                 'Vendor'}
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;