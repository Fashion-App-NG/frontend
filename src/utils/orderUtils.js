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

// ✅ NEW: Calculate Order-Level Status (not item status)
export const calculateOrderStatus = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return 'PROCESSING';
  }
  
  // Normalize all item statuses
  const normalizedStatuses = items.map(item => 
    normalizeOrderStatus(item.status || 'PROCESSING')
  );
  
  // Count each status type
  const statusCounts = {
    PROCESSING: normalizedStatuses.filter(s => s === 'PROCESSING').length,
    PICKUP_SCHEDULED: normalizedStatuses.filter(s => s === 'PICKUP_SCHEDULED').length,
    SHIPPED: normalizedStatuses.filter(s => s === 'SHIPPED').length,
    DELIVERED: normalizedStatuses.filter(s => s === 'DELIVERED').length,
    CANCELLED: normalizedStatuses.filter(s => s === 'CANCELLED').length
  };
  
  const totalItems = items.length;
  
  console.log('📊 Order Status Calculation:', {
    totalItems,
    statusCounts,
    normalizedStatuses
  });
  
  // STATE MACHINE LOGIC
  
  // Rule 1: All items DELIVERED → Order is DELIVERED
  if (statusCounts.DELIVERED === totalItems) {
    console.log('✅ Order Status: DELIVERED (all items delivered)');
    return 'DELIVERED';
  }
  
  // Rule 2: All items CANCELLED → Order is CANCELLED
  if (statusCounts.CANCELLED === totalItems) {
    console.log('❌ Order Status: CANCELLED (all items cancelled)');
    return 'CANCELLED';
  }
  
  // Rule 3: All items finished (DELIVERED or CANCELLED) → Order is COMPLETED
  if (statusCounts.DELIVERED + statusCounts.CANCELLED === totalItems) {
    console.log('✅ Order Status: COMPLETED (mixed: delivered + cancelled)');
    return 'COMPLETED';
  }
  
  // Rule 4: Any item beyond PROCESSING → Order is IN_PROGRESS
  if (statusCounts.PICKUP_SCHEDULED > 0 || 
      statusCounts.SHIPPED > 0 || 
      statusCounts.DELIVERED > 0) {
    console.log('🚀 Order Status: IN_PROGRESS (some items moving)');
    return 'IN_PROGRESS';
  }
  
  // Rule 5: All items still PROCESSING → Order is PROCESSING
  if (statusCounts.PROCESSING === totalItems) {
    if (process.env.NODE_ENV === 'development') {
      console.log('⏳ Order Status: PROCESSING (all items being prepared)');
    }
    return 'PROCESSING';
  }
  
  // Fallback (should rarely hit this)
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️ Order Status: Default to IN_PROGRESS');
  }
  return 'IN_PROGRESS';
};

// ✅ DEPRECATED: Rename old function for backward compatibility
export const calculateAggregateOrderStatus = calculateOrderStatus;

// Human-readable status mapping for display
export const getDisplayStatus = (status) => {
  if (typeof status === 'object' && status !== null) {
    status = status.status;
  }
  
  const statusString = status?.toString() || '';
  
  const displayMap = {
    'PENDING': 'Processing',
    'PROCESSING': 'Processing',
    'IN_PROGRESS': 'In Progress', // ✅ NEW
    'PICKUP_SCHEDULED': 'Pickup Scheduled',
    'SCHEDULED': 'Pickup Scheduled',
    'SHIPPED': 'Shipped',
    'IN_TRANSIT': 'Shipped',
    'OUT_FOR_DELIVERY': 'Shipped',
    'DELIVERED': 'Delivered',
    'CANCELLED': 'Cancelled',
    'COMPLETED': 'Completed', // ✅ NEW
    'PAID': 'Paid',
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
    'IN_PROGRESS': 'bg-blue-100 text-blue-800', // ✅ NEW
    'PICKUP_SCHEDULED': 'bg-purple-100 text-purple-800',
    'SHIPPED': 'bg-indigo-100 text-indigo-800',
    'DELIVERED': 'bg-green-100 text-green-800',
    'COMPLETED': 'bg-green-100 text-green-800', // ✅ NEW
    'CANCELLED': 'bg-red-100 text-red-800'
  };
  
  return statusClass[statusString.toUpperCase()] || 'bg-gray-100 text-gray-800';
};