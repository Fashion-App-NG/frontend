import api from './api';

class OrderService {
  // Get order details for a shopper
  async getOrderDetails(orderId) {
    try {
      // Use the MongoDB ID directly, not the "ORD-" format
      // Look for the ID in the format that matches the backend expectation
      const mongoId = orderId.startsWith('ORD-') ? orderId.split('-')[2] : orderId;
      
      const response = await api.get(`/api/orders/${mongoId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      // Return standardized error response
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch order details',
        error
      };
    }
  }
  
  // Get all orders for the current user
  async getOrders() {
    try {
      const response = await api.get('/api/orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch orders',
        error
      };
    }
  }
}

// Create an instance and then export it (to fix the ESLint warning)
const orderService = new OrderService();
export default orderService;