// Implement a consistent status normalization function in a shared utility
// filepath: /Users/abioyebankole/fashion-app/frontend/src/utils/orderUtils.js
export const normalizeOrderStatus = (order) => {
  // If items have different statuses, derive the overall status
  if (order.items?.some(item => item.status === "PROCESSING")) {
    return "PROCESSING";
  }
  
  // If shipments exist and any shipment is in transit
  if (order.shipments?.length > 0) {
    if (order.shipments.some(s => s.status === "IN_TRANSIT")) {
      return "IN_TRANSIT";
    }
  }
  
  return order.status;
};

// Then use this function wherever order status is displayed