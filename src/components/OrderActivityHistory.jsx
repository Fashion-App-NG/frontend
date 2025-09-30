const OrderActivityHistory = ({ activities }) => {
  if (!activities?.length) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4">Activity History</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start">
            <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-200 mt-1"></div>
            <div className="ml-3">
              <p className="text-sm font-medium">{activity.description}</p>
              <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderActivityHistory;