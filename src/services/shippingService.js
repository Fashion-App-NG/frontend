import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const shippingService = {
  // Validate address
  async validateAddress(address) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/shipping/validate-address`, { address });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to validate address');
    }
  },

  // Calculate shipping rates (with Authorization header)
  async calculateRates(address, token) {
    try {
      console.log('Token being sent:', token);
      const response = await axios.post(
        `${API_BASE_URL}/api/shipping/calculate-rates`,
        { deliveryAddress: address },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to calculate shipping rates');
    }
  }
};

export default shippingService;
