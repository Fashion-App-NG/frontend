// Base API URL - uses environment variables with fallback
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

class AdminService {
    // Helper method to get auth headers with admin check
    getAuthHeaders() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user || (user.role !== 'admin' && user.role !== 'superadmin')) {
            throw new Error('Unauthorized: Admin access required');
        }

        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }

    // Utility to build query string from filters
    buildQueryParams(params = {}) {
        const query = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, value);
            }
        });

        return query.toString();
    }

     /**
     * Get all orders with optional filters
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @param {object} filters - Optional filters:
     *   - status: PENDING, CONFIRMED, etc.
     *   - paymentStatus: PENDING, PAID, etc.
     *   - vendorId: string
     *   - startDate: YYYY-MM-DD
     *   - endDate: YYYY-MM-DD
     *   - search: order number, customer name, or email
     */

    // Get all orders
    async getAllOrders(page = 1, limit = 20, filters = {}) {
        try {
            const queryParams = this.buildQueryParams({
                page,
                limit,
                ...filters
            });

            const response = await fetch(`${API_BASE_URL}/api/admin-orders?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch orders');
            }

            return data;

        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    // Get Order by ID
   /* async getOrderById(orderId) {
        if (!orderId) throw new Error('Order ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin-orders/${orderId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fethc order')
            }

            return data;
        
        } catch (error) {
            console.error(`Error fetching order ${orderId}:`, error);
            throw error;
        }
    }*/

    // Cancel Order by ID
    async cancelOrder(orderId) {
        if (!orderId) throw new Error('Order ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin-orders/${orderId}/cancel`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to cancel order');
            }

            return data;


        } catch (error) {
            console.error(`Error cancelling order ${orderId}:`, error);
            throw error;
        }
    }

    // Update order status
    async updateOrderStatus(orderId, status) {
        if (!orderId) throw new Error('Order ID is required');
        if (!status) throw new Error('Status is required');

        const validStatuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'EXPIRED']
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status provided');
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin-orders/${orderId}/status`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ status })    
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update order status');
            }

            return data;
        
        } catch (error) {
            console.error(`Error updating status for order ${orderId}:`, error);
            throw error;
        }
    }

    // Get all users
    async getAllMaterials(page = 1, limit = 20, filters = {}) {
        try {
            const queryParams = this.buildQueryParams({
                page,
                limit,
                ...filters
            });

            const response = await fetch(`${API_BASE_URL}/api/admin/material?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch orders');
            }

            return data;

        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    // Create a new material
    async createMaterial(materialData, token) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/material`, {
                method: 'POST',
                headers: {
                    "Consent-Type": "application/json",
                    Authorization: `Bearer ${token}`,// include token in headers
                },

                body: JSON.stringify(materialData),
            });

            const data = await response.json();

            if (!response.ok) {
                return data;
        }

        return data;
        } catch (error) {
            return {success: false, message: error.message};    
        }

    }

    async getMaterialById(materialId) {
        if (!materialId) throw new Error('Material ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/material/${materialId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch material');
            }
        } catch (error) {
            console.error(`Error fetching material ${materialId}:`, error);
            throw error;    
        }
    }

    async updateMaterial(materialId, updatedData) {
        if (!materialId) throw new Error('Material ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/material/${materialId}`, {
                method: 'PUT',  
                headers: this.getAuthHeaders(),
                body: JSON.stringify(updatedData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update material');
            }
            return data;         
        
        } catch (error) {
            console.error(`Error updating material ${materialId}:`, error);
            throw error;
        }
    }

    async deleteMaterial(materialId) {
        if (!materialId) throw new Error('Material ID is required');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/material/${materialId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete material');
            }
        } catch (error) {
            console.error(`Error deleting material ${materialId}:`, error);
            throw error;    
        }
    }

    async materialRate(payload) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/material/rate`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to rate material');
        }
        }   catch (error) {
            console.error('Error rating material:', error);
            throw error;
        }
    }
}

// Create and export a single instance
export const adminService = new AdminService();

