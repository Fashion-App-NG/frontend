// Create a simple API health check
// filepath: /Users/abioyebankole/fashion-app/frontend/src/utils/apiHealthCheck.js
class ApiHealthCheck {
  static async checkBackendStatus() {
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';
    
    try {
      const response = await fetch(`${baseURL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        console.log('✅ Backend API is available');
        return true;
      } else {
        console.warn('⚠️ Backend API returned non-OK status:', response.status);
        return false;
      }
    } catch (error) {
      console.warn('⚠️ Backend API is not available:', error.message);
      return false;
    }
  }
}

export default ApiHealthCheck;