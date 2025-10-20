// Implement a consistent status normalization function in a shared utility
// filepath: /Users/abioyebankole/fashion-app/frontend/src/utils/orderUtils.js
export const normalizeOrderStatus = (status) => {
  // Handle null/undefined/object cases
  if (!status) return 'PROCESSING';
  
  // Convert to string if it's not already
  const statusStr = typeof status === 'object' ? status.status?.toString() : status.toString();
  
  switch(statusStr.toUpperCase()) {
    case 'DRAFT': return 'PROCESSING';
    case 'PENDING': return 'PROCESSING';
    case 'CONFIRMED': return 'PROCESSING';
    case 'READY': return 'PICKUP_SCHEDULED';
    case 'READY_FOR_PICKUP': return 'PICKUP_SCHEDULED';
    case 'DISPATCHED': return 'SHIPPED';
    case 'IN_TRANSIT': return 'SHIPPED';
    case 'OUT_FOR_DELIVERY': return 'SHIPPED';
    default: return statusStr.toUpperCase();
  }
};

export const calculateAggregateOrderStatus = (items, orderStatus) => {
  // If no items or empty array, fall back to order status or default
  if (!items || !Array.isArray(items) || items.length === 0) {
    return normalizeOrderStatus(orderStatus) || 'PROCESSING';
  }
  
  // Extract item statuses, handling missing values
  const statuses = new Set();
  items.forEach(item => {
    if (item && item.status) {
      statuses.add(normalizeOrderStatus(item.status));
    }
  });
  
  console.log('Item statuses found:', Array.from(statuses));
  
  // If no valid statuses found in items, use order status
  if (statuses.size === 0) {
    return normalizeOrderStatus(orderStatus) || 'PROCESSING';
  }
  
  // Case 1: All items have the same status
  if (statuses.size === 1) {
    return Array.from(statuses)[0];
  }
  
  // Case 2: If any item is shipped or delivered, prioritize that
  if (statuses.has('SHIPPED')) {
    return 'SHIPPED';
  }
  
  if (statuses.has('PICKUP_SCHEDULED')) {
    return 'PICKUP_SCHEDULED';
  }
  
  // Case 3: Mix of delivered and cancelled
  if (statuses.size === 2 && 
      statuses.has('DELIVERED') && 
      statuses.has('CANCELLED')) {
    return 'DELIVERED';
  }
  
  // Case 4: If all cancelled
  if (statuses.size === 1 && statuses.has('CANCELLED')) {
    return 'CANCELLED';
  }
  
  // Default fallback
  return normalizeOrderStatus(orderStatus) || 'PROCESSING';
};

// Human-readable status mapping for display
export const getDisplayStatus = (status) => {
  if (typeof status === 'object' && status !== null) {
    status = status.status;
  }
  
  const statusString = status?.toString() || '';
  
  const displayMap = {
    'PENDING': 'Processing', // ✅ Changed from "Order Placed"
    'PROCESSING': 'Processing',
    'PICKUP_SCHEDULED': 'Pickup Scheduled',
    'SCHEDULED': 'Pickup Scheduled',
    'SHIPPED': 'Shipped',
    'IN_TRANSIT': 'Shipped',
    'OUT_FOR_DELIVERY': 'Shipped',
    'DELIVERED': 'Delivered',
    'CANCELLED': 'Cancelled',
    'COMPLETED': 'Completed',
    'PAID': 'Paid', // ✅ Add payment status mapping
    'UNPAID': 'Unpaid'
  };
  
  return displayMap[statusString.toUpperCase()] || statusString;
};

// Get status CSS classes
export const getStatusClass = (status) => {
  if (typeof status === 'object' && status !== null) {
    status = status.status;
  }
  
  const statusString = status?.toString() || '';
  
  const statusClass = {
    'PROCESSING': 'bg-yellow-100 text-yellow-800',
    'PICKUP_SCHEDULED': 'bg-blue-100 text-blue-800',
    'SHIPPED': 'bg-indigo-100 text-indigo-800',
    'DELIVERED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800'
  };
  
  return statusClass[statusString.toUpperCase()] || 'bg-gray-100 text-gray-800';
};