import { getDisplayStatus } from '../utils/orderUtils';

const OrderTrackingProgress = ({ status }) => {
  const getProgressPercentage = () => {
    // Normalize status to ensure consistent display
    const normalizedStatus = status?.toUpperCase();
    
    switch(normalizedStatus) {
      case 'CONFIRMED': 
      case 'PENDING': return 25;
      
      case 'PROCESSING': return 50;
      
      case 'SHIPPED':
      case 'DISPATCHED':
      case 'IN_TRANSIT': return 75;
      
      case 'DELIVERED':
      case 'COMPLETED': return 100;
      
      case 'CANCELLED': return 100;
      
      default: return 0;
    }
  };

  const displayText = getDisplayStatus(status);
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
            status?.toUpperCase() === 'CANCELLED' ? 'bg-red-600' : 'bg-blue-600'
          }`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default OrderTrackingProgress;

// Add to OrderTrackingPage.jsx
//<OrderTrackingProgress status={order.status} />