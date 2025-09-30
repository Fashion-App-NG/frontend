import { getDisplayStatus, getStatusClass } from '../utils/orderUtils';

const OrderStatusBadge = ({ status, size = "md" }) => {
  // Debug what's being passed in
  console.log("OrderStatusBadge received status:", status);
  
  // Handle all possible status formats
  const safeStatus = (typeof status === 'string')
    ? status
    : (typeof status === 'object' && status !== null) 
      ? status.status
      : 'CONFIRMED';
      
  const normalizedStatus = safeStatus.toString().toUpperCase();
  
  // Get display text and CSS class
  const displayStatus = getDisplayStatus(normalizedStatus);
  const badgeClass = getStatusClass(normalizedStatus);
  
  return (
    <span className={`inline-flex items-center rounded-full 
      ${size === "lg" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"} 
      font-medium ${badgeClass}`}>
      {displayStatus}
    </span>
  );
};

export default OrderStatusBadge;