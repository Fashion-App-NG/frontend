import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import checkoutService from "../services/checkoutService";

const statusBadge = (status) => {
  const map = {
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    PENDING: "bg-orange-100 text-orange-700",
    NEW_ORDER: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-700"}`}>
      {status?.replace("_", " ").toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase())}
    </span>
  );
};

const ShopperOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      setError(null);
      try {
        const data = await checkoutService.getOrderById(orderId);
        console.log("Fetched order details:", data);
        setOrder(data.order || data);
      } catch (err) {
        setError(err.message || "Failed to fetch order.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Order not found.</p>
        <Link to="/shopper/orders" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:underline mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-1" />
        Back to Orders
      </button>
      <div className="bg-white rounded-xl shadow border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Details</h1>
        <div className="flex flex-wrap gap-6 mb-4">
          <div>
            <div className="text-xs text-gray-500">Order ID</div>
            <div className="font-mono text-lg font-semibold">{order.orderNumber}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Date</div>
            <div>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "--"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Amount</div>
            <div className="font-semibold text-blue-700">₦{order.totalAmount?.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Status</div>
            {statusBadge(order.status)}
          </div>
          <div>
            <div className="text-xs text-gray-500">Payment</div>
            {statusBadge(order.paymentStatus)}
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Shipping Address</div>
          <div className="text-sm text-gray-700">
            {order.shippingAddress
              ? (
                <>
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                  {order.shippingAddress.country} {order.shippingAddress.postalCode}
                </>
              )
              : <span className="text-gray-400">Not available</span>
            }
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Customer Info</div>
          <div className="text-sm text-gray-700">
            {order.customerInfo
              ? (
                <>
                  {order.customerInfo.name}<br />
                  {order.customerInfo.email}<br />
                  {order.customerInfo.phone}
                </>
              )
              : <span className="text-gray-400">Not available</span>
            }
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Items</div>
          <ul className="list-disc ml-5 text-sm text-gray-700">
            {order.items?.map((item) => (
              <li key={item.productId}>
                <span className="font-medium">{item.name}</span> x{item.quantity} @ ₦{item.pricePerYard?.toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
        {["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) && (
          <Link 
            to={`/shopper/orders/${order.orderId || order._id || order.id}/tracking`}
            state={{ orderId: order.orderId || order._id || order.id, orderNumber: order.orderNumber }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Track Order
          </Link>
        )}
      </div>
    </div>
  );
};

export default ShopperOrderDetails;