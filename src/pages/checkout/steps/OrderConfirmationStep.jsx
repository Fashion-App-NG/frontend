import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const OrderConfirmationStep = ({ order, clearCart, loadCart }) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[PAGE] OrderConfirmationStep rendered');
  }
  useEffect(() => {
    let hasRun = false; // Prevent double execution in StrictMode
    
    async function clearCartOnce() {
      if (hasRun) {
        console.log('[ORDER-CONFIRMATION] Skipping duplicate StrictMode call');
        return;
      }
      hasRun = true;
      
      if (clearCart) {
        try {
          await clearCart(true); // Mark as checkout complete
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Cart cleared after successful order');
          }
        } catch (error) {
          console.error('❌ Failed to clear cart after order:', error);
        }
      }
    }
    
    clearCartOnce();
  }, [order?.id]); // Only depend on order ID, not clearCart function

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-2xl font-bold text-green-600 mb-4">Thank you for your order!</h1>
      <p className="mb-2">Your order <span className="font-semibold">{order?.orderNumber}</span> has been placed successfully.</p>
      <p className="mb-6">A confirmation email has been sent to <span className="font-semibold">{order?.customerInfo?.email}</span>.</p>
      <Link
        to="/shopper/orders"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        View My Orders
      </Link>
    </div>
  );
};

export default OrderConfirmationStep;