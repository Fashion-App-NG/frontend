const OrderStatusBadge = ({ status, size = 'md' }) => {
  const normalizedStatus = status?.toUpperCase() || 'PENDING';
  
  const getStatusColor = () => {
    switch(normalizedStatus) {
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED': return 'bg-yellow-100 text-yellow-800';
      case 'SHIPPED':
      case 'IN_TRANSIT': 
      case 'DISPATCHED': return 'bg-purple-100 text-purple-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const sizeClasses = {
    'sm': 'px-2 py-0.5 text-xs',
    'md': 'px-2.5 py-0.5 text-sm',
    'lg': 'px-3 py-1 text-base'
  };
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${getStatusColor()} ${sizeClasses[size]}`}>
      {normalizedStatus.replace(/_/g, ' ')}
    </span>
  );
};

export default OrderStatusBadge;