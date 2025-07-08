import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';

const OrderConfirmationStep = ({ sessionData }) => {
  const { user } = useAuth();
  const { clearCart, cartCount } = useCart();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    console.log('🟡 [CONFIRMATION] OrderConfirmationStep mounted');
    console.log('🟡 [CONFIRMATION] Cart count on mount:', cartCount);
    
    const loadOrderAndClearCart = async () => {
      const lastOrder = localStorage.getItem('lastOrder');
      if (lastOrder) {
        console.log('🟡 [CONFIRMATION] Found order data, loading...');
        try {
          const order = JSON.parse(lastOrder);
          setOrderData(order);
          
          console.log('🟡 [CONFIRMATION] About to clear cart on confirmation page');
          try {
            await clearCart(true);
            console.log('🟢 [CONFIRMATION] Cart cleared on confirmation page');
          } catch (clearError) {
            console.warn('⚠️ [CONFIRMATION] Failed to clear cart on confirmation:', clearError);
          }
          
          localStorage.removeItem('lastOrder');
        } catch (error) {
          console.error('❌ [CONFIRMATION] Error parsing order data:', error);
        }
      } else {
        console.log('🔴 [CONFIRMATION] No order data found in localStorage');
      }
    };

    loadOrderAndClearCart();
  }, [clearCart]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!orderData) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
        <p className="text-gray-600">Thank you for your purchase. Your order has been successfully processed.</p>
      </div>

      {/* Order details display */}
      <div className="space-y-6">
        {/* Order info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Order ID:</span> {orderData.orderId}</p>
            <p><span className="font-medium">Date:</span> {formatDate(orderData.createdAt)}</p>
            <p><span className="font-medium">Total:</span> {formatPrice(orderData.totalAmount)}</p>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-center space-x-4">
          <Link 
            to="/orders" 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Order History
          </Link>
          <Link 
            to="/" 
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationStep;