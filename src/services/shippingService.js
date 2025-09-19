import axios from 'axios';
import api from './api';

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
  },

  // Get shipment tracking
  async getShipmentTracking(shipmentId) {
    try {
      // Add validation to avoid undefined shipment IDs
      if (!shipmentId || shipmentId === 'undefined') {
        return {
          success: false,
          message: 'Invalid shipment ID'
        };
      }
      
      const response = await api.get(`/api/shipping/track/${shipmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching shipment tracking:', error);
      // Return a structured error instead of throwing
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to track shipment'
      };
    }
  },

  // Get order shipments
  async getOrderShipments(orderId) {
    try {
      const response = await api.get(`/api/shipping/order/${orderId}/shipments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order shipments:', error);
      throw error;
    }
  }
};

export default shippingService;
