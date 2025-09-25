import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import OrderActivityHistory from '../components/OrderActivityHistory';
import OrderBreadcrumbs from '../components/OrderBreadcrumbs';
import OrderTrackingProgress from '../components/OrderTrackingProgress';
import OrderTrackingTimeline from '../components/OrderTrackingTimeline';
import checkoutService from '../services/checkoutService';
import shippingService from '../services/shippingService';
import { normalizeOrderStatus } from '../utils/orderUtils';

const OrderTrackingPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeShipment, setActiveShipment] = useState(null);

  useEffect(() => {
    const fetchOrderAndShipments = async () => {
      try {
        setLoading(true);
        
        let orderResponse;
        let orderIdToUse = params.orderId; // Use a different variable name to avoid reassignment to const
        
        // Handle different order ID formats
        if (location.state?.orderId) {
          // Use ID from state if available (most reliable)
          orderIdToUse = location.state.orderId;
          orderResponse = await checkoutService.getOrderById(orderIdToUse);
        } else if (location.pathname.includes('/orders/')) {
          // Extract ID from URL - could be MongoDB ID or formatted order number
          const urlOrderId = location.pathname.split('/orders/')[1].split('/')[0];
          
          try {
            // First try as MongoDB ID
            orderResponse = await checkoutService.getOrderById(urlOrderId);
          } catch (error) {
            // If fails, could be order number format, try alternate endpoint
            orderResponse = await checkoutService.getOrderByNumber(urlOrderId);
          }
        } else {
          throw new Error('No valid order ID found');
        }
        
        if (!orderResponse?.success && !orderResponse?.order) {
          throw new Error('Failed to load order details');
        }
        
        const orderData = orderResponse.order || orderResponse;
        orderData.status = normalizeOrderStatus(orderData);
        setOrder(orderData);
        
        // Next, fetch shipments for this order
        try {
          const shipmentsResponse = await shippingService.getOrderShipments(orderIdToUse);
          if (shipmentsResponse.success && shipmentsResponse.shipments?.length) {
            // Normalize shipment data to ensure consistent property names
            const normalizedShipments = shipmentsResponse.shipments.map(shipment => ({
              ...shipment,
              // Ensure estimatedDelivery is set correctly
              estimatedDelivery: shipment.estimatedDeliveryDate || shipment.estimatedDelivery
            }));
            
            setShipments(normalizedShipments);
            setActiveShipment(normalizedShipments[0]);
            
            // For each shipment, fetch detailed tracking information
            const shipmentWithTrackingPromises = normalizedShipments.map(async (shipment) => {
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

    fetchOrderAndShipments();
  }, [location, params.orderId]);

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

  // Enhanced delivery time display
  const formatDeliveryTime = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date format:", dateString);
        return dateString; // Return the original string if parsing fails
      }
      
      const formattedDate = date.toLocaleDateString('en-NG', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      
      const formattedTime = date.toLocaleTimeString('en-NG', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return `${formattedDate} at ${formattedTime}`;
    } catch (err) {
      console.error("Error formatting date:", err);
      return dateString; // Return the original string on error
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
      <OrderBreadcrumbs 
        orderId={order.id || order._id} 
        orderNumber={order.orderNumber} 
        currentPage="tracking"
      />
      
      <div className="flex items-center mb-6">
        <button onClick={goBack} className="text-gray-600 hover:text-black mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">Order Tracking</h1>
      </div>

      {/* Add OrderTrackingProgress here */}
      <OrderTrackingProgress status={order.status} />

      <div className="mb-4 flex justify-between">
        <div>
          <span className="text-sm text-gray-600">Current Status:</span>
          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
            order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
            order.status === 'CONFIRMED' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'}`
          }>
            {order.status?.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          Last Updated: {new Date(order.updatedAt || order.createdAt).toLocaleString()}
        </div>
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
                  <div className="flex items-center mt-3 bg-gray-50 p-3 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium">Expected Delivery</p>
                      <p className="text-xs text-gray-600">
                        {formatDeliveryTime(activeShipment.estimatedDelivery)}
                      </p>
                    </div>
                  </div>
                )}
                
                <OrderTrackingTimeline 
                  tracking={activeShipment.tracking || []} 
                  status={activeShipment.status}
                />

                {/* Add vendor display to the tracking view */}
                <div className="mt-2">
                  <span className="text-sm text-gray-600 mr-2">Vendor:</span>
                  <span className="text-sm font-medium">
                    {activeShipment.vendorName || order.items?.find(item => 
                      item.productId === activeShipment.items?.[0]?.productId
                    )?.vendorName || "Unknown Vendor"}
                  </span>
                </div>

                {/* Add carrier information to the tracking view */}
                {activeShipment?.carrier && (
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-600 mr-2">Carrier:</span>
                    <span className="inline-flex items-center bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">
                      {activeShipment.carrier.toUpperCase()}
                    </span>
                  </div>
                )}

                {activeShipment?.trackingUrl && (
                  <a 
                    href={activeShipment.trackingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Track with Carrier
                  </a>
                )}
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

        {/* Add this block to display estimated delivery */}
        {order.shipments?.length > 0 && order.shipments[0].estimatedDeliveryDate && !activeShipment?.estimatedDelivery && (
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Estimated Delivery</h3>
            <div className="flex items-center bg-gray-50 p-3 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm">
                  {formatDeliveryTime(order.shipments[0].estimatedDeliveryDate)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add OrderActivityHistory here */}
      <OrderActivityHistory activities={order.activities || []} />

      <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button 
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => window.print()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Details
          </button>
          
          <button 
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => navigate(`/shopper/orders/${order.id || order._id}`)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            View Order Details
          </button>
          
          {["SHIPPED", "DISPATCHED", "IN_TRANSIT"].includes(order.status) && (
            <button className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Confirm Delivery
            </button>
          )}
        </div>
      </div>

      {/* Development-only debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Debug Info</h2>
          <pre className="text-sm text-gray-800 whitespace-pre-wrap">
            {`Order: ${JSON.stringify(order, null, 2)}
Shipments: ${JSON.stringify(shipments, null, 2)}
Active Shipment: ${JSON.stringify(activeShipment, null, 2)}`}
          </pre>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;