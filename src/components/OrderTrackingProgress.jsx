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
      
      case 'DELIVERED': return 100;
      
      default: return 0;
    }
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
        style={{ width: `${getProgressPercentage()}%` }}
      ></div>
    </div>
  );
};

export default OrderTrackingProgress;

// Add to OrderTrackingPage.jsx
//<OrderTrackingProgress status={order.status} />