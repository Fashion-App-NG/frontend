import { useCart } from '../../../contexts/CartContext';
import { useTax } from '../../../contexts/TaxContext';
import { formatPrice } from '../../../utils/formatPrice';
import { getAllInclusiveSubtotal } from '../../../utils/priceCalculations';

const OrderSummaryCard = ({ cart, order, currentStep }) => {
  const { cartItems } = useCart();
  const { taxRate } = useTax();
  
  // Use all-inclusive subtotal calculation
  const subtotal = getAllInclusiveSubtotal(cartItems, taxRate);
  
  // Only show delivery fee after shipping info step (step 2)
  const showDetailedBreakdown = currentStep >= 3;
  
  // Use zeros for delivery until we reach payment step
  const deliveryFee = showDetailedBreakdown ? (cart?.shippingCost ?? 0) : 0;
  
  // For total, just add delivery fee to subtotal (tax already included)
  const total = 
  //showDetailedBreakdown && cart?.totalWithShipping 
    //? cart.totalWithShipping : 
    subtotal + deliveryFee;

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
          // Tax line removed since it's included in subtotal
        )}
        
        <hr className="my-2" />
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span className="text-blue-600">{formatPrice(total)}</span>
        </div>
        
        {!showDetailedBreakdown && currentStep < 3 && (
          <p className="text-xs text-gray-500 mt-1">
            Shipping will be calculated after address confirmation.
            All prices include fees and {Math.round(taxRate * 100)}% tax.
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderSummaryCard;