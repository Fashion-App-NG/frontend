import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import vendorOrderService from '../services/vendorOrderService';
import { formatPrice } from '../utils/formatPrice';

const VendorOrderDetailsPage = () => {
  // ✅ ALL HOOKS FIRST
  const { orderId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // ✅ useEffect for fetching order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !isAuthenticated || user?.role !== 'vendor') {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await vendorOrderService.getOrderDetails(orderId);
        
        if (response.success) {
          setOrder(response.data.order || response.data);
        } else {
          setError(response.message || 'Failed to fetch order details');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, isAuthenticated, user?.role]);

  // ✅ Add the missing handleStatusUpdate function
  const handleStatusUpdate = async (newStatus) => {
    if (!order || updating) return;

    setUpdating(true);
    setError(null);

    try {
      const response = await vendorOrderService.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        // Update the order state with the new status
        setOrder(prevOrder => ({
          ...prevOrder,
          status: newStatus,
          updatedAt: new Date().toISOString()
        }));
        
        // Optional: Show success message
        console.log('Order status updated successfully');
      } else {
        setError(response.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  // ✅ CONDITIONAL LOGIC AFTER ALL HOOKS AND FUNCTIONS
  if (!isAuthenticated) {
    return <Navigate to="/login/vendor" replace />;
  }

  if (user && user.role !== 'vendor') {
    return <Navigate to="/vendor/dashboard" replace />;
  }

  // ✅ Loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
            <Link 
              to="/vendor/orders" 
              className="mt-2 inline-block text-red-600 hover:text-red-800"
            >
              ← Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">Order not found</p>
          <Link 
            to="/vendor/orders" 
            className="mt-2 inline-block text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Main render logic
  const StatusBadge = ({ status, type = 'order' }) => {
    const colors = {
      order: {
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
      },
      payment: {
        paid: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        failed: 'bg-red-100 text-red-800',
        refunded: 'bg-gray-100 text-gray-800'
      }
    };
    
    const colorClass = colors[type][status] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 ml-[254px] p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-[10px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Link
                  to="/vendor/orders"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block"
                >
                  ← Back to Orders
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                <p className="text-gray-600">Order {order.orderId}</p>
              </div>
              
              {/* Status update */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Update Status</div>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={updating}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Order summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Order Date</div>
                <div className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="font-semibold text-lg">{formatPrice(order.orderSummary.totalAmount)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Order Status</div>
                <div className="mt-1"><StatusBadge status={order.status} /></div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Payment Status</div>
                <div className="mt-1"><StatusBadge status={order.paymentStatus} type="payment" /></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="bg-white rounded-[10px] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium">{order.customer.firstName} {order.customer.lastName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div>{order.customer.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div>{order.customer.phone}</div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-[10px] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="text-gray-700">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-[10px] p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.products.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">Product ID: {item.productId}</p>
                    {item.specifications && (
                      <div className="text-sm text-gray-500 mt-1">
                        {Object.entries(item.specifications).map(([key, value]) => (
                          <span key={key} className="mr-3">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatPrice(item.price)} × {item.quantity}</div>
                    <div className="text-lg font-semibold">{formatPrice(item.totalPrice)}</div>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))}
            </div>

            {/* Order totals */}
            <div className="border-t border-gray-200 mt-6 pt-4">
              <div className="space-y-2 text-right">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatPrice(order.orderSummary.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span>{formatPrice(order.orderSummary.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span>{formatPrice(order.orderSummary.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span>{formatPrice(order.orderSummary.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorOrderDetailsPage;