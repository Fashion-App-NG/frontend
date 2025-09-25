import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getPriceWithPlatformFee } from '../../utils/formatPrice';
import { ShopperProductActionDropdown } from './ShopperProductActionDropdown';

export const ShopperProductTableRow = ({ 
  product, 
  index, 
  onAction, 
  favorites, 
  isInCart, 
  onClick 
}) => {
  const [imageError, setImageError] = useState(false);

  // ✅ PRESERVE: Image handling with count badge logic
  const getProductImage = () => {
    if (imageError) return null;
    
    if (product.image && product.image.startsWith('data:image/')) {
      return product.image;
    }
    
    if (product.image && typeof product.image === 'string') {
      if (product.image.startsWith('http')) {
        return product.image;
      }
      if (product.image.startsWith('/')) {
        return `${process.env.REACT_APP_API_BASE_URL}${product.image}`;
      }
      return `${process.env.REACT_APP_API_BASE_URL}/uploads/${product.image}`;
    }
    
    if (product.image && typeof product.image === 'object' && product.image.url) {
      return product.image.url;
    }
    
    // ✅ PRESERVE: Images array handling with count badge logic
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
    
    return null;
  };

  // Update formatPrice to use getPriceWithPlatformFee
  const formatPrice = (product) => {
    if (!product) return 'Contact vendor';
    
    // Get price with platform fee
    const priceWithFee = getPriceWithPlatformFee(product);
    
    if (!priceWithFee || priceWithFee <= 0) return 'Contact vendor';
    
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(priceWithFee);
  };

  const getStatusBadge = () => {
    const quantity = product.quantity || 0;
    const isActive = product.display !== false && product.status !== 'INACTIVE';
    
    if (!isActive) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-800">
          <span className="w-2 h-2 rounded-full mr-1 bg-red-500"></span>
          Unavailable
        </span>
      );
    }
    
    if (quantity === 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-800">
          <span className="w-2 h-2 rounded-full mr-1 bg-red-500"></span>
          Out of Stock
        </span>
      );
    }
    
    if (quantity <= 10) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-800">
          <span className="w-2 h-2 rounded-full mr-1 bg-yellow-500"></span>
          Low Stock
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-800">
        <span className="w-2 h-2 rounded-full mr-1 bg-green-500"></span>
        In Stock
      </span>
    );
  };

  const productImage = getProductImage();
  const productId = product.id || product._id;
  const isFavorite = favorites?.has(productId);

  // ✅ DEBUG: Log vendor data
  console.log('🔍 Product vendor data:', {
    productName: product.name,
    vendor: product.vendor,
    vendorId: product.vendorId,
    createdBy: product.createdBy
  });

  return (
    <tr 
      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
      }`}
      onClick={() => onClick && onClick(product)}
    >
      {/* ✅ FIXED: Product Image + Name Column (Separate from description) */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center">
          {/* Product Image with Counter Badge */}
          <div className="flex-shrink-0 h-12 w-12 relative">
            {productImage ? (
              <>
                <img 
                  className="h-12 w-12 rounded-lg object-cover border border-gray-200" 
                  src={productImage}
                  alt={product.name}
                  onError={() => setImageError(true)}
                />
                {/* ✅ PRESERVED: Image Count Badge */}
                {product.images && product.images.length > 1 && (
                  <div className="absolute -top-1 -left-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold shadow-sm">
                    {product.images.length}
                  </div>
                )}
              </>
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center border border-gray-200">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Product Name Only */}
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
              <Link to={`/shopper/product/${productId}`} className="hover:underline">
                {product.name || 'Unnamed Product'}
              </Link>
            </div>
            <div className="text-xs text-gray-400">
              #{productId?.toString().slice(-6) || 'N/A'}
            </div>
          </div>
        </div>
      </td>

      {/* ✅ FIXED: Vendor Column - Enhanced vendor data extraction */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {/* Try multiple vendor data sources */}
          {product.vendor?.storeName || 
           product.vendor?.name || 
           product.vendor?.businessName ||
           product.vendorName ||
           product.createdBy?.name ||
           product.createdBy?.storeName ||
           'Unknown Vendor'}
        </div>
        {(product.vendor?.location || product.vendor?.city) && (
          <div className="text-xs text-gray-500">
            📍 {product.vendor.location || product.vendor.city}
          </div>
        )}
      </td>

      {/* ✅ FIXED: Description Column (Separate) */}
      <td className="px-4 py-3">
        <div className="text-sm text-gray-600 max-w-xs">
          {product.description ? (
            product.description.length > 60 
              ? `${product.description.substring(0, 60)}...`
              : product.description
          ) : (
            <span className="text-gray-400 italic">No description</span>
          )}
        </div>
      </td>

      {/* ✅ FIXED: Material Column */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {product.materialType || 'Not specified'}
        </div>
        {product.pattern && (
          <div className="text-xs text-gray-500">
            {product.pattern}
          </div>
        )}
      </td>

      {/* ✅ FIXED: Price Column */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm font-semibold text-blue-600">
          {formatPrice(product)}
          <span className="text-xs text-gray-500 ml-1">(incl. fees)</span>
        </div>
        <div className="text-xs text-gray-500">per yard</div>
      </td>

      {/* ✅ FIXED: Quantity Column */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {product.quantity || 0} yards
        </div>
        {product.quantity <= 10 && product.quantity > 0 && (
          <div className="text-xs text-amber-600 font-medium">
            Low stock!
          </div>
        )}
      </td>

      {/* ✅ FIXED: Status Column */}
      <td className="px-4 py-3 whitespace-nowrap">
        {getStatusBadge()}
      </td>

      {/* ✅ FIXED: Actions Column - Compact */}
      <td className="px-4 py-3 whitespace-nowrap text-right">
        <div className="flex items-center justify-end space-x-1">
          {/* Quick Add to Cart */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              
              // Log product data for debugging
              console.log('Adding product to cart with fee:', {
                basePrice: product.pricePerYard || product.price || 0,
                platformFee: product.platformFee?.amount || 0,
                totalWithFee: getPriceWithPlatformFee(product)
              });
              
              // Use the same product object but ensure price includes platform fee
              onAction && onAction(product, 'add_to_cart');
            }}
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
              isInCart
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
            title={isInCart ? 'View in Cart' : 'Add to Cart'}
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {isInCart ? 'In Cart' : 'Add'}
          </button>

          {/* Quick Favorite */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction && onAction(product, 'toggle_favorite');
            }}
            className={`inline-flex items-center p-1 rounded text-xs transition-colors ${
              isFavorite
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <svg className="w-3 h-3" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Action Dropdown */}
          <ShopperProductActionDropdown
            product={product}
            onAction={onAction}
            favorites={favorites}
            isInCart={isInCart}
          />
        </div>
      </td>
    </tr>
  );
};