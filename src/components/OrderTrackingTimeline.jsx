import { formatDate } from '../utils/dateUtils';

const ORDER_TRACKING_STATUSES = [
  { key: "PROCESSING", label: "Processing Order" },
  { key: "READY_FOR_PICKUP", label: "Ready for pickup" },
  { key: "DISPATCHED", label: "Order Dispatch" },
  { key: "DELIVERED", label: "Delivered" }
];

const normalizeOrderStatus = (status) => {
  switch(status?.toUpperCase()) {
    case 'DRAFT': return 'CONFIRMED';
    default: return status;
  }
};

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

  const normalizedStatus = normalizeOrderStatus(order.status);

  // Add to OrderTrackingTimeline component
  if (!tracking?.length) {
    return (
      <div className="py-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500 text-sm">No detailed tracking information available yet.</p>
        <p className="text-gray-400 text-xs mt-1">Check back later for updates.</p>
      </div>
    );
  }

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

      {/* Status badge display */}
      <div className="mt-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          normalizedStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
          normalizedStatus === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
          normalizedStatus === 'CONFIRMED' ? 'bg-yellow-100 text-yellow-800' :
          normalizedStatus === 'IN_TRANSIT' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {normalizedStatus?.replace(/_/g, ' ')}
        </span>
      </div>
    </div>
  );
};

export default OrderTrackingTimeline;