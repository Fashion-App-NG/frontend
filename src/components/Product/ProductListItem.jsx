import { useState } from 'react';
import { formatPrice } from '../../utils/formatPrice';

const ProductListItem = ({ product, onClick }) => {
  const [imageError, setImageError] = useState(false);

  const productId = product._id || product.id;

  // Calculate display price from API data
  const calculateDisplayPrice = () => {
    const basePrice = product.pricePerYard || 0;
    const tax = product.taxAmount || 0;
    const platformFee = product.platformFee?.amount || 0;
    
    return basePrice + tax + platformFee;
  };

  const displayPrice = calculateDisplayPrice();
  const vatRate = product.taxRate || 0;

  const getDisplayImage = () => {
    if (imageError) return '/api/placeholder/80/80';
    
    if (product.images && product.images.length > 0) {
      return product.images[0].url || product.images[0].preview || '/api/placeholder/80/80';
    }
    
    return product.image || '/api/placeholder/80/80';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex gap-4">
        {/* Image section */}
        <div className="relative flex-shrink-0">
          <img 
            src={getDisplayImage()}
            alt={product.name || 'Product'}
            className="w-20 h-20 rounded-lg object-cover bg-gray-100"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
          
          {/* Image Count Badge */}
          {product.images && product.images.length > 1 && (
            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {product.images.length}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
          
          <div className="mb-3">
            <p className="text-xl font-bold text-blue-600">
              {formatPrice(displayPrice)}
              <span className="text-sm text-gray-500 font-normal ml-1">
                per yard
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Includes {vatRate > 0 ? `${(vatRate * 100).toFixed(1)}% VAT and` : ''} platform fees
            </p>
          </div>

          {/* Price breakdown - show on list view */}
          <div className="text-sm text-gray-600 mb-3 space-y-1">
            <div className="flex justify-between">
              <span>Base Price:</span>
              <span>{formatPrice(product.pricePerYard)}</span>
            </div>
            {product.taxAmount > 0 && (
              <div className="flex justify-between">
                <span>VAT ({(vatRate * 100).toFixed(1)}%):</span>
                <span>{formatPrice(product.taxAmount)}</span>
              </div>
            )}
            {product.platformFee?.amount > 0 && (
              <div className="flex justify-between">
                <span>Platform Fee:</span>
                <span>{formatPrice(product.platformFee.amount)}</span>
              </div>
            )}
          </div>

          {/* Rest of component */}
        </div>
      </div>
    </div>
  );
};

export default ProductListItem;