import { Link } from 'react-router-dom';

const OrderConfirmationStep = ({ sessionData }) => {
  // Mock order data - in real app this would come from API
  const orderData = {
    orderNumber: '#23256890',
    orderDate: '22. Jan. 2025',
    trackingId: '3UD645A',
    paymentMethod: 'Mastercard',
    shippingAddress: '5 Bessie esiaba, Ogudu GRA. Lagos',
    items: [
      {
        name: 'Chiffon Fabric in lightweignt woven',
        color: 'Green',
        quantity: 3,
        price: 300000
      },
      {
        name: 'Lace Fabric',
        color: 'Green',
        quantity: 2,
        price: 300000
      }
    ],
    subtotal: 600000,
    deliveryFee: 3000,
    tax: 5400,
    total: 608400
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Your Order is Confirmed!</h1>
        <p className="text-gray-600">Hello Favour, your order has been confirmed and will be shipped within next two days</p>
      </div>

      <div className="mb-8">
        <Link
          to={`/shopper/orders/${orderData.trackingId}`}
          className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
        >
          Track your order
        </Link>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Order Date</p>
            <p className="font-medium">{orderData.orderDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Order No</p>
            <p className="font-medium">{orderData.orderNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Payment Method</p>
            <div className="flex items-center">
              <div className="w-8 h-5 bg-red-500 rounded mr-2"></div>
              <span className="font-medium">{orderData.paymentMethod}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Shipping Address</p>
            <p className="font-medium text-sm">{orderData.shippingAddress}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-4 mb-6">
          {orderData.items.map((item, index) => (
            <div key={index} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 text-left">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-500">Color: {item.color}</p>
                <p className="text-sm text-gray-500">Quantity: {item.quantity}yards</p>
                <p className="text-sm text-gray-500">Store: The fabric loft Store</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPrice(item.price)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatPrice(orderData.subtotal)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="font-medium">{formatPrice(orderData.deliveryFee)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium">{formatPrice(orderData.tax)}</span>
          </div>
          <div className="flex justify-between py-3 border-t border-gray-200 text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(orderData.total)}</span>
          </div>
        </div>
      </div>

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
          View Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationStep;