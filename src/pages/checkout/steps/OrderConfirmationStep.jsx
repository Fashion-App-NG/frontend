import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const OrderConfirmationStep = ({ sessionData }) => {
  const { user } = useAuth();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    // Get order data from localStorage (set by PaymentMethodStep)
    const lastOrder = localStorage.getItem('lastOrder');
    if (lastOrder) {
      try {
        const order = JSON.parse(lastOrder);
        setOrderData(order);
        // Clean up localStorage
        localStorage.removeItem('lastOrder');
      } catch (error) {
        console.error('Error parsing order data:', error);
      }
    }
  }, []);

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
        <p className="text-gray-600">Loading order confirmation...</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Your Order is Confirmed!</h1>
        <p className="text-gray-600">
          Hello {user?.firstName || 'Customer'}, your order has been confirmed and will be shipped within the next two days
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-8 space-y-3">
        <Link
          to={`/shopper/orders`} // We'll create this page next
          className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          View All Orders
        </Link>
        
        {orderData.trackingId && (
          <div className="text-sm text-gray-600">
            Order ID: <span className="font-mono font-medium">{orderData.orderNumber}</span>
          </div>
        )}
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 text-left">
        {/* Order Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Order Date</p>
            <p className="font-medium">{formatDate(orderData.orderDate || new Date())}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Order No</p>
            <p className="font-medium">{orderData.orderNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Payment Status</p>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="font-medium text-green-600">{orderData.paymentStatus}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Order Status</p>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span className="font-medium text-blue-600">{orderData.status}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {orderData.shippingAddress && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
            <p className="text-sm text-gray-600">
              {orderData.shippingAddress.street}, {orderData.shippingAddress.city}<br />
              {orderData.shippingAddress.state} {orderData.shippingAddress.zipCode}<br />
              {orderData.shippingAddress.country}
            </p>
          </div>
        )}

        {/* Order Items */}
        <div className="space-y-4 mb-6">
          <h4 className="font-medium text-gray-900">Order Items</h4>
          {orderData.items && orderData.items.map((item, index) => (
            <div key={index} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">Quantity: {item.quantity} yards</p>
                {item.vendorName && (
                  <p className="text-sm text-gray-500">Store: {item.vendorName}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPrice((item.pricePerYard || item.price) * item.quantity)}</p>
                <p className="text-sm text-gray-500">{formatPrice(item.pricePerYard || item.price)}/yard</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Total */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between py-3 text-lg font-semibold">
            <span>Total Paid</span>
            <span className="text-green-600">{formatPrice(orderData.totalAmount)}</span>
          </div>
          
          {orderData.paymentReference && (
            <div className="text-xs text-gray-500 mt-2">
              Payment Reference: {orderData.paymentReference}
            </div>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
        <ul className="text-sm text-blue-800 space-y-1 text-left">
          <li>• You'll receive an email confirmation shortly</li>
          <li>• Your items will be prepared for shipping within 1-2 business days</li>
          <li>• You'll get a tracking number once your order ships</li>
          <li>• Estimated delivery: 3-5 business days</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Link
          to="/shopper/browse"
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          to="/shopper/orders"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View All Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationStep;