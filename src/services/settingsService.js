class SettingsService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL;
  }
  
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }
  
  // Update method name to reflect VAT terminology
  async getVATSettings() {
    try {
      const response = await fetch(`${this.baseURL}/api/admin/tax/current`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch VAT settings');
      }
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error fetching VAT settings:', error);
      return { success: false, message: error.message };
    }
  }
}

export const settingsService = new SettingsService();