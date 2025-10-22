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
            console.error('Error fetching order breakdown:', error);
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
            console.error('Error fetching fees earnings:', error);
            throw error;
        }
    }

    async GetCurrentTax () {
        try {

            const response = await fetch(`${API_BASE_URL}/api/admin/tax/current`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch tax summary');
            }

            return data;

        } catch (error) {
            console.error('Error fetching tax summary:', error);
            throw error;
        }
    }

    async UpdateTax(updatedData) {
        //if (!taxId) throw new Error('fee ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/tax/update`, {
                method: 'PUT',  
                headers: this.getAuthHeaders(),
                body: JSON.stringify(updatedData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update tax');
            }
            return data;         
        
        } catch (error) {
            console.error(`Error updating fee:`, error);
            throw error;
        }
    }

    async GetTaxHistory () {
        try {

            const response = await fetch(`${API_BASE_URL}/api/admin/tax/history`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch tax history');
            }

            return data;

        } catch (error) {
            console.error('Error fetching tax history:', error);
            throw error;
        }
    }

    async ToggleTax() {
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/tax/toggle`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to toggle tax');
            }
        } catch (error) {
            console.error(`Error toggling tax:`, error);
            throw error;    
        }
    }

    async getUserById(userId) {
        if (!userId) throw new Error('User ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch user');
            }

            return data

        } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            throw error;    
        }
    }

    async GetUsers (page = 1, limit = 20, filters = {}) {
        try {

            const queryParams = this.buildQueryParams({
                page,
                limit,
                ...filters
            });

            const response = await fetch(`${API_BASE_URL}/api/user?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch users');
            }

            return data;

        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    async UpdateUserProfile(userId, updatedData) {
        if (!userId) throw new Error('User ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
                method: 'PUT',  
                headers: this.getAuthHeaders(),
                body: JSON.stringify(updatedData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update user profile');
            }
            return data;         
        
        } catch (error) {
            console.error(`Error updating user profile:`, error);
            throw error;
        }
    }

    async SuspendUser(userId) {
        if (!userId) throw new Error('User ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/${userId}/suspend`, {
                method: 'PUT',  
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to suspend user');
            }
            return data;         
        
        } catch (error) {
            console.error(`Error suspending user:`, error);
            throw error;
        }
    }

    async UnsuspendUser(userId) {
        if (!userId) throw new Error('User ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/${userId}/unsuspend`, {
                method: 'PUT',  
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to unsuspend user');
            }
            return data;         
        
        } catch (error) {
            console.error(`Error unsuspending user:`, error);
            throw error;
        }
    }

    async DisableUser(userId) {
        if (!userId) throw new Error('User ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/${userId}/disable`, {
                method: 'PUT',  
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to disable user');
            }
            return data;         
        
        } catch (error) {
            console.error(`Error disabling user:`, error);
            throw error;
        }
    }

    async UpdateUserLoyalty(userId) {
        if (!userId) throw new Error('User ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/${userId}/loyalty`, {
                method: 'PUT',  
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update user loyalty');
            }
            return data;         
        
        } catch (error) {
            console.error(`Error updating user loyalty:`, error);
            throw error;
        }
    }

    async UpdateUserPreference(userId) {
        if (!userId) throw new Error('User ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/${userId}/preferences`, {
                method: 'PUT',  
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update user preferences');
            }
            return data;         
        
        } catch (error) {
            console.error(`Error updating user preferences:`, error);
            throw error;
        }
    }

    async GetUserPreferences(userId) {
        if (!userId) throw new Error('User ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/${userId}/preferences`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch user preferences');
            }

            return data

        } catch (error) {
            console.error(`Error fetching user preferences ${userId}:`, error);
            throw error;    
        }
    }

    async GetUserAnalytics(userId) {
        if (!userId) throw new Error('User ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/${userId}/analytics`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch user analytics');
            }

            return data

        } catch (error) {
            console.error(`Error fetching user analytics ${userId}:`, error);
            throw error;    
        }
    }

    async GetVendors (page = 1, limit = 20, filters = {}) {
        try {

            const queryParams = this.buildQueryParams({
                page,
                limit,
                ...filters
            });

            const response = await fetch(`${API_BASE_URL}/api/vendor?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch vendors');
            }

            return data;

        } catch (error) {
            console.error('Error fetching vendors:', error);
            throw error;
        }
    }

    async getVendorById(vendorId) {
        if (!vendorId) throw new Error('Vendor ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/vendor/${vendorId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch vendor');
            }

            return data

        } catch (error) {
            console.error(`Error fetching vendor ${vendorId}:`, error);
            throw error;    
        }
    }

    async UpdateVendorProfile(vendorId, updatedData) {
        if (!vendorId) throw new Error('Vendor ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/vendor/${vendorId}`, {
                method: 'PUT',  
                headers: this.getAuthHeaders(),
                body: JSON.stringify(updatedData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update vendor profile');
            }
            return data;         
        
        } catch (error) {
            console.error(`Error updating vendor profile:`, error);
            throw error;
        }
    }

    async ApproveVendor(vendorId) {
        if (!vendorId) throw new Error('Vendor ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/vendor/${vendorId}/approve`, {
                method: 'PUT',  
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to approve vendor');
            }
            return data;         
        
        } catch (error) {
            console.error(`Error approving vendor:`, error);
            throw error;
        }
    }

    async SuspendVendor(vendorId) {
        if (!vendorId) throw new Error('Vendor ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/vendor/${vendorId}/suspend`, {
                method: 'PUT',  
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to suspend vendor');
            }
            return data;         
        
        } catch (error) {
            console.error(`Error suspending vendor:`, error);
            throw error;
        }
    }

    async UnsuspendVendor(vendorId) {
        if (!vendorId) throw new Error('Vendor ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/vendor/${vendorId}/unsuspend`, {
                method: 'PUT',  
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to unsuspend vendor');
            }
            return data;         
        
        } catch (error) {
            console.error(`Error unsuspending vendor:`, error);
            throw error;
        }
    }

    async DisableVendor(vendorId) {
        if (!vendorId) throw new Error('Vendor ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/vendor/${vendorId}/disable`, {
                method: 'PUT',  
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to disable vendor');
            }
            return data;         
        
        } catch (error) {
            console.error(`Error disabling vendor:`, error);
            throw error;
        }
    }

    async GetVendorAnalytics(vendorId) {
        if (!vendorId) throw new Error('Vendor ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/vendor/${vendorId}/analytics`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch vendor analytics');
            }

            return data

        } catch (error) {
            console.error(`Error fetching vendor analytics ${vendorId}:`, error);
            throw error;    
        }
    }


    async UpdateVendorReliability(vendorId) {
        if (!vendorId) throw new Error('Vendor ID is required');

        try {
            const response = await fetch(`${API_BASE_URL}/api/vendor/${vendorId}/reliability`, {
                method: 'PUT',  
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update vendor reliability');
            }
            return data;         
        
        } catch (error) {
            console.error(`Error updating vendor reliability:`, error);
            throw error;
        }
    }
}

// Create and export a single instance
export const adminService = new AdminService();

