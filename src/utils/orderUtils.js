// Implement a consistent status normalization function in a shared utility
// filepath: /Users/abioyebankole/fashion-app/frontend/src/utils/orderUtils.js
export const normalizeOrderStatus = (status) => {
  // Handle null/undefined/object cases
  if (!status) return 'CONFIRMED';
  
  // Convert to string if it's not already
  const statusStr = typeof status === 'object' ? status.status?.toString() : status.toString();
  
  switch(statusStr.toUpperCase()) {
    case 'DRAFT': return 'CONFIRMED';
    case 'PENDING': return 'CONFIRMED';
    case 'DISPATCHED': return 'SHIPPED';
    default: return statusStr.toUpperCase();
  }
};

export const calculateAggregateOrderStatus = (items, orderStatus) => {
  // If no items or empty array, fall back to order status or default
  if (!items || !Array.isArray(items) || items.length === 0) {
    return normalizeOrderStatus(orderStatus) || 'CONFIRMED';
  }
  
  // Extract item statuses, handling missing values
  const statuses = new Set();
  items.forEach(item => {
    // If item has status property and it's not empty
    if (item && item.status) {
      statuses.add(normalizeOrderStatus(item.status));
    }
  });
  
  console.log('Item statuses found:', Array.from(statuses));
  
  // If no valid statuses found in items, use order status
  if (statuses.size === 0) {
    return normalizeOrderStatus(orderStatus) || 'CONFIRMED';
  }
  
  // Now apply business rules for status calculation
  // Case 1: All items have the same status
  if (statuses.size === 1) {
    return Array.from(statuses)[0];
  }
  
  // Case 2: If any item is in progress/shipped/transit
  if (statuses.has('PROCESSING') || statuses.has('SHIPPED') || statuses.has('IN_TRANSIT')) {
    return 'PROCESSING';
  }
  
  // Case 3: Mix of delivered and cancelled
  if (statuses.size === 2 && 
      statuses.has('DELIVERED') && 
      statuses.has('CANCELLED')) {
    return 'COMPLETED';
  }
  
  // Case 4: If any items still CONFIRMED but others in different status
  if (statuses.has('CONFIRMED')) {
    return 'PROCESSING'; // Some in process, some still pending
  }
  
  // Default fallback
  return normalizeOrderStatus(orderStatus) || 'PROCESSING';
};

// Human-readable status mapping for display
export const getDisplayStatus = (status) => {
  // Handle cases where we receive an object
  if (typeof status === 'object' && status !== null) {
    status = status.status;
  }
  
  const statusString = status?.toString() || '';
  
  const displayMap = {
    'CONFIRMED': 'Order Confirmed',
    'PROCESSING': 'In Progress',
    'SHIPPED': 'Shipped',
    'IN_TRANSIT': 'In Transit',
    'DELIVERED': 'Delivered',
    'CANCELLED': 'Cancelled',
    'COMPLETED': 'Completed'
  };
  
  return displayMap[statusString.toUpperCase()] || statusString;
};

// Get status CSS classes
export const getStatusClass = (status) => {
  // Handle cases where we receive an object
  if (typeof status === 'object' && status !== null) {
    status = status.status;
  }
  
  const statusString = status?.toString() || '';
  
  const statusClass = {
    'CONFIRMED': 'bg-blue-100 text-blue-800',
    'PROCESSING': 'bg-yellow-100 text-yellow-800',
    'SHIPPED': 'bg-indigo-100 text-indigo-800',
    'IN_TRANSIT': 'bg-indigo-100 text-indigo-800',
    'DELIVERED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'COMPLETED': 'bg-green-100 text-green-800'
  };
  
  return statusClass[statusString.toUpperCase()] || 'bg-gray-100 text-gray-800';
};