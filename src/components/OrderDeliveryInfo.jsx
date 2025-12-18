// Add this component to order details pages
// filepath: /Users/abioyebankole/fashion-app/frontend/src/components/OrderDeliveryInfo.jsx
import { formatDate } from '../utils/dateUtils';

const OrderDeliveryInfo = ({ order }) => {
  const getEstimatedDelivery = () => {
    // Check all possible locations for the delivery date
    if (order.estimatedDeliveryDate) return order.estimatedDeliveryDate;
    if (order.shipments?.[0]?.estimatedDeliveryDate) return order.shipments[0].estimatedDeliveryDate;
    if (order.shipments?.[0]?.estimatedDelivery) return order.shipments[0].estimatedDelivery;
    
    // Fallback: calculate based on order date if no explicit date is provided
    if (order.createdAt) {
      const date = new Date(order.createdAt);
      date.setDate(date.getDate() + 7); // Default to 7 days from order
      return date.toISOString();
    }
    
    return null;
  };

  const deliveryDate = getEstimatedDelivery();
  
  if (!deliveryDate) return null;
  
  return (
    <div className="mt-4">
      <h3 className="text-md font-semibold mb-2">Estimated Delivery</h3>
      <div className="flex items-center bg-gray-50 p-3 rounded">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm">{formatDate(deliveryDate)}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDeliveryInfo;