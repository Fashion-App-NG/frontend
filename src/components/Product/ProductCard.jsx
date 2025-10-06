import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { formatPrice } from '../../utils/formatPrice';

const ProductCard = ({
  product,
  showVendorInfo = true,
  onClick,
  className = "",
  showFavoriteButton = true,
  showAddToCartButton = true
}) => {
  const [imageError, setImageError] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToCart, isInCart, isLoading, error } = useCart();
  const { isAuthenticated } = useAuth();

  const productId = product._id || product.id;
  const isProductFavorited = isFavorite?.(productId) || false;

  // Calculate display price from API data
  const calculateDisplayPrice = () => {
    const basePrice = product.pricePerYard || 0;
    const tax = product.taxAmount || 0;
    const platformFee = product.platformFee?.amount || 0;

    return basePrice + tax + platformFee;
  };

  const displayPrice = calculateDisplayPrice();
  const vatRate = product.taxRate || 0;

  const handleImageError = () => {
    setImageError(true);
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please log in to add favorites');
      return;
    }

    try {
      await toggleFavorite?.(productId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG] ProductCard handleAddToCart called with:', product);
    }
    addToCart({
      ...product,
      vendorId: product.vendorId || product.vendor?.id,
      quantity: 1,
    });
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

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

        {/* Favorite Button */}
        {showFavoriteButton && isAuthenticated && (
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${isProductFavorited
              ? 'bg-red-100 text-red-600'
              : 'bg-white/80 text-gray-600 hover:text-red-600'
              }`}
            aria-label={isProductFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className="w-5 h-5"
              fill={isProductFavorited ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        )}

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
          {formatPrice(displayPrice)}
          <span className="text-xs text-gray-500 font-normal">
            {' '}per yard (incl. {vatRate > 0 ? `${(vatRate * 100).toFixed(1)}% VAT &` : ''} fees)
          </span>
        </p>

        {/* Price breakdown */}
        <div className="text-xs text-gray-500 mb-2">
          <div>Base: {formatPrice(product.pricePerYard)}</div>
          {product.taxAmount > 0 && (
            <div>VAT ({(vatRate * 100).toFixed(1)}%): {formatPrice(product.taxAmount)}</div>
          )}
          {product.platformFee?.amount > 0 && (
            <div>Platform Fee: {formatPrice(product.platformFee.amount)}</div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>{product.materialType || 'Material'}</span>
          {product.quantity && (
            <span>{product.quantity} yards</span>
          )}
        </div>

        {/* Vendor Info */}
        {showVendorInfo && (
          <div className="flex items-center text-xs text-gray-600">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0a2 2 0 01-2 2H7a2 2 0 01-2-2m2-2h2m2 2h4" />
            </svg>
            <span>By: {product.vendorName || 'Fashion Store'}</span>
          </div>
        )}

        {/* Add to Cart button */}
        {showAddToCartButton && (
          <>
            {error && (
              <div className="bg-red-100 text-red-700 p-2 rounded mb-2 text-xs">
                {error}
              </div>
            )}
            <button
              onClick={handleAddToCart}
              disabled={isLoading || isInCart(product._id || product.id)}
              className={`mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors ${isInCart?.(product._id || product.id)
                ? 'bg-green-600 hover:bg-green-700'
                : ''
                }`}
            >
              {isInCart(product._id || product.id) ? 'In Cart' : isLoading ? 'Adding...' : 'Add to Cart'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;