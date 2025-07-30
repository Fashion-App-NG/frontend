import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const OrderConfirmationStep = ({ order, clearCart, loadCart }) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[PAGE] OrderConfirmationStep rendered');
  }
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[OrderConfirmationStep] Mounted. order:', order);
    }
    async function clearAndReload() {
      if (clearCart) {
        console.log('[DEBUG] About to call clearCart in OrderConfirmationStep');
        console.log('[DEBUG] clearCart in OrderConfirmationStep:', clearCart);
        await clearCart();
      }
      // TEMP: Add delay to test for race condition
      await new Promise(res => setTimeout(res, 500));
      if (loadCart) await loadCart();
    }
    clearAndReload();
  }, [clearCart, loadCart, order]);

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