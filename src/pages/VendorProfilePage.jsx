import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRequireAuth } from '../hooks/useRequireAuth';
import userService from '../services/userService';
import { validateVendorProfileCompleteness } from '../utils/validationUtils';

const VendorProfilePage = () => {
  // ✅ One line replaces all the auth checking!
  const { user, loading, isAuthorized } = useRequireAuth({
    requiredRole: 'vendor',
    redirectTo: '/login/vendor'
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const [formData, setFormData] = useState({
    storeName: '',
    pickupAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Nigeria',
      isDefault: true
    },
    businessInfo: {
      businessType: 'INDIVIDUAL',
      taxId: '',
      bankDetails: {
        accountNumber: '',
        accountName: '',
        bankName: '',
        bankCode: ''
      },
      contactPerson: {
        name: '',
        phone: '',
        email: ''
      }
    },
    description: '',
    socialMedia: {
      website: '',
      instagram: '',
      facebook: '',
      twitter: ''
    }
  });

  const businessTypes = [
    { value: 'INDIVIDUAL', label: 'Individual/Sole Proprietor' },
    { value: 'CORPORATE', label: 'Corporate/Limited Company' },
    { value: 'PARTNERSHIP', label: 'Partnership' }
  ];

  // Load vendor profile data
  useEffect(() => {
    const fetchVendorProfile = async () => {
      if (!user?.id) return;
      
      try {
        const response = await userService.getVendorProfile();
        
        if (response.success && response.data) {
          const profileData = response.profile || response.data;
          
          setFormData({
            storeName: profileData.storeName || user?.storeName || '',
            pickupAddress: {
              street: profileData.pickupAddress?.street || '',
              city: profileData.pickupAddress?.city || '',
              state: profileData.pickupAddress?.state || '',
              zipCode: profileData.pickupAddress?.zipCode || '',
              country: profileData.pickupAddress?.country || 'Nigeria',
              isDefault: profileData.pickupAddress?.isDefault !== false
            },
            businessInfo: {
              businessType: profileData.businessInfo?.businessType || 'INDIVIDUAL',
              taxId: profileData.businessInfo?.taxId || '',
              bankDetails: {
                accountNumber: profileData.businessInfo?.bankDetails?.accountNumber || '',
                accountName: profileData.businessInfo?.bankDetails?.accountName || '',
                bankName: profileData.businessInfo?.bankDetails?.bankName || '',
                bankCode: profileData.businessInfo?.bankDetails?.bankCode || ''
              },
              contactPerson: {
                name: profileData.businessInfo?.contactPerson?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '',
                phone: profileData.businessInfo?.contactPerson?.phone || user?.phone || '',
                email: profileData.businessInfo?.contactPerson?.email || user?.email || ''
              }
            },
            description: profileData.description || '',
            socialMedia: {
              website: profileData.socialMedia?.website || '',
              instagram: profileData.socialMedia?.instagram || '',
              facebook: profileData.socialMedia?.facebook || '',
              twitter: profileData.socialMedia?.twitter || ''
            }
          });
        } else {
          setFormData(prev => ({
            ...prev,
            storeName: user?.storeName || '',
            businessInfo: {
              ...prev.businessInfo,
              contactPerson: {
                name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '',
                phone: user?.phone || '',
                email: user?.email || ''
              }
            }
          }));
        }
      } catch (error) {
        toast.error('Failed to load profile data');
        console.error('Error loading profile:', error);
      }
    };

    fetchVendorProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      
      if (parts.length === 2) {
        setFormData(prev => ({
          ...prev,
          [parts[0]]: {
            ...prev[parts[0]],
            [parts[1]]: value
          }
        }));
      } else if (parts.length === 3) {
        setFormData(prev => ({
          ...prev,
          [parts[0]]: {
            ...prev[parts[0]],
            [parts[1]]: {
              ...prev[parts[0]]?.[parts[1]],
              [parts[2]]: value
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const validation = validateVendorProfileCompleteness(formData);
      
      if (!validation.isComplete) {
        toast.warning(`Profile incomplete: ${validation.missingFields.join(', ')}`);
      }

      const response = await userService.updateVendorProfile(formData);
      
      if (response.success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  // ✅ Show loading spinner while auth checks
  if (loading || !isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Store Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name *
              </label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your store name"
                required
              />
            </div>

            {/* Store Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Tell customers about your store"
              />
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Person</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="businessInfo.contactPerson.name"
                value={formData.businessInfo.contactPerson.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="businessInfo.contactPerson.phone"
                value={formData.businessInfo.contactPerson.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="businessInfo.contactPerson.email"
                value={formData.businessInfo.contactPerson.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        );

      case 'pickup':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Address</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                name="pickupAddress.street"
                value={formData.pickupAddress.street}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="pickupAddress.city"
                  value={formData.pickupAddress.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="pickupAddress.state"
                  value={formData.pickupAddress.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip Code
                </label>
                <input
                  type="text"
                  name="pickupAddress.zipCode"
                  value={formData.pickupAddress.zipCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  name="pickupAddress.country"
                  value={formData.pickupAddress.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'business':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type *
              </label>
              <select
                name="businessInfo.businessType"
                value={formData.businessInfo.businessType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                {businessTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID / Business Registration Number
              </label>
              <input
                type="text"
                name="businessInfo.taxId"
                value={formData.businessInfo.taxId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Optional"
              />
            </div>

            <h4 className="text-md font-semibold text-gray-900 mt-6 mb-4">Bank Details</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number *
              </label>
              <input
                type="text"
                name="businessInfo.bankDetails.accountNumber"
                value={formData.businessInfo.bankDetails.accountNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name *
              </label>
              <input
                type="text"
                name="businessInfo.bankDetails.accountName"
                value={formData.businessInfo.bankDetails.accountName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name *
              </label>
              <input
                type="text"
                name="businessInfo.bankDetails.bankName"
                value={formData.businessInfo.bankDetails.bankName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="socialMedia.website"
                value={formData.socialMedia.website}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="text"
                name="socialMedia.instagram"
                value={formData.socialMedia.instagram}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="@yourusername"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <input
                type="text"
                name="socialMedia.facebook"
                value={formData.socialMedia.facebook}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="facebook.com/yourpage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter
              </label>
              <input
                type="text"
                name="socialMedia.twitter"
                value={formData.socialMedia.twitter}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="@yourusername"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="border-b border-gray-200 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Vendor Profile</h1>
            <p className="text-gray-600 mb-4">Manage your store information and delivery settings</p>
            
            <div className="flex space-x-4">
              {['general', 'contact', 'pickup', 'business', 'social'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-4 text-sm font-medium capitalize ${
                    activeTab === tab
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {renderTab()}

            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorProfilePage;