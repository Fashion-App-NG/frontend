import { useCart } from '../../../contexts/CartContext';
import { formatPrice } from '../../../utils/formatPrice';

const OrderSummaryCard = ({ cart, currentStep }) => {
  const { cartItems } = useCart();
  
  // Calculate totals
  const hasCartData = cart?.totalAmount !== undefined && cart?.taxAmount !== undefined;
  const platformFee = cart?.totalPlatformFee || cart?.platformFeeAmount || 0;
  const useAPIData = hasCartData && platformFee > 0;
  
  const subtotal = useAPIData
    ? cart.totalAmount + cart.taxAmount + platformFee
    : cartItems.reduce((sum, item) => {
        const basePrice = item.pricePerYard || 0;
        const taxAmount = item.taxAmount || 0;
        const platformFeeAmt = item.platformFeeAmount || 0;
        const quantity = item.quantity || 1;
        return sum + (basePrice * quantity) + taxAmount + platformFeeAmt;
      }, 0);
  
  const showDetailedBreakdown = currentStep >= 3;
  const deliveryFee = showDetailedBreakdown ? (cart?.shippingCost || 0) : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal (incl. fees & tax)</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        
        {showDetailedBreakdown && (
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Fee</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>
        )}
        
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