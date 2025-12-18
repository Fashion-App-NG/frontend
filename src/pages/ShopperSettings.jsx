import { useAuth } from '../contexts/AuthContext';

const ShopperSettings = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences</p>
      </div>

      <div className="space-y-6">
        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{user?.email || 'Not provided'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <p className="text-gray-900 capitalize">{user?.role || 'shopper'}</p>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" defaultChecked />
              <span className="ml-2 text-sm text-gray-700">Email notifications for new products</span>
            </label>
            
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" defaultChecked />
              <span className="ml-2 text-sm text-gray-700">Order status updates</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopperSettings;