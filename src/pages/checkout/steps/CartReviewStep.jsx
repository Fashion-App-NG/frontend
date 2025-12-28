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
    const taxPerYard = (item.taxAmount || 0) / (item.quantity || 1);
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

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Review Cart</h2>

        <div className="space-y-4 sm:space-y-6">
          {cartItems.map((item, index) => {
            const itemKey = item.id || item.productId || `item-${index}`;
            const itemId = item.productId || item.id;

            return (
              <div key={itemKey} className="flex gap-3 sm:gap-4 py-4 border-b border-gray-200 last:border-b-0">
                {/* Product Image */}
                <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
                  {item.image ? (
                    <img
                      src={getProductImageUrl(item)}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={e => { e.target.src = '/images/default-product.jpg'; }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                    {item.vendorName && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-0.5">by {item.vendorName}</p>
                    )}
                  </div>

                  {/* Price per yard */}
                  <p className="text-sm sm:text-base font-bold text-blue-600 mb-3">
                    {formatPrice(getAllInclusivePricePerYard(item))}
                    <span className="text-xs sm:text-sm font-normal text-gray-500 ml-1">per yard</span>
                    <span className="text-xs text-gray-500 ml-1">× {item.quantity} {item.quantity === 1 ? 'yard' : 'yards'}</span>
                  </p>

                  {/* Quantity controls and subtotal */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                      <button
                        onClick={() => updateCartItemQuantity(itemId, Math.max(1, (item.quantity || 1) - 1))}
                        disabled={(item.quantity || 1) <= 1}
                        className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      
                      <span className="px-3 sm:px-4 py-1.5 text-sm sm:text-base text-gray-900 font-medium min-w-[2rem] text-center">
                        {item.quantity || 1}
                      </span>
                      
                      <button
                        onClick={() => updateCartItemQuantity(itemId, (item.quantity || 1) + 1)}
                        className="p-2 text-gray-600 hover:text-gray-800"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>

                    {/* Line item total */}
                    <div className="flex items-center justify-between sm:justify-end">
                      <span className="text-xs text-gray-500 sm:hidden">Subtotal:</span>
                      <span className="text-base sm:text-lg font-bold text-gray-900">
                        {formatPrice(getAllInclusiveLineItemTotal(item))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary totals */}
        <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm sm:text-base">
            <span className="text-gray-600">Subtotal (incl. fees & tax):</span>
            <span className="font-semibold">{formatPrice(getAllInclusiveSubtotal())}</span>
          </div>
          
          <div className="flex justify-between text-sm sm:text-base pb-3 border-b border-gray-200">
            <span className="text-gray-600">Shipping:</span>
            <span className="font-semibold">{shippingCost ? formatPrice(shippingCost) : 'Calculated at checkout'}</span>
          </div>
          
          <div className="flex justify-between text-lg sm:text-xl font-bold pt-2">
            <span>Total:</span>
            <span className="text-blue-600">{formatPrice(getAllInclusiveSubtotal() + (shippingCost || 0))}</span>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onNext}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base"
          >
            Continue to Shipping
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartReviewStep;