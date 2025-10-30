import { useState } from 'react';
import { useCart } from '../../../contexts/CartContext';
import { formatPrice } from '../../../utils/formatPrice';
import { getProductImageUrl } from '../../../utils/productUtils';

const CartReviewStep = ({ onNext }) => {
  const { cartItems, updateCartItemQuantity } = useCart();
  const [shippingCost] = useState(0);

  // ✅ Use API values only - NO recalculation
  const getAllInclusivePricePerYard = (item) => {
    const basePrice = item.pricePerYard || 0;
    const taxPerYard = (item.taxAmount || 0) / (item.quantity || 1);  // ✅ Divide by quantity!
    const platformFeePerYard = (item.platformFeeAmount || 0) / (item.quantity || 1);
    return basePrice + taxPerYard + platformFeePerYard;
  };

  const getAllInclusiveLineItemTotal = (item) => {
    const quantity = item.quantity || 1;
    return getAllInclusivePricePerYard(item) * quantity;
  };

  const getAllInclusiveSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + getAllInclusiveLineItemTotal(item), 0);
  };

  // ✅ Get tax rate directly from API
  const taxRate = cartItems[0]?.taxRate || 0.02;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Review Cart</h2>

      {cartItems.map((item, index) => {
        const itemKey = item.id || item.productId || `item-${index}`;
        const itemId = item.productId || item.id;

        return (
          <div key={itemKey} className="flex items-center py-4 border-b">
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
            <div className="flex-1 ml-4">
              <h3 className="font-medium">{item.name}</h3>
              {item.vendorName && (
                <p className="text-sm text-gray-600">by {item.vendorName}</p>
              )}
              <p className="text-blue-600 font-semibold">
                {formatPrice(getAllInclusivePricePerYard(item))} per yard
                <span className="text-xs text-gray-500 ml-1">(incl. fees & tax)</span>
                × {item.quantity} yards
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

            {/* Line item total */}
            <div className="font-medium">
              {formatPrice(getAllInclusiveLineItemTotal(item))}
            </div>
          </div>
        );
      })}

      {/* Summary totals */}
      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Subtotal (incl. fees & tax):</span>
          <span className="font-semibold">{formatPrice(getAllInclusiveSubtotal())}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Shipping:</span>
          <span className="font-semibold">{formatPrice(shippingCost || 0)}</span>
        </div>
        <div className="flex justify-between mt-4 text-lg font-bold">
          <span>Total:</span>
          <span className="text-blue-600">{formatPrice(getAllInclusiveSubtotal() + (shippingCost || 0))}</span>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          * VAT ({Math.round(taxRate * 100)}%) is calculated on product price only. Platform fees are not taxed.
        </div>
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