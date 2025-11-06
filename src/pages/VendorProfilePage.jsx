import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import { validateVendorProfileCompleteness } from '../utils/validationUtils';

const VendorProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
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
    categories: [],
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

  const categoryOptions = [
    'Fashion', 'Clothing', 'Accessories', 'Shoes', 'Fabrics', 
    'Traditional Wear', 'Formal Wear', 'Casual Wear', 'Children Clothing',
    'Jewelry', 'Bags', 'Hats'
  ];

  // Load vendor profile data
  useEffect(() => {
    const fetchVendorProfile = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const response = await userService.getVendorProfile();
        
        if (response.success && response.data) {
          const profileData = response.profile || response.data;
          
          // Set form data with profile data or defaults
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
            categories: profileData.categories || [],
            description: profileData.description || '',
            socialMedia: {
              website: profileData.socialMedia?.website || '',
              instagram: profileData.socialMedia?.instagram || '',
              facebook: profileData.socialMedia?.facebook || '',
              twitter: profileData.socialMedia?.twitter || ''
            }
          });
        } else {
          // If no profile data, initialize with user data where appropriate
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
      } finally {
        setLoading(false);
      }
    };

    fetchVendorProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects with dot notation (e.g. "pickupAddress.street")
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

  const handleCategoryChange = (category) => {
    setFormData(prev => {
      if (prev.categories.includes(category)) {
        return {
          ...prev,
          categories: prev.categories.filter(c => c !== category)
        };
      } else {
        return {
          ...prev,
          categories: [...prev.categories, category]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Use the shared validation function
    if (!validateVendorProfileCompleteness(formData)) {
      toast.warning('Please fill in all required fields');
      return;
    }
    
    setSaving(true);
    
    try {
      const response = await userService.updateVendorProfile(formData);
      
      if (response.success) {
        toast.success('Profile updated successfully');
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'vendor') {
    return <Navigate to="/login/vendor" />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'general':
        return (
          <>
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
              <p className="text-sm text-gray-500">General information about your store</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="storeName"
                  name="storeName"
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Store Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell customers about your store"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Categories
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categoryOptions.map(category => (
                    <div key={category} className="flex items-center">
                      <input
                        id={`category-${category}`}
                        type="checkbox"
                        checked={formData.categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );
        
      case 'contact':
        return (
          <>
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
              <p className="text-sm text-gray-500">
                Required for pickup and delivery services
                <span className="block mt-1 text-red-500 text-xs font-medium">
                  This information is required for Terminal delivery integration
                </span>
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-2">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      This contact information is used for pickup coordination with delivery services.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="businessInfo.contactPerson.name" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="businessInfo.contactPerson.name"
                  name="businessInfo.contactPerson.name"
                  type="text"
                  required
                  value={formData.businessInfo.contactPerson.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="businessInfo.contactPerson.phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  id="businessInfo.contactPerson.phone"
                  name="businessInfo.contactPerson.phone"
                  type="tel"
                  required
                  placeholder="+2348012345678"
                  value={formData.businessInfo.contactPerson.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +234)</p>
              </div>
              
              <div>
                <label htmlFor="businessInfo.contactPerson.email" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="businessInfo.contactPerson.email"
                  name="businessInfo.contactPerson.email"
                  type="email"
                  required
                  value={formData.businessInfo.contactPerson.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        );
        
      case 'address':
        return (
          <>
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-medium text-gray-900">Pickup Address</h2>
              <p className="text-sm text-gray-500">
                Your business address where items will be collected
                <span className="block mt-1 text-red-500 text-xs font-medium">
                  This information is required for Terminal delivery integration
                </span>
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="pickupAddress.street" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="pickupAddress.street"
                  name="pickupAddress.street"
                  type="text"
                  required
                  value={formData.pickupAddress.street}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="pickupAddress.city" className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  id="pickupAddress.city"
                  name="pickupAddress.city"
                  type="text"
                  required
                  value={formData.pickupAddress.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="pickupAddress.state" className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  id="pickupAddress.state"
                  name="pickupAddress.state"
                  type="text"
                  required
                  value={formData.pickupAddress.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="pickupAddress.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP/Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="pickupAddress.zipCode"
                  name="pickupAddress.zipCode"
                  type="text"
                  required
                  value={formData.pickupAddress.zipCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="pickupAddress.country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  id="pickupAddress.country"
                  name="pickupAddress.country"
                  type="text"
                  value={formData.pickupAddress.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        );
        
      case 'business':
        return (
          <>
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-medium text-gray-900">Business Information</h2>
              <p className="text-sm text-gray-500">Optional business and payment details</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="businessInfo.businessType" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type
                </label>
                <select
                  id="businessInfo.businessType"
                  name="businessInfo.businessType"
                  value={formData.businessInfo.businessType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {businessTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="businessInfo.taxId" className="block text-sm font-medium text-gray-700 mb-1">
                  Tax ID / VAT Number
                </label>
                <input
                  id="businessInfo.taxId"
                  name="businessInfo.taxId"
                  type="text"
                  value={formData.businessInfo.taxId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2 border-t border-gray-200 pt-4">
                <h3 className="text-md font-medium text-gray-800 mb-3">Bank Details</h3>
              </div>
              
              <div>
                <label htmlFor="businessInfo.bankDetails.bankName" className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  id="businessInfo.bankDetails.bankName"
                  name="businessInfo.bankDetails.bankName"
                  type="text"
                  value={formData.businessInfo.bankDetails.bankName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="businessInfo.bankDetails.bankCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Code
                </label>
                <input
                  id="businessInfo.bankDetails.bankCode"
                  name="businessInfo.bankDetails.bankCode"
                  type="text"
                  value={formData.businessInfo.bankDetails.bankCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="businessInfo.bankDetails.accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  id="businessInfo.bankDetails.accountNumber"
                  name="businessInfo.bankDetails.accountNumber"
                  type="text"
                  value={formData.businessInfo.bankDetails.accountNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="businessInfo.bankDetails.accountName" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  id="businessInfo.bankDetails.accountName"
                  name="businessInfo.bankDetails.accountName"
                  type="text"
                  value={formData.businessInfo.bankDetails.accountName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        );
        
      case 'social':
        return (
          <>
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-medium text-gray-900">Social Media</h2>
              <p className="text-sm text-gray-500">Your online presence details</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="socialMedia.website" className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  id="socialMedia.website"
                  name="socialMedia.website"
                  type="url"
                  placeholder="https://your-website.com"
                  value={formData.socialMedia.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="socialMedia.instagram" className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <input
                  id="socialMedia.instagram"
                  name="socialMedia.instagram"
                  type="text"
                  placeholder="@your_instagram_handle"
                  value={formData.socialMedia.instagram}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="socialMedia.facebook" className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook
                </label>
                <input
                  id="socialMedia.facebook"
                  name="socialMedia.facebook"
                  type="text"
                  placeholder="YourFacebookPage"
                  value={formData.socialMedia.facebook}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="socialMedia.twitter" className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter
                </label>
                <input
                  id="socialMedia.twitter"
                  name="socialMedia.twitter"
                  type="text"
                  placeholder="@your_twitter_handle"
                  value={formData.socialMedia.twitter}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your store information and delivery settings
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="border-b border-gray-200 mb-6">
              <div className="flex flex-wrap -mb-px">
                <button
                  type="button"
                  className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'general'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('general')}
                >
                  General
                </button>
                <button
                  type="button"
                  className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'contact'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('contact')}
                >
                  Contact Information
                </button>
                <button
                  type="button"
                  className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'address'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('address')}
                >
                  Pickup Address
                </button>
                <button
                  type="button"
                  className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'business'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('business')}
                >
                  Business Details
                </button>
                <button
                  type="button"
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'social'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('social')}
                >
                  Social Media
                </button>
              </div>
            </div>

            <div className="mt-6">
              {renderTab()}
            </div>
            
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      )}
      
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-4 rounded-lg mt-8 overflow-auto max-h-96">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Debug: Current Profile Data</h3>
          <pre className="text-xs text-gray-600">{JSON.stringify(formData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default VendorProfilePage;