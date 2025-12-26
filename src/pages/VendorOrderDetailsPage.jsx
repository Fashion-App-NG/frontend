import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import OrderDeliveryInfo from '../components/OrderDeliveryInfo';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { useRequireAuth } from '../hooks/useRequireAuth';
import vendorOrderService from '../services/vendorOrderService';
import { formatPrice } from '../utils/formatPrice';

const VendorOrderDetailsPage = () => {
  const { orderId } = useParams();
  
  const { user, loading: authLoading, isAuthorized } = useRequireAuth({
    requiredRole: 'vendor',
    redirectTo: '/login/vendor'
  });

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !user?.id) {
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
  }, [orderId, user?.id]);

  // ✅ Commented out function that uses the removed state
  // const handleStatusUpdate = async (newStatus) => {
  //   if (!order || updating) return;
  //   setUpdating(true);
  //   setError(null);
  //   try {
  //     const response = await vendorOrderService.updateOrderStatus(orderId, newStatus);
  //     if (response.success) {
  //       setOrder(prevOrder => ({
  //         ...prevOrder,
  //         status: newStatus,
  //         updatedAt: new Date().toISOString()
  //       }));
  //     } else {
  //       setError(response.message || 'Failed to update order status');
  //     }
  //   } catch (err) {
  //     console.error('Error updating order status:', err);
  //     setError(err.message || 'Failed to update order status');
  //   } finally {
  //     setUpdating(false);
  //   }
  // };

  if (authLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/vendor/orders"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Orders
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.orderNumber || order._id}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <OrderDeliveryInfo order={order} />
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="font-medium">{formatPrice(order.deliveryFee || 0)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <img 
                    src={item.product?.image || '/placeholder-product.png'} 
                    alt={item.product?.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                  <OrderStatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorOrderDetailsPage;