import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';

const OrderConfirmationStep = ({ order }) => {
  const { clearCart, cartCount } = useCart();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🟡 [CONFIRMATION] OrderConfirmationStep mounted');
      console.log('🟡 [CONFIRMATION] Cart count on mount:', cartCount);
    }

    const loadOrderAndClearCart = async () => {
      const lastOrder = localStorage.getItem('lastOrder');
      if (lastOrder) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🟡 [CONFIRMATION] Found order data, loading...');
        }
        try {
          const order = JSON.parse(lastOrder);
          setOrderData(order);

          if (process.env.NODE_ENV === 'development') {
            console.log('🟡 [CONFIRMATION] About to clear cart on confirmation page');
          }
          try {
            await clearCart(true);
            if (process.env.NODE_ENV === 'development') {
              console.log('🟢 [CONFIRMATION] Cart cleared on confirmation page');
            }
          } catch (clearError) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ [CONFIRMATION] Failed to clear cart on confirmation:', clearError);
            }
          }

          localStorage.removeItem('lastOrder');
        } catch (error) {
          console.error('❌ [CONFIRMATION] Error parsing order data:', error);
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔴 [CONFIRMATION] No order data found in localStorage');
        }
      }
    };

    loadOrderAndClearCart();
  }, [clearCart, cartCount]); // ✅ Add setConfirmedOrder to dependencies

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  if (!orderData) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-center">Order Confirmed!</h2>
      <p className="text-center mb-8 text-gray-700">
        Thank you for your purchase. Your order has been successfully processed.
      </p>
      <div className="space-y-6">
        {/* Order Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Order ID:</span> {orderData.orderId || orderData.orderNumber || orderData.id}</p>
            <p><span className="font-medium">Date:</span> {formatDate(orderData.createdAt || orderData.orderDate || orderData.date)}</p>
            {typeof orderData.subtotal === 'number' && (
              <p><span className="font-medium">Subtotal:</span> {formatPrice(orderData.subtotal)}</p>
            )}
            {typeof orderData.deliveryFee === 'number' && (
              <p><span className="font-medium">Delivery Fee:</span> {formatPrice(orderData.deliveryFee)}</p>
            )}
            {typeof orderData.tax === 'number' && (
              <p><span className="font-medium">Tax:</span> {formatPrice(orderData.tax)}</p>
            )}
            <p><span className="font-medium">Total:</span> {formatPrice(orderData.totalAmount || orderData.total)}</p>
          </div>
        </div>
        {/* Order Items */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-2">Order Items</h3>
          {orderData.items && orderData.items.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {orderData.items.map((item, idx) => (
                <li key={item.id || idx} className="py-2 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-500">Quantity: {item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900">{formatPrice(item.pricePerYard ? item.pricePerYard * item.quantity : item.price * item.quantity)}</div>
                    <div className="text-xs text-gray-500">{formatPrice(item.pricePerYard || item.price)} each</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No items found in this order.</p>
          )}
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-8">
        <Link
          to="/shopper/orders"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Order History
        </Link>
        <Link
          to="/shopper/products"
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationStep;