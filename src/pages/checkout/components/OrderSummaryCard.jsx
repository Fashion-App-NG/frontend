import { useCart } from '../../../contexts/CartContext';

const OrderSummaryCard = ({ sessionData }) => {
  const { cartItems, getCartTotal } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  const subtotal = getCartTotal();
  const deliveryFee = 3000; // Fixed delivery fee
  const tax = Math.round(subtotal * 0.075); // 7.5% tax
  const total = subtotal + deliveryFee + tax;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      
      {/* Items */}
      <div className="space-y-3 mb-4">
        {cartItems.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-gray-600">
              {item.name} × {item.quantity}
            </span>
            <span className="font-medium">
              {formatPrice((item.pricePerYard || item.price) * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <hr className="my-4" />

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Delivery Fee</span>
          <span>{formatPrice(deliveryFee)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Session Info */}
      {sessionData && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600">
            Session ID: {sessionData.sessionId}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderSummaryCard;