import { getDisplayStatus } from '../utils/orderUtils';

const OrderTrackingProgress = ({ status }) => {
  // Normalize shipment statuses to standard progress steps
  const normalizeStatus = (status) => {
    const statusUpper = status?.toUpperCase();
    
    // Map shipment-specific statuses to standard progress steps
    const statusMapping = {
      'CONFIRMED': 'CONFIRMED',
      'PROCESSING': 'PROCESSING',
      'PICKUP_SCHEDULED': 'PROCESSING',
      'PICKED_UP': 'SHIPPED',
      'SHIPPED': 'SHIPPED',
      'IN_TRANSIT': 'SHIPPED',
      'OUT_FOR_DELIVERY': 'SHIPPED',
      'DELIVERED': 'DELIVERED',
      'CANCELLED': 'CANCELLED'
    };
    
    return statusMapping[statusUpper] || 'CONFIRMED';
  };
  
  const normalizedStatus = normalizeStatus(status);
  const isCancelled = normalizedStatus === 'CANCELLED';
  
  const getProgressPercentage = () => {
    switch(normalizedStatus) {
      case 'CONFIRMED': 
      case 'PROCESSING': return 25;
      
      case 'SHIPPED': return 75;
      
      case 'DELIVERED': return 100;
      
      case 'CANCELLED': return 100;
      
      default: return 0;
    }
  };

  // Use normalized status for display to avoid showing raw shipment statuses
  const displayText = getDisplayStatus(normalizedStatus);
  const progressPercentage = getProgressPercentage();
  
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{displayText}</span>
        <span className="text-sm font-medium">{progressPercentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${
            isCancelled ? 'bg-red-600' : 
            'bg-blue-600'
          }`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default OrderTrackingProgress;