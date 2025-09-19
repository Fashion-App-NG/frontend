import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import OrderTrackingTimeline from '../components/OrderTrackingTimeline';
import { useAuth } from '../contexts/AuthContext';
import checkoutService from '../services/checkoutService';
import shippingService from '../services/shippingService';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeShipment, setActiveShipment] = useState(null);

  useEffect(() => {
    const fetchOrderAndShipments = async () => {
      try {
        setLoading(true);
        
        // First, determine if we have a standard MongoDB ID or an order number format
        let orderData;
        
        // The order object in the ShopperOrders.jsx page has BOTH orderNumber (e.g. ORD-250918-0001)
        // AND orderId or _id (the MongoDB ID)
        // Looking at the logs, we should use the MongoDB ID directly
        if (orderId.startsWith('ORD-')) {
          // Check if we're coming from ShopperOrders and might have the ID in state
          const state = location.state;
          if (state && state.orderId) {
            // If the order ID is available in state, use it
            const mongoId = state.orderId;
            const orderResponse = await checkoutService.getOrderById(mongoId);
            orderData = orderResponse.order || orderResponse;
          } else {
            // If we don't have the MongoDB ID, notify user of the error
            throw new Error('Order details cannot be fetched with order number format. Please go back to orders page.');
          }
        } else {
          // Assume it's a MongoDB ObjectId
          const orderResponse = await checkoutService.getOrderById(orderId);
          orderData = orderResponse.order || orderResponse;
        }
        
        if (!orderData) {
          throw new Error('Order data not found');
        }
        
        setOrder(orderData);
        
        // Next, fetch shipments for this order
        try {
          const shipmentsResponse = await shippingService.getOrderShipments(orderId);
          if (shipmentsResponse.success && shipmentsResponse.shipments?.length) {
            setShipments(shipmentsResponse.shipments);
            setActiveShipment(shipmentsResponse.shipments[0]);
            
            // For each shipment, fetch detailed tracking information
            const shipmentWithTrackingPromises = shipmentsResponse.shipments.map(async (shipment) => {
              try {
                const trackingResponse = await shippingService.getShipmentTracking(shipment.id);
                if (trackingResponse.success && trackingResponse.tracking) {
                  return {
                    ...shipment,
                    tracking: trackingResponse.tracking
                  };
                }
                return shipment;
              } catch (err) {
                console.warn(`Could not fetch tracking for shipment ${shipment.id}:`, err);
                return shipment;
              }
            });
            
            // Wait for all tracking data to be fetched
            const shipmentsWithTracking = await Promise.all(shipmentWithTrackingPromises);
            setShipments(shipmentsWithTracking);
            setActiveShipment(shipmentsWithTracking[0]);
          } else {
            // If no shipments found through the API, use order status for simple tracking
            console.log('No shipments found for this order. Using order status for tracking.');
          }
        } catch (err) {
          console.warn('Error fetching shipments:', err);
          // Continue with order-based tracking as fallback
          console.log('Using order status for tracking as fallback.');
        }
      } catch (err) {
        console.error('Error in fetchOrderAndShipments:', err);
        setError('An error occurred while fetching tracking information');
        toast.error('Error loading tracking details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderAndShipments();
    }
  }, [orderId, location.state]);

  // Generate synthetic tracking data based on order status if no shipments
  const generateTrackingFromOrderStatus = () => {
    // Default tracking data structure
    const tracking = [];
    const orderDate = new Date(order.createdAt);
    
    // Add "Processing Order" status - this is always present for confirmed orders
    tracking.push({
      status: "PROCESSING",
      location: "Warehouse",
      timestamp: orderDate.toISOString(),
      description: "Your order has been confirmed and is being processed"
    });
    
    // If order status is beyond processing, add "Ready for pickup"
    if (["READY_FOR_PICKUP", "SHIPPED", "DISPATCHED", "DELIVERED"].includes(order.status)) {
      const pickupDate = new Date(orderDate);
      pickupDate.setHours(pickupDate.getHours() + 24); // 24 hours after order
      tracking.push({
        status: "READY_FOR_PICKUP",
        location: "Distribution Center",
        timestamp: pickupDate.toISOString(),
        description: "Your order is ready for pickup"
      });
    }
    
    // If order is shipped/dispatched/delivered, add dispatch status
    if (["SHIPPED", "DISPATCHED", "DELIVERED"].includes(order.status)) {
      const dispatchDate = new Date(orderDate);
      dispatchDate.setHours(dispatchDate.getHours() + 48); // 48 hours after order
      tracking.push({
        status: "DISPATCHED",
        location: "Dispatch Center",
        timestamp: dispatchDate.toISOString(),
        description: "Your order has been dispatched for delivery"
      });
    }
    
    // If order is delivered, add delivered status
    if (order.status === "DELIVERED") {
      const deliveryDate = new Date(orderDate);
      deliveryDate.setHours(deliveryDate.getHours() + 72); // 72 hours after order
      tracking.push({
        status: "DELIVERED",
        location: "Destination",
        timestamp: deliveryDate.toISOString(),
        description: "Your order has been delivered"
      });
    }
    
    return tracking;
  };

  const goBack = () => {
    const path = window.location.pathname;
    if (path.includes('/shopper/')) {
      navigate('/shopper/orders');
    } else {
      navigate('/orders');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error || 'Order not found'}
              </p>
              <p className="mt-2 text-sm">
                <button 
                  onClick={goBack}
                  className="font-medium text-red-700 hover:text-red-600"
                >
                  Return to orders
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no shipments were found, generate tracking data from order status
  const syntheticTracking = shipments.length === 0 ? generateTrackingFromOrderStatus() : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button onClick={goBack} className="text-gray-600 hover:text-black mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">Order Tracking</h1>
      </div>

      {shipments.length > 0 ? (
        <>
          {/* Show shipment selector if there are multiple shipments */}
          {shipments.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Shipment
              </label>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {shipments.map((shipment) => (
                  <button
                    key={shipment.id}
                    onClick={() => setActiveShipment(shipment)}
                    className={`px-4 py-2 text-sm rounded-md ${
                      activeShipment?.id === shipment.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {shipment.trackingNumber || `Shipment #${shipment.id.substring(0, 8)}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tracking timeline for active shipment */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            {activeShipment && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Tracking ID: {activeShipment.trackingNumber || activeShipment.id?.substring(0, 8)}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activeShipment.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    activeShipment.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activeShipment.status?.replace(/_/g, ' ')}
                  </span>
                </div>
                
                {activeShipment.estimatedDelivery && (
                  <p className="text-sm text-gray-600 mb-6">
                    Estimated delivery: {new Date(activeShipment.estimatedDelivery).toLocaleDateString()}
                  </p>
                )}
                
                <OrderTrackingTimeline 
                  tracking={activeShipment.tracking || []} 
                  status={activeShipment.status}
                />
              </>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {syntheticTracking ? (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Tracking ID: {order.orderNumber || order._id?.substring(0, 8)?.toUpperCase()}
              </h2>
              <OrderTrackingTimeline tracking={syntheticTracking} />
            </>
          ) : (
            <OrderTrackingTimeline order={order} />
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-medium">{order.orderNumber || order._id || order.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date Placed</p>
            <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2">Shipping Address</h3>
          <address className="not-italic">
            {order.shippingAddress?.street || 'Not available'}<br />
            {order.shippingAddress?.city && `${order.shippingAddress.city}, `}
            {order.shippingAddress?.state} {order.shippingAddress?.zipCode || order.shippingAddress?.postalCode}<br />
            {order.shippingAddress?.country}
          </address>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;