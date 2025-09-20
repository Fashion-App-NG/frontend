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

            const response = await fetch(`${API_BASE_URL}/api/admin-materials?${queryParams}`, {
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
    async createMaterial(materialData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin-materials`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    ...this.getAuthHeaders(), // include token in headers
                },

                body: JSON.stringify(materialData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create material");;
            }

            return data;
        } catch (error) {
            return {success: false, message: error.message};    
        }

    }

    async getMaterialById(materialId) {
        if (!materialId) throw new Error('Material ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/materials/${materialId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch material');
            }

            return data

        } catch (error) {
            console.error(`Error fetching material ${materialId}:`, error);
            throw error;    
        }
    }

    async updateMaterial(materialId, updatedData) {
        if (!materialId) throw new Error('Material ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin-materials/${materialId}`, {
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
            const response = await fetch(`${API_BASE_URL}/api/admin-materials/${materialId}`, {
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

    // Create Global, Vendor and Product Fee,
    async CreateFee(feeData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin-fees/configs`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...this.getAuthHeaders(), // include token in headers
                },
                body: JSON.stringify(feeData),
            });

            return await response.json()

        } catch (error) {
            console.error("Error creating fee config:", error);
            throw error;
        }
    }

    async GetFees(page = 1, limit = 20, filters = {}) {
        try {
            const queryParams = this.buildQueryParams({
                page,
                limit,
                ...filters
            });

            const response = await fetch(`${API_BASE_URL}/api/admin-fees/configs?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch fees');
            }

            return data;

        } catch (error) {
            console.error('Error fetching fees:', error);
            throw error;
        }
    }

    async UpdateFee(feeId, updatedData) {
        if (!feeId) throw new Error('fee ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin-fees/configs/${feeId}`, {
                method: 'PUT',  
                headers: this.getAuthHeaders(),
                body: JSON.stringify(updatedData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update fee');
            }
            return data;         
        
        } catch (error) {
            console.error(`Error updating fee ${feeId}:`, error);
            throw error;
        }
    }

    async DeleteFee(feeId) {
        if (!feeId) throw new Error('Fee ID is required');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin-fees/configs/${feeId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete fee');
            }
        } catch (error) {
            console.error(`Error deleting fee ${feeId}:`, error);
            throw error;    
        }
    }

    async ToggleFee(feeId) {
        if (!feeId) throw new Error('Fee ID is required');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin-fees/configs/${feeId}/toggle`, {
                method: 'PATCH',
                headers: this.getAuthHeaders()
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to toggle fee');
            }
        } catch (error) {
            console.error(`Error toggling fee ${feeId}:`, error);
            throw error;    
        }
    }

    async GetFeeSummary () {
        try {

            const response = await fetch(`${API_BASE_URL}/api/admin-fees/configs/summary`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch fees summary');
            }

            return data;

        } catch (error) {
            console.error('Error fetching fees summary:', error);
            throw error;
        }
    }

        async getOrderBreakdown (orderId) {
        try {

            const response = await fetch(`${API_BASE_URL}/api/admin-fees/orders/${orderId}/breakdown`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch order breakdown');
            }

            return data;

        } catch (error) {
            console.error('Error fetching fees summary:', error);
            throw error;
        }
    }

    async getFeesEarnings(filters = {}) {
        try {
            const queryParams = this.buildQueryParams({
                ...filters
            });

            const response = await fetch(`${API_BASE_URL}/api/admin-fees/reports/earnings?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch fees earnings');
            }

            return data;

        } catch (error) {
            console.error('Error fetching fees earning:', error);
            throw error;
        }
    }


}

// Create and export a single instance
export const adminService = new AdminService();

