import { useState } from 'react';

const VendorProductCard = ({
  product,
  showVendorInfo = true,
  onClick,
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);

  //const productId = product._id || product.id;

  const handleImageError = () => {
    setImageError(true);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  // Image logic (same as ProductCard, but no favorites)
  const getImageSrc = () => {
    if (imageError) {
      return '/images/default-product.jpg';
    }
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'object' && firstImage.url) {
        return firstImage.url;
      }
      if (typeof firstImage === 'string') {
        if (firstImage.startsWith('http')) {
          return firstImage;
        }
        return `${process.env.REACT_APP_API_BASE_URL || ''}${firstImage.startsWith('/') ? '' : '/'}${firstImage}`;
      }
    }
    if (product.image) {
      if (typeof product.image === 'object' && product.image.url) {
        return product.image.url;
      }
      if (typeof product.image === 'string') {
        if (product.image.startsWith('http') || product.image.startsWith('data:')) {
          return product.image;
        }
        return `${process.env.REACT_APP_API_BASE_URL || ''}${product.image.startsWith('/') ? '' : '/'}${product.image}`;
      }
    }
    return '/images/default-product.jpg';
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group ${className}`}
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-200">
        <img
          src={getImageSrc()}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />

        {/* Stock Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.quantity > 10
            ? 'bg-green-100 text-green-800'
            : product.quantity > 0
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
            }`}>
            {product.quantity > 10 ? 'In Stock' : product.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-lg font-bold text-blue-600 mb-2">
          ₦{(product.pricePerYard || product.price || 0).toLocaleString()}
          <span className="text-xs text-gray-500 font-normal"> per yard</span>
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>{product.materialType || 'Material'}</span>
          {product.quantity && (
            <span>{product.quantity} yards</span>
          )}
        </div>

        {/* Vendor Info - Only show if requested */}
        {showVendorInfo && (
          <div className="flex items-center text-xs text-gray-600">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0a2 2 0 01-2 2H7a2 2 0 01-2-2m2-2h2m2 2h4" />
            </svg>
            <span>By: {product.vendorName || 'Fashion Store'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProductCard;