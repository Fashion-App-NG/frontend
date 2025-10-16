import { useCart } from '../../../contexts/CartContext';
import { formatPrice } from '../../../utils/formatPrice';
import { getTaxRateFromCart } from '../../../utils/priceCalculations';

const OrderSummaryCard = ({ cart, order, currentStep }) => {
  const { cartItems } = useCart();
  
  // 🎯 USE BACKEND VALUES - Backend is the source of truth
  const backendBaseAmount = cart?.totalAmount || 0;
  const backendTaxAmount = cart?.taxAmount || 0;
  const backendPlatformFees = cart?.totalPlatformFee || 0;
  
  // Subtotal = base + tax + platform fees (no rounding needed)
  const subtotal = backendBaseAmount + backendTaxAmount + backendPlatformFees;
  
  // Only show delivery fee after shipping info step (step 2)
  const showDetailedBreakdown = currentStep >= 3;
  const deliveryFee = showDetailedBreakdown ? (cart?.shippingCost ?? 0) : 0;
  const total = subtotal + deliveryFee;

  // Get tax rate for display (safe division)
  const taxRate = getTaxRateFromCart(cartItems);

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
        
        {!showDetailedBreakdown && currentStep < 3 && (
          <p className="text-xs text-gray-500 mt-2">
            * VAT ({Math.round(taxRate * 100)}%) is calculated on product price only. Platform fees are not taxed.
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderSummaryCard;