class SettingsService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL;
  }
  
  getAuthHeaders() {
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('shopper_token') ||
                  localStorage.getItem('vendor_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }
  
  async getVATSettings() {
    try {
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('shopper_token') ||
                    localStorage.getItem('vendor_token');
      
      // ✅ Return default if no auth token
      if (!token) {
        return { 
          success: true, 
          data: { taxRate: 0.02, isEnabled: true } 
        };
      }

      const response = await fetch(`${this.baseURL}/api/admin/tax/current`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      const result = await response.json();
      
      // ✅ Handle 403/401 gracefully for non-admin users
      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          return { 
            success: true, 
            data: { taxRate: 0.02, isEnabled: true } 
          };
        }
        throw new Error(result.message || 'Failed to fetch VAT settings');
      }
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error fetching VAT settings:', error);
      // ✅ Return default on any error
      return { 
        success: true, 
        data: { taxRate: 0.02, isEnabled: true } 
      };
    }
  }
}

export const settingsService = new SettingsService();