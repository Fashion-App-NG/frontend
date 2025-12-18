import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';

const ShopperProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    profilePicture: ''
  });

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nigeria',
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    orderUpdates: true,
    productRecommendations: false,
    newsletterSubscription: false
  });

  // Load user data on mount
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Fetch user profile
        const profileData = await userService.getUserProfile(user.id);
        
        if (profileData.success && profileData.data) {
          const userData = profileData.data;
          setPersonalInfo({
            email: userData.email || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phone: userData.phone || '',
            profilePicture: userData.profilePicture || ''
          });
        }

        // Fetch delivery address
        try {
          const addressData = await userService.getShopperDeliveryAddress(user.id);
          if (addressData && addressData.data) {
            setDeliveryAddress(addressData.data);
          }
        } catch (error) {
          console.log('No delivery address saved yet');
        }

      } catch (error) {
        console.error('Failed to load profile data:', error);
        setMessage({ type: 'error', text: 'Failed to load profile data' });
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user?.id]);

  // Handle personal info update
  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await userService.updateUserProfile(user.id, {
        email: personalInfo.email,
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        phone: personalInfo.phone,
        profilePicture: personalInfo.profilePicture
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Personal information updated successfully!' });
        
        // Update auth context
        if (updateUser) {
          updateUser({
            ...user,
            email: personalInfo.email,
            firstName: personalInfo.firstName,
            lastName: personalInfo.lastName,
            phone: personalInfo.phone
          });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update personal information' });
    } finally {
      setSaving(false);
    }
  };

  // Handle delivery address update
  const handleDeliveryAddressSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await userService.updateShopperDeliveryAddress(user.id, deliveryAddress);

      if (response.success) {
        setMessage({ type: 'success', text: 'Delivery address updated successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update delivery address' });
    } finally {
      setSaving(false);
    }
  };

  // Handle preferences update
  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await userService.updateUserPreferences(user.id, preferences);

      if (response.success) {
        setMessage({ type: 'success', text: 'Preferences updated successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update preferences' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile & Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Success/Error Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            <span className="text-xl mr-2">{message.type === 'success' ? '✅' : '❌'}</span>
            <p className="font-medium">{message.text}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'personal'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              👤 Personal Information
            </button>
            <button
              onClick={() => setActiveTab('address')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'address'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              📍 Delivery Address
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'preferences'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              ⚙️ Preferences
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Account Type</p>
                  <p className="font-semibold text-gray-900 capitalize">{user?.role || 'Shopper'}</p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      💾 Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Delivery Address Tab */}
          {activeTab === 'address' && (
            <form onSubmit={handleDeliveryAddressSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.city}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Lagos"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.state}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Lagos"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.zipCode}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="100001"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.country}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nigeria"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={deliveryAddress.phone}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+234 800 000 0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={deliveryAddress.email}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="delivery@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      💾 Save Address
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <form onSubmit={handlePreferencesSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      <span className="font-medium">Email notifications for new products</span>
                      <p className="text-gray-500 text-xs mt-1">Receive emails when new products match your interests</p>
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.orderUpdates}
                      onChange={(e) => setPreferences({ ...preferences, orderUpdates: e.target.checked })}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      <span className="font-medium">Order status updates</span>
                      <p className="text-gray-500 text-xs mt-1">Get notified about order confirmations, shipments, and deliveries</p>
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.productRecommendations}
                      onChange={(e) => setPreferences({ ...preferences, productRecommendations: e.target.checked })}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      <span className="font-medium">Product recommendations</span>
                      <p className="text-gray-500 text-xs mt-1">Receive personalized product suggestions based on your browsing</p>
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.newsletterSubscription}
                      onChange={(e) => setPreferences({ ...preferences, newsletterSubscription: e.target.checked })}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      <span className="font-medium">Newsletter subscription</span>
                      <p className="text-gray-500 text-xs mt-1">Stay updated with our latest news, trends, and special offers</p>
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      💾 Save Preferences
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopperProfile;