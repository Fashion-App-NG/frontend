const OrderTrackingMap = ({ shipment }) => {
  if (!shipment?.location) return null;
  
  return (
    <div className="mt-4 border rounded-lg overflow-hidden">
      <div className="p-3 bg-gray-50 border-b">
        <h3 className="font-medium text-sm">Shipment Location</h3>
      </div>
      <div className="h-48 bg-gray-100 relative">
        {/* This would be replaced with actual map implementation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-gray-500">Map showing package location would appear here</p>
        </div>
      </div>
    </div>
  );
};