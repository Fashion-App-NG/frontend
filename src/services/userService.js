import { authFetch } from './authService';

class UserService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002';
  }

  async getVendorProfile() {
    try {
      const apiBase = this.baseURL.includes('/api') ? this.baseURL : `${this.baseURL}/api`;
      const url = `${apiBase}/profile/me`;

      const response = await authFetch(url);
      
      // Transform the API response structure to match our form structure
      if (response.success && response.data && response.data.vendorProfile) {
        const { vendorProfile } = response.data;
        
        // Return both the original response and the extracted vendorProfile
        return {
          ...response,
          profile: {
            storeName: response.data.storeName || vendorProfile.storeName || '',
            pickupAddress: vendorProfile.pickupAddress || {
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