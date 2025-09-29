import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useTax } from '../../contexts/TaxContext';
import { formatPrice, getPriceWithPlatformFee } from '../../utils/formatPrice';
import { getAllInclusivePricePerYard } from '../../utils/priceCalculations';

const ProductListItem = ({ product, showVendorInfo = true }) => {
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();
  const { taxRate } = useTax();

  const getDisplayImage = () => {
    if (imageError) return '/api/placeholder/80/80';
    
    if (product.images && product.images.length > 0) {
      return product.images[0].url || product.images[0].preview || '/api/placeholder/80/80';
    }
    
    return product.image || '/api/placeholder/80/80';
  };

  const getStatusColor = (status) => {
    if (status === 'In Stock' || status === 'ACTIVE' || status === true) return '#28b446';
    if (status === 'Low Stock') return '#f59e0b';
    return '#cd0000';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center p-4 gap-4">
        {/* Product Image */}
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
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Product Name & ID */}
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {product.name || 'Unnamed Product'}
              </h3>
              
              {product.idNumber && (
                <p className="text-xs text-gray-500 mb-1">ID: {product.idNumber}</p>
              )}
              
              {/* Description */}
              {product.description && (
                <p className="text-xs text-gray-600 truncate mb-2">
                  {product.description}
                </p>
              )}
              
              {/* Material & Pattern */}
              <div className="flex gap-2 mb-2">
                {product.materialType && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {product.materialType}
                  </span>
                )}
                {product.pattern && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {product.pattern}
                  </span>
                )}
              </div>
            </div>

            {/* Price & Actions */}
            <div className="flex flex-col items-end gap-2 ml-4">
              {/* Price */}
              <div className="text-right">
                <span className="text-lg font-semibold text-blue-600">
                  {formatPrice(getAllInclusivePricePerYard(product, taxRate))}
                  <span className="text-xs text-gray-500 ml-1">(includes platform fee)</span>
                </span>
                <span className="text-xs text-gray-500 block">per yard (incl. fees & tax)</span>
              </div>
              
              {/* Quantity */}
              {product.quantity && (
                <p className="text-xs text-gray-600">
                  {product.quantity} yards available
                </p>
              )}
              
              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  to={`/product/${product.id || product._id}`}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  View
                </Link>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('Debug - List View Add to Cart:', {
                      basePrice: product.pricePerYard || product.price,
                      platformFee: product.platformFee?.amount,
                      totalWithFee: getPriceWithPlatformFee(product)
                    });
                    
                    addToCart({
                      ...product,
                      vendorId: product.vendorId || product.vendor?.id,
                      quantity: 1
                    });
                  }}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Status & Vendor Info */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            {/* Status */}
            <div className="flex items-center">
              <div 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: getStatusColor(product.status) }}
              />
              <span className="text-xs font-medium text-gray-700">
                {product.status === true || product.status === 'ACTIVE' ? 'In Stock' : 
                 product.status === false ? 'Out of Stock' : 
                 product.status || 'Available'}
              </span>
            </div>

            {/* Vendor Info */}
            {showVendorInfo && product.vendor && (
              <div className="text-xs text-gray-500">
                by {product.vendor.storeName || product.vendor.name}
              </div>
            )}

            {/* Date */}
            {product.date && (
              <div className="text-xs text-gray-400">
                {product.date}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListItem;