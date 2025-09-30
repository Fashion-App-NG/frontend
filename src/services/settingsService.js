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
  
  async getTaxSettings() {
    try {
      const response = await fetch(`${this.baseURL}/api/settings/tax`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tax settings');
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching tax settings:', error);
      return { success: false, message: error.message };
    }
  }
}

export const settingsService = new SettingsService();