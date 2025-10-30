import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import OrderBreadcrumbs from '../components/OrderBreadcrumbs';
import OrderDeliveryInfo from '../components/OrderDeliveryInfo';
import OrderStatusBadge from '../components/OrderStatusBadge';
import checkoutService from "../services/checkoutService";
import { formatPrice } from "../utils/formatPrice";
import { calculateOrderStatus } from '../utils/orderUtils';
import { calculateSubtotal } from "../utils/priceCalculations";

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
        console.log("FULL API RESPONSE:", JSON.stringify(data, null, 2));
        
        const orderData = data.order || data;
        
        // ✅ FIX: Use backend status if available, only apply demo logic as fallback
        if (orderData.items && orderData.items.length > 0) {
          orderData.items = orderData.items.map((item, index) => {
            // ✅ Use backend status if it exists
            if (item.status) {
              console.log(`Item ${item.name} using backend status:`, item.status);
              return { 
                ...item, 
                vendorName: item.vendorName || 'Unknown Vendor'
              };
            }
            
            // ⚠️ Only apply demo logic if backend doesn't provide status
            console.warn(`Item ${item.name} missing backend status, applying demo logic`);
            let status = 'PROCESSING';
            
            if (orderData.orderNumber.includes('250918')) {
              status = 'DELIVERED';
            } else if (orderData.orderNumber.includes('250916')) {
              if (orderData.orderNumber.endsWith('0007')) {
                status = 'CANCELLED';
              } else if (orderData.orderNumber.endsWith('0006')) {
                status = 'PROCESSING';
              } else {
                status = 'DELIVERED';
              }
            } else if (orderData.orderNumber.includes('250923')) {
              status = index % 2 === 0 ? 'PROCESSING' : 'CONFIRMED';
            }
            
            console.log(`Item ${item.name} using demo status:`, status);
            
            return { 
              ...item, 
              status,
              vendorName: item.vendorName || 'Unknown Vendor'
            };
          });
        }
        
        const orderStatus = calculateOrderStatus(orderData.items);
        console.log("Details page calculated order status:", orderStatus);
        console.log("Item statuses after processing:", orderData.items.map(i => ({ 
          name: i.name, 
          status: i.status 
        })));

        const processedOrder = { 
          ...orderData, 
          status: orderStatus
        };
        
        setOrder(processedOrder);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to fetch order.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const groupItemsByVendor = (items) => {
    const vendorGroups = {};
    items.forEach(item => {
      const vendorId = item.vendorId;
      if (!vendorGroups[vendorId]) {
        // ✅ Get vendor name from shipments
        const shipment = order?.shipments?.find(s => s.vendorId === vendorId);
        const vendorName = shipment?.vendorName || item.vendorName || "Unknown Vendor";
        
        vendorGroups[vendorId] = {
          vendorId,
          vendorName,
          items: [],
          status: item.status || 'PROCESSING'
        };
      }
      vendorGroups[vendorId].items.push(item);
      
      if (item.status === 'PROCESSING' || item.status === 'IN_PROGRESS') {
        vendorGroups[vendorId].status = 'PROCESSING';
      }
    });
    return Object.values(vendorGroups);
  };

  const calculateOrderSubtotal = (items, orderTaxAmount, orderTaxRate) => {
    // Calculate base subtotal (without tax)
    const baseSubtotal = items.reduce((total, item) => {
      return total + (item.pricePerYard * item.quantity);
    }, 0);
    
    // Calculate total platform fees
    const totalPlatformFees = items.reduce((total, item) => {
      return total + (item.platformFeeAmount || 0);
    }, 0);
    
    // ✅ Use order-level taxAmount from API
    const taxTotal = orderTaxAmount || 0;
    
    return baseSubtotal + taxTotal + totalPlatformFees;
  };

  // ✅ Calculate tax per item proportionally for display
  const getItemTaxAmount = (item, orderTaxAmount, items) => {
    if (!orderTaxAmount) return 0;
    
    // Calculate this item's proportion of total base price
    const totalBasePrice = items.reduce((sum, i) => sum + (i.pricePerYard * i.quantity), 0);
    const itemBasePrice = item.pricePerYard * item.quantity;
    const proportion = itemBasePrice / totalBasePrice;
    
    // Allocate tax proportionally
    return orderTaxAmount * proportion;
  };

  // Update the display price function
  const getDisplayPricePerYard = (item, orderTaxAmount, items) => {
    const basePrice = item.pricePerYard || 0;
    const platformFeePerYard = (item.platformFeeAmount || 0) / (item.quantity || 1);
    
    // ✅ Calculate tax per yard from proportional allocation
    const itemTaxTotal = getItemTaxAmount(item, orderTaxAmount, items);
    const taxPerYard = itemTaxTotal / (item.quantity || 1);
    
    return basePrice + taxPerYard + platformFeePerYard;
  };

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

  const vendorGroups = groupItemsByVendor(order.items);

  // Debugging output before rendering
  console.log("Final order object used for rendering:", order);
  console.log("Order status being displayed:", order?.status);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:underline mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-1" />
        Back to Orders
      </button>
      <OrderBreadcrumbs 
        orderId={order.id || order._id}
        orderNumber={order.orderNumber}
        currentPage="details" 
      />
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
            <div className="font-semibold text-blue-700">{formatPrice(order.totalWithShipping || order.totalAmount || calculateSubtotal(order.items))}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Status</div>
            <OrderStatusBadge status={order.status} size="lg" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Payment</div>
            {/* ✅ Use OrderStatusBadge for payment status too */}
            <OrderStatusBadge status={order.paymentStatus || 'COMPLETED'} />
          </div>
        </div>
        
        {/* ADD PRICE BREAKDOWN SECTION */}
        <div className="mb-4 border-t pt-4">
          <div className="text-xs text-gray-500 mb-2">Price Breakdown</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal (items):</span>
              <span className="font-medium">
                {formatPrice(calculateOrderSubtotal(order.items, order.taxAmount, order.taxRate))}
              </span>
            </div>
            {order.shippingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee:</span>
                <span className="font-medium">{formatPrice(order.shippingCost)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-900 font-semibold">Total:</span>
              <span className="text-blue-700 font-bold">{formatPrice(order.totalWithShipping || order.totalAmount)}</span>
            </div>
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
          {/* Group items by vendor */}
          {vendorGroups.map(group => (
            <div key={group.vendorId} className="mb-6 border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">{group.vendorName}</h3>
                <OrderStatusBadge status={group.status} />
              </div>
              
              {/* List items from this vendor */}
              <div className="items">
                {group.items.map((item) => {
                  const displayPrice = getDisplayPricePerYard(item, order.taxAmount, order.items);
                  const basePrice = item.pricePerYard || 0;
                  const itemTaxTotal = getItemTaxAmount(item, order.taxAmount, order.items);
                  const taxPerYard = itemTaxTotal / (item.quantity || 1);
                  const platformFeePerYard = (item.platformFeeAmount || 0) / (item.quantity || 1);
                  
                  return (
                    <div key={item.productId} className="py-2">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} yard{item.quantity > 1 ? 's' : ''} × {formatPrice(displayPrice)}/yard
                        <span className="text-xs text-gray-500 ml-1">(incl. fees & tax)</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Base: {formatPrice(basePrice)} + Tax: {formatPrice(taxPerYard)} + Fee: {formatPrice(platformFeePerYard)}
                      </p>
                      <p className="font-semibold text-blue-600">
                        {formatPrice(displayPrice * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>
              
              {/* Track button per vendor */}
              <Link 
                to={`/shopper/orders/${order.id || order._id}/tracking/${group.vendorId}`}
                className="inline-flex items-center px-3 py-1 mt-2 text-sm border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Track Items
              </Link>
            </div>
          ))}
        </div>
        <OrderDeliveryInfo order={order} />
        {/* ✅ Show Track Complete Order for ALL paid orders */}
        {order.paymentStatus === "PAID" && (
          <Link 
            to={`/shopper/orders/${order.orderId || order._id || order.id}/tracking`}
            state={{ orderId: order.orderId || order._id || order.id, orderNumber: order.orderNumber }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Track Complete Order
          </Link>
        )}
      </div>
    </div>
  );
};

export default ShopperOrderDetails;