import { authFetch } from './authService';

class VendorOrderService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002';
  }

  async getVendorOrders(vendorId, params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const apiBase = this.baseURL.includes('/api') ? this.baseURL : `${this.baseURL}/api`;
    
    // ✅ CORRECTED: Use plural 'vendor-orders' as you confirmed is correct
    const url = `${apiBase}/vendor-orders/${vendorId}/orders${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    console.log(`🔍 Fetching vendor orders: ${url}`);

    try {
        const response = await authFetch(url);
        console.log('🔍 VENDOR ORDERS RESPONSE:', response);
        return response;
    } catch (error) {
        console.error('❌ Failed to fetch vendor orders:', error);
        throw new Error(error.message || 'Failed to fetch vendor orders');
    }
}

  async updateOrderStatus(orderId, status) {
    const apiBase = this.baseURL.includes('/api') ? this.baseURL : `${this.baseURL}/api`;
    // ✅ CORRECTED: Use plural 'vendor-orders'
    const url = `${apiBase}/vendor-orders/orders/${orderId}/status`;
    
    try {
        const response = await authFetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return response;
    } catch (error) {
        throw new Error(error.message || 'Failed to update order status');
    }
}

  async getOrderDetails(orderId) {
    const apiBase = this.baseURL.includes('/api') ? this.baseURL : `${this.baseURL}/api`;
    // ✅ CORRECTED: Use plural 'vendor-orders' 
    const url = `${apiBase}/vendor-orders/orders/${orderId}`;
    
    try {
        const response = await authFetch(url);
        return response;
    } catch (error) {
        throw new Error(error.message || 'Failed to fetch order details');
    }
}
}

const vendorOrderService = new VendorOrderService();
export default vendorOrderService;