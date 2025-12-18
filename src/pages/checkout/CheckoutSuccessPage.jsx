import { useLocation, useNavigate } from 'react-router-dom';

const CheckoutSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // The order details are passed via router state
  const order = location.state?.order;

  if (!order) {
    // If no order data, redirect to home or cart
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold mb-4 text-red-600">No order details found</h2>
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => navigate('/cart')}
        >
          Go to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <svg className="mx-auto mb-4 w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 12a5 5 0 1010 0 5 5 0 00-10 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-green-700 mb-2">Order Confirmed!</h2>
        <p className="text-gray-700 mb-6">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
          <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium">Order Number:</span> {order.orderNumber}
            </div>
            <div>
              <span className="font-medium">Order ID:</span> {order._id}
            </div>
            <div>
              <span className="font-medium">Total Amount:</span> ₦{order.totalAmount?.toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Status:</span> {order.status}
            </div>
            <div>
              <span className="font-medium">Payment Status:</span> {order.paymentStatus}
            </div>
            <div>
              <span className="font-medium">Date:</span> {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
          <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium">Street:</span> {order.shippingAddress?.street}
            </div>
            <div>
              <span className="font-medium">City:</span> {order.shippingAddress?.city}
            </div>
            <div>
              <span className="font-medium">State:</span> {order.shippingAddress?.state}
            </div>
            <div>
              <span className="font-medium">Country:</span> {order.shippingAddress?.country}
            </div>
          </div>
        </div>
        <button
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => navigate('/browse')}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;