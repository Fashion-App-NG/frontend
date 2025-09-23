import { useCart } from '../../../contexts/CartContext';

// Accepts either sessionData (in-progress) or a confirmed order object
const OrderSummaryCard = ({ cart, order, currentStep }) => {
  const { getCartTotal } = useCart(); // Get the calculation directly from CartContext
  
  // Use CartContext calculation as the source of truth for subtotal
  const subtotal = getCartTotal();
  
  // Only show delivery fee and tax after shipping info step (step 2)
  const showDetailedBreakdown = currentStep >= 3;
  
  // Use zeros for delivery and tax until we reach payment step
  const deliveryFee = showDetailedBreakdown ? (cart?.shippingCost ?? 0) : 0;
  const tax = showDetailedBreakdown ? (cart?.taxAmount ?? 0) : 0;
  
  // For total, use cart.totalWithShipping if available (on payment step), otherwise just the subtotal
  const total = showDetailedBreakdown && cart?.totalWithShipping 
    ? cart.totalWithShipping 
    : subtotal;

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);

  const shippingError = false; // Remove error display since we're intentionally not showing shipping yet

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      {shippingError && (
        <div className="bg-yellow-50 text-yellow-700 text-sm rounded px-2 py-1 mb-2">
          Unable to calculate shipping. Please check your address or try again.
        </div>
      )}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        
        {showDetailedBreakdown && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
          </>
        )}
        
        <hr className="my-2" />
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span className="text-blue-600">{formatPrice(total)}</span>
        </div>
        
        {!showDetailedBreakdown && currentStep < 3 && (
          <p className="text-xs text-gray-500 mt-1">
            Shipping and tax will be calculated after address confirmation.
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderSummaryCard;