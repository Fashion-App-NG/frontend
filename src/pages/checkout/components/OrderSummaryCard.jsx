import { useCart } from '../../../contexts/CartContext';
import { formatPrice } from '../../../utils/formatPrice';
import { getPlatformFee } from '../../../utils/priceCalculations';

const OrderSummaryCard = ({ cart, order, currentStep }) => {
  const { cartItems } = useCart();
  
  // Calculate all-inclusive subtotal using API taxAmount
  const getAllInclusiveSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const basePrice = parseFloat(item.pricePerYard) || 0;
      const taxAmount = parseFloat(item.taxAmount) || 0;
      const platformFee = getPlatformFee(item);
      const quantity = item.quantity || 1;
      return sum + ((basePrice + taxAmount + platformFee) * quantity);
    }, 0);
  };
  
  const subtotal = getAllInclusiveSubtotal();
  
  // Only show delivery fee after shipping info step (step 2)
  const showDetailedBreakdown = currentStep >= 3;
  const deliveryFee = showDetailedBreakdown ? (cart?.shippingCost ?? 0) : 0;
  const total = subtotal + deliveryFee;

  // Get tax rate for display
  const taxRate = cartItems.length > 0 && cartItems[0].taxAmount 
    ? cartItems[0].taxAmount / cartItems[0].pricePerYard 
    : 0;

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