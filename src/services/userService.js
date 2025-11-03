import { authFetch } from './authService';

class UserService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002';
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('shopper_token') ||
                  localStorage.getItem('vendor_token');
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // ✅ NEW: Get user profile
  async getUserProfile(userId) {
    try {
      const response = await fetch(`${this.baseURL}/api/user/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch user profile');
      }

      const data = await response.json();
      console.log('✅ User profile fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      throw error;
    }
  }

  // ✅ NEW: Update user profile
  async updateUserProfile(userId, profileData) {
    try {
      const response = await fetch(`${this.baseURL}/api/user/${userId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user profile');
      }

      const data = await response.json();
      console.log('✅ User profile updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to update user profile:', error);
      throw error;
    }
  }

  // ✅ NEW: Get shopper delivery address
  async getShopperDeliveryAddress(shopperId) {
    try {
      const response = await fetch(`${this.baseURL}/api/shipping/shopper/${shopperId}/dropoff-address`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No address saved yet
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch delivery address');
      }

      const data = await response.json();
      console.log('✅ Delivery address fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch delivery address:', error);
      throw error;
    }
  }

  // ✅ NEW: Update shopper delivery address
  async updateShopperDeliveryAddress(shopperId, addressData) {
    try {
      const response = await fetch(`${this.baseURL}/api/shipping/shopper/${shopperId}/dropoff-address`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(addressData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update delivery address');
      }

      const data = await response.json();
      console.log('✅ Delivery address updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to update delivery address:', error);
      throw error;
    }
  }

  // ✅ NEW: Update user preferences
  async updateUserPreferences(userId, preferences) {
    try {
      const response = await fetch(`${this.baseURL}/api/user/${userId}/preferences`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ preferences })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update preferences');
      }

      const data = await response.json();
      console.log('✅ Preferences updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to update preferences:', error);
      throw error;
    }
  }

  async getVendorProfile() {
    try {
      const apiBase = this.baseURL.includes('/api') ? this.baseURL : `${this.baseURL}/api`;
      const url = `${apiBase}/profile/me`;

      const response = await authFetch(url);
      
      // Transform the API response structure to match our form structure
      if (response.success && response.data) {
        const { vendorProfile } = response.data;
        
        // ✅ Extract storeName from root level or vendorProfile
        const storeName = response.data.storeName || 
                         vendorProfile?.storeName || 
                         '';
        
        // Return both the original response and the extracted vendorProfile
        return {
          ...response,
          profile: {
            storeName: storeName,
            pickupAddress: vendorProfile?.pickupAddress || {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'Nigeria',
              isDefault: true
            },
            businessInfo: vendorProfile.businessInfo || {
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
                email: response.data.email || ''
              }
            },
            categories: vendorProfile.categories || [],
            description: vendorProfile.description || '',
            socialMedia: vendorProfile.socialMedia || {
              website: '',
              instagram: '',
              facebook: '',
              twitter: ''
            }
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('Failed to fetch vendor profile:', error);
      throw error;
    }
  }

  async updateVendorProfile(profileData) {
    try {
      const apiBase = this.baseURL.includes('/api') ? this.baseURL : `${this.baseURL}/api`;
      const url = `${apiBase}/profile/me`;

      // Transform the form data to match what the API expects
      const apiProfileData = {
        storeName: profileData.storeName,
        vendorProfile: {
          pickupAddress: profileData.pickupAddress,
          businessInfo: profileData.businessInfo,
          categories: profileData.categories,
          description: profileData.description,
          // Just use the socialMedia object directly without redundancy
          socialMedia: profileData.socialMedia,
          // Only include storeName in vendorProfile if API requires it
          ...(profileData.storeName && { storeName: profileData.storeName })
        }
      };

      const response = await authFetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiProfileData)
      });
      
      return response;
    } catch (error) {
      console.error('Failed to update vendor profile:', error);
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;