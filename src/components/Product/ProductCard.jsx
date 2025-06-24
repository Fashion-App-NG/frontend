import { useState } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';

const ProductCard = ({ product, showVendorInfo = true, className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getDisplayImage = () => {
    if (imageError) return '/api/placeholder/300/200';
    
    // Get the first image or fallback
    const firstImage = product.images?.[0];
    return productService.getImageUrl(firstImage, '/api/placeholder/300/200');
  };

  const getSecondaryImage = () => {
    if (product.images && product.images.length > 1) {
      return productService.getImageUrl(product.images[1], null);
    }
    return null;
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg bg-gray-100">
          <img
            src={getDisplayImage()}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isHovered && getSecondaryImage() ? 'opacity-0' : 'opacity-100'
            }`}
            onError={handleImageError}
            loading="lazy"
          />
          
          {/* Secondary image on hover */}
          {getSecondaryImage() && (
            <img
              src={getSecondaryImage()}
              alt={`${product.name} - view 2`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
            />
          )}
          
          {/* Image count badge */}
          {product.images && product.images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              +{product.images.length - 1}
            </div>
          )}
          
          {/* Status badge */}
          {product.status && product.status !== 'available' && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {product.status}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Product Name */}
          <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          {/* Material Type & Pattern */}
          <div className="flex items-center gap-2 mb-2">
            {product.materialType && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                {product.materialType}
              </span>
            )}
            {product.pattern && product.pattern !== 'solid' && (
              <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-full">
                {product.pattern}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-semibold text-gray-900">
              {productService.formatPrice(product.pricePerYard)}
              <span className="text-sm font-normal text-gray-500">/yard</span>
            </div>
            
            {/* Quantity Available */}
            {product.quantity && (
              <div className="text-xs text-gray-500">
                {product.quantity} yards
              </div>
            )}
          </div>

          {/* Vendor Info */}
          {showVendorInfo && product.vendor && (
            <div className="text-xs text-gray-500">
              by {product.vendor.storeName || product.vendor.name}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;