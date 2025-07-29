import { useCart } from '../../../contexts/CartContext';

// Accepts either sessionData (in-progress) or a confirmed order object
const OrderSummaryCard = ({ sessionData }) => {
  const { getCartTotal } = useCart();

  // Try to use confirmed order data if available
  const hasOrder =
    sessionData &&
    (typeof sessionData.subtotal === "number" ||
      typeof sessionData.totalAmount === "number");

  // Fallback to cart/session calculation if not a confirmed order
  const subtotal = hasOrder
    ? sessionData.subtotal
    : getCartTotal();
  const deliveryFee = hasOrder
    ? sessionData.deliveryFee
    : 3000;
  const tax = hasOrder
    ? sessionData.tax
    : Math.round(subtotal * 0.075);
  const total = hasOrder
    ? sessionData.totalAmount || sessionData.total
    : subtotal + deliveryFee + tax;

  // Defensive: handle missing values
  const safe = (val) =>
    typeof val === "number" && !isNaN(val) ? val : 0;

  const formatPrice = (price) =>
    price != null
      ? `₦${safe(price).toLocaleString()}`
      : "₦0";

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
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
      {/* Optionally show session/order ID for debugging */}
      {sessionData?.orderId || sessionData?.sessionId ? (
        <div className="mt-4 text-xs text-blue-900 bg-blue-50 rounded px-2 py-1">
          <span className="font-medium">Session/Order ID:</span>{" "}
          {sessionData.orderId || sessionData.sessionId}
        </div>
      ) : null}
    </div>
  );
};

export default OrderSummaryCard;