import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const OrderConfirmationStep = ({ order, clearCart, loadCart }) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[PAGE] OrderConfirmationStep rendered');
  }
  
  // ✅ Single useEffect to handle cart clearing
  useEffect(() => {
    let hasRun = false; // Prevent double execution in StrictMode
    
    async function clearCartOnce() {
      if (hasRun) {
        console.log('[ORDER-CONFIRMATION] Skipping duplicate StrictMode call');
        return;
      }
      hasRun = true;
      
      if (clearCart && loadCart) {
        try {
          console.log('🔄 Order confirmed, clearing cart...');
          await clearCart();
          await loadCart(); // Refresh to confirm empty state
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Cart cleared after successful order');
          }
        } catch (error) {
          console.error('❌ Failed to clear cart after order:', error);
          // Don't throw - order was successful even if cart clear failed
        }
      }
    }
    
    clearCartOnce();
  }, [order?.id, clearCart, loadCart]); // ✅ Include all dependencies

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