import { useCart } from '../../../contexts/CartContext';
import { getProductImageUrl } from '../../../utils/productUtils';

const CartReviewStep = ({ onNext, sessionData }) => {
  const { cartItems, updateCartItemQuantity, removeFromCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Review Your Cart</h2>
      
      {cartItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-4 py-4 border-b border-gray-200">
          {/* Product Image */}
          <div className="flex-shrink-0 w-16 h-16">
            {item.image ? (
              <img
                src={getProductImageUrl(item)}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
                onError={e => { e.target.src = '/images/default-product.jpg'; }}
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{item.name}</h3>
            {item.vendor && (
              <p className="text-sm text-gray-600">by {item.vendor.storeName || item.vendor.name}</p>
            )}
            <p className="text-sm text-blue-600">{formatPrice(item.pricePerYard || item.price)} per yard</p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateCartItemQuantity(item.productId || item.id, (item.quantity || 1) - 1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="font-medium w-8 text-center">{item.quantity || 1}</span>
            <button
              onClick={() => updateCartItemQuantity(item.productId || item.id, (item.quantity || 1) + 1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Subtotal */}
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              {formatPrice((item.pricePerYard || item.price || 0) * (item.quantity || 1))}
            </p>
            <button
              onClick={() => removeFromCart(item.productId || item.id)}
              className="text-sm text-red-600 hover:text-red-700 mt-1"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue to Shipping
        </button>
      </div>
    </div>
  );
};

export default CartReviewStep;