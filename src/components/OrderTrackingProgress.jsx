import { getDisplayStatus } from '../utils/orderUtils';

const OrderTrackingProgress = ({ status }) => {
  const getProgressPercentage = () => {
    const normalizedStatus = status?.toUpperCase();
    
    switch(normalizedStatus) {
      case 'PENDING': 
      case 'PROCESSING': return 25;
      
      case 'IN_PROGRESS': return 50; // ✅ NEW
      
      case 'PICKUP_SCHEDULED': return 60;
      
      case 'SHIPPED':
      case 'IN_TRANSIT': return 75;
      
      case 'DELIVERED': return 100;
      
      case 'COMPLETED': return 100; // ✅ NEW
      
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
            status?.toUpperCase() === 'CANCELLED' ? 'bg-red-600' : 
            status?.toUpperCase() === 'COMPLETED' ? 'bg-green-600' :
            'bg-blue-600'
          }`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default OrderTrackingProgress;