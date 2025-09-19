import { formatDate } from '../utils/dateUtils';

const ORDER_TRACKING_STATUSES = [
  { key: "PROCESSING", label: "Processing Order" },
  { key: "READY_FOR_PICKUP", label: "Ready for pickup" },
  { key: "DISPATCHED", label: "Order Dispatch" },
  { key: "DELIVERED", label: "Delivered" }
];

const OrderTrackingTimeline = ({ order, tracking, status }) => {
  // If tracking data is provided, use that (for shipments)
  if (tracking) {
    return (
      <div className="py-4">
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute h-full w-0.5 bg-gray-200 left-2.5 top-0"></div>
          
          {/* Status points */}
          {tracking.map((event, index) => (
            <div key={index} className="flex items-start mb-8 relative">
              {/* Status circle */}
              <div className={`relative z-10 rounded-full h-5 w-5 flex items-center justify-center bg-black`}></div>
              
              {/* Status content */}
              <div className="ml-4">
                <div className="flex items-center">
                  <h3 className="font-medium text-black">
                    {event.status?.replace(/_/g, ' ')}
                  </h3>
                  {event.location && (
                    <span className="ml-2 text-xs text-gray-500">
                      {event.location}
                    </span>
                  )}
                </div>
                {event.timestamp && (
                  <p className="text-xs text-gray-500 mt-1">{formatDate(event.timestamp)}</p>
                )}
                {event.description && (
                  <p className="text-sm text-gray-700 mt-1">{event.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback to order-based tracking for backward compatibility
  const getCurrentStatusIndex = () => {
    switch (order.status) {
      case "PROCESSING": return 0;
      case "READY_FOR_PICKUP": return 1;
      case "SHIPPED": // Map SHIPPED to DISPATCHED for display
      case "DISPATCHED": return 2;
      case "DELIVERED": return 3;
      default: return -1; // For other statuses like CANCELLED, PENDING, etc.
    }
  };

  const currentStatusIndex = getCurrentStatusIndex();
  
  // Helper function to get formatted timestamp for a status update
  const getStatusTimestamp = (status) => {
    const statusUpdate = order.statusUpdates?.find(update => update.status === status);
    return statusUpdate ? formatDate(statusUpdate.timestamp) : null;
  };

  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold mb-6">
        Tracking ID: {order.trackingId || order._id?.substring(0, 7).toUpperCase()}
      </h2>
      
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute h-full w-0.5 bg-gray-200 left-2.5 top-0"></div>
        
        {/* Status points */}
        {ORDER_TRACKING_STATUSES.map((status, index) => {
          const isCompleted = index <= currentStatusIndex;
          const timestamp = getStatusTimestamp(status.key);
          
          return (
            <div key={status.key} className="flex items-start mb-8 relative">
              {/* Status circle */}
              <div className={`relative z-10 rounded-full h-5 w-5 flex items-center justify-center ${
                isCompleted ? "bg-black" : "bg-white border border-gray-300"
              }`}></div>
              
              {/* Status content */}
              <div className="ml-4">
                <h3 className={`font-medium ${isCompleted ? "text-black" : "text-gray-400"}`}>
                  {status.label}
                </h3>
                {isCompleted && timestamp && (
                  <p className="text-xs text-gray-500 mt-1">{timestamp}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTrackingTimeline;