import { getDisplayStatus, getStatusClass } from '../utils/orderUtils';

const OrderStatusBadge = ({ status, size = "md" }) => {
  // Handle all possible status formats
  const safeStatus = (typeof status === 'string')
    ? status
    : (typeof status === 'object' && status !== null) 
      ? status.status
      : 'PROCESSING';
      
  const normalizedStatus = safeStatus.toString().toUpperCase();
  
  if (process.env.NODE_ENV === 'development') {
    console.log("🎯 OrderStatusBadge received status:", status, typeof status);
    console.log("🎯 OrderStatusBadge normalized status:", normalizedStatus);
    console.log("🎯 OrderStatusBadge display text:", getDisplayStatus(normalizedStatus));
  }
  
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