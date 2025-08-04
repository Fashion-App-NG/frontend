class CheckoutService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || '';
    this.shippingService = require('./shippingService').default;
  }

  // Always prefix with /api
  async reviewCart() {
    const response = await fetch(`${this.baseURL}/api/checkout/review`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to review cart');
    return response.json();
  }

  async saveShippingInfo(shippingAddress, customerInfo) {
    console.log('Validating address:', shippingAddress);
    const validationResult = await this.shippingService.validateAddress(shippingAddress);
    console.log('Validation result:', validationResult);
    if (!validationResult.success) {
      throw new Error('Invalid address.');
    }

    const response = await fetch(`${this.baseURL}/api/checkout/shipping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ shippingAddress, customerInfo })
    });
    if (!response.ok) throw new Error('Failed to save shipping info');
    return response.json();
  }

  async confirmOrder({ shippingAddress, customerInfo, paymentDetails, reservationDuration }) {
    const response = await fetch(`${this.baseURL}/api/checkout/confirm-step`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ shippingAddress, customerInfo, paymentDetails, reservationDuration })
    });
    if (!response.ok) throw new Error('Failed to confirm order');
    return response.json();
  }

  async getOrders({ page = 1, limit = 20, status, paymentStatus } = {}) {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (status) params.append('status', status);
    if (paymentStatus) params.append('paymentStatus', paymentStatus);

    const response = await fetch(`${this.baseURL}/api/checkout/orders?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return await response.json();
  }

  async getOrderById(orderId) {
    const response = await fetch(`${this.baseURL}/api/checkout/orders/${orderId}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch order');
    return await response.json();
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    };
  }
}

const checkoutServiceInstance = new CheckoutService();
export default checkoutServiceInstance;
