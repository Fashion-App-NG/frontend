// Accepts either sessionData (in-progress) or a confirmed order object
const OrderSummaryCard = ({ cart, order, currentStep }) => {
  // Use backend values if available
  const subtotal = cart?.totalAmount ?? 0;
  const deliveryFee = cart?.shippingCost ?? 0;
  const tax = cart?.taxAmount ?? 0;
  const total = cart?.totalWithShipping ?? (subtotal + deliveryFee + tax);

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);

  const shippingError =
    currentStep === 1 && // Only show on cart review step
    (deliveryFee === 0) &&
    (!cart?.selectedShippingRates || Object.keys(cart.selectedShippingRates).length === 0);

  if (shippingError) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG] OrderSummaryCard: Shipping calculation failed', {
        deliveryFee,
        selectedShippingRates: cart?.selectedShippingRates
      });
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      {shippingError && (
        <div className="bg-yellow-50 text-yellow-700 text-sm rounded px-2 py-1 mb-2">
          Delivery fee could not be calculated. You may be billed for delivery separately.
        </div>
      )}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Fee</span>
          <span>{formatPrice(deliveryFee)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span className="text-blue-600">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryCard;