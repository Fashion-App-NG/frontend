import { Link } from 'react-router-dom';

const OrdersPage = () => {
  // Sample order data
  const orders = [
    { _id: '1', item: 'Product 1', status: 'Shipped' },
    { _id: '2', item: 'Product 2', status: 'Processing' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          My Orders
        </h1>
        <p className="text-gray-600">
          View and track your orders
        </p>
      </div>
      <div className="mt-8">
        {orders.map(order => (
          <div key={order._id} className="bg-white shadow-md rounded-lg p-4 mb-4">
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{order.item}</h2>
                <p className="text-gray-600">Status: {order.status}</p>
              </div>
              <Link 
                to={`/orders/${order._id}/tracking`}
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Track Order
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;