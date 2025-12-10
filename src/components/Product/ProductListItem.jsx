import { useState } from 'react';
import { formatPrice } from '../../utils/formatPrice';

const ProductListItem = ({ product }) => {
  const [imageError, setImageError] = useState(false);

  // Calculate display price from API data
  const calculateDisplayPrice = () => {
    const basePrice = product.pricePerYard || 0;
    const tax = product.taxAmount || 0;
    const platformFee = product.platformFee?.amount || 0;
    
    return basePrice + tax + platformFee;
  };

  const displayPrice = calculateDisplayPrice();

  const getDisplayImage = () => {
    if (imageError) return '/api/placeholder/80/80';
    
    if (product.images && product.images.length > 0) {
      return product.images[0].url || product.images[0].preview || '/api/placeholder/80/80';
    }
    
    return product.image || '/api/placeholder/80/80';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 sm:p-4">
      <div className="flex gap-3 sm:gap-4">
        {/* Image section */}
        <div className="relative flex-shrink-0">
          <img 
            src={getDisplayImage()}
            alt={product.name || 'Product'}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover bg-gray-100"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
          
          {/* Image Count Badge */}
          {product.images && product.images.length > 1 && (
            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-semibold text-[10px] sm:text-xs">
              {product.images.length}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="mb-2">
            <p className="text-base sm:text-xl font-bold text-blue-600">
              {formatPrice(displayPrice)}
              <span className="text-xs sm:text-sm text-gray-500 font-normal ml-1">
                per yard
              </span>
            </p>
          </div>

          {/* Compact info for mobile */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="truncate">{product.materialType || 'Material'}</span>
            {product.quantity && (
              <span className="ml-2 flex-shrink-0">{product.quantity} yds</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListItem;