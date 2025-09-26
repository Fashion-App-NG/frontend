import { useCart } from '../../../contexts/CartContext';
import { formatPrice } from '../../../utils/formatPrice';
import { getProductImageUrl } from '../../../utils/productUtils';

const CartReviewStep = ({ onNext }) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Dev - [PAGE] CartReviewStep rendered');
  }
  const { cartItems, updateCartItemQuantity, removeFromCart } = useCart();

  // Calculate the correct line item total: (pricePerYard * quantity) + platformFeeAmount
  const getLineItemTotal = (item) => {
    const baseSubtotal = (item.pricePerYard || 0) * (item.quantity || 1);
    const platformFee = item.platformFeeAmount || 0;
    return baseSubtotal + platformFee;
  };

  // Get individual price per yard (without the platform fee)
  const getPricePerYard = (item) => {
    return item.pricePerYard || 0;
  };

  // Calculate total amount for all items
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + getLineItemTotal(item);
    }, 0);
  };

  // Add this function to calculate display price per yard
  const getDisplayPricePerYard = (item) => {
    const basePrice = item.pricePerYard || 0;
    // Add the platform fee divided by 1 (not the actual quantity)
    // This keeps the display price consistent regardless of quantity
    const platformFeePerYard = (item.platformFeeAmount || 0) / 1;
    return basePrice + platformFeePerYard;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Review Your Cart</h2>

      {cartItems.map((item, index) => {
        // Generate consistent item key and ID
        const itemKey = item.id || item.productId || `item-${index}`;
        const itemId = item.productId || item.id; // Use productId as primary identifier
        
        return (
          <div key={itemKey} className="flex items-center space-x-4 py-4 border-b border-gray-200">
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
              {item.vendorName && (
                <p className="text-sm text-gray-600">by {item.vendorName}</p>
              )}
              <p className="text-blue-600 font-semibold">
                {formatPrice(getDisplayPricePerYard(item))} per yard
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateCartItemQuantity(itemId, Math.max(1, (item.quantity || 1) - 1))}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                disabled={(item.quantity || 1) <= 1}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="font-medium w-8 text-center">{item.quantity || 1}</span>
              <button
                onClick={() => updateCartItemQuantity(itemId, (item.quantity || 1) + 1)}
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
                {formatPrice(getLineItemTotal(item))}
              </p>
              <button
                onClick={() => removeFromCart(itemId)}
                className="text-sm text-red-600 hover:text-red-700 mt-1"
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
      
      {/* Order Summary */}
      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-semibold">{formatPrice(calculateSubtotal())}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Shipping:</span>
          <span>Calculated at checkout</span>
        </div>
        <div className="flex items-center justify-between text-lg font-semibold border-t pt-2 mt-2">
          <span>Estimated Total:</span>
          <span className="text-xl">{formatPrice(calculateSubtotal())}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1 mb-4">
          Final total will include shipping costs based on delivery address.
        </p>
      </div>

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