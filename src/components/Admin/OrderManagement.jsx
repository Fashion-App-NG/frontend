import { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { adminService } from '../../services/adminService';

const OrderItems = ({ items, formatCurrency }) => (
  <div className="mt-4">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50">
          <th className="p-2 text-left">Product</th>
          <th className="p-2 text-left">Vendor</th>
          <th className="p-2 text-left">Quantity</th>
          <th className="p-2 text-left">Price/Yard</th>
          <th className="p-2 text-left">Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.productId} className="border-b">
            <td className="p-2">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="font-medium">{item.materialType} - {item.pattern}</p>
              </div>
            </td>
            <td className="p-2">{item.vendorName}</td>
            <td className="p-2">{item.quantity} yards</td>
            <td className="p-2">{formatCurrency(item.pricePerYard)}</td>
            <td className="p-2">{formatCurrency(item.pricePerYard * item.quantity)}</td>
          </tr>
        ))}
      </tbody>  
    </table>
  </div>
);

const OrderManagement = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 20
  });

  const statusOptions = [
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'EXPIRED'
  ];

  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    vendorId: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllOrders(
        pagination.currentPage, // current page from pagination state
        pagination.limit, // limit per page
        filters // current filters state
      );
      
      if (data.success) {
        setOrders(data.orders);
        setPagination(data.pagination);
        setError(null);
      } else {
        setError(data.message)
      }
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false);
    }

  }, [pagination.currentPage, pagination.limit, filters]);
  
  
  // Fetch orders on component mount
  useEffect (() => {
    fetchOrders();
  }, [pagination.currentPage, fetchOrders]);

  

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  }

  // format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // handle filter search
  /*const handleSearch = async () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setFilters((prev) => ({ ...prev, search: searchId.trim() }));

  };*/

  // handle filter search change
  const handleFilterChange = (key, value) => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setFilters((prev) => ({ ...prev, [key]: value }));
  };



  //handle status update
  const handleStatusUpdate = async () => {
    if (!selectedOrder || !orderStatus) return;

    setLoading(true);
    try {
      await adminService.updateOrderStatus(selectedOrder.id, orderStatus);
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setLoading(true);
    try {
      await adminService.cancelOrder(orderId);
      await fetchOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600">Manage and track all orders</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select
          value={filters.paymentStatus}
          onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="">All Payment Statuses</option>
          <option value="PAID">PAID</option>
          <option value="PENDING">PENDING</option>
          <option value="FAILED">FAILED</option>
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Filter by Vendor ID"
          value={filters.vendorId}
          onChange={(e) => handleFilterChange('vendorId', e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setFilters({
            status: '',
            paymentStatus: '',
            vendorId: '',
            startDate: '',
            endDate: '',
            search: ''
          });
          setPagination((prev) => ({ ...prev, currentPage: 1 }));
        }}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-gray-300"
      >
        Reset Filters
      </button>


      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No orders found.</div>
          ) : (
            
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-4">Order Number</th>
                    <th className="text-left pb-4">Customer</th>
                    <th className="text-left pb-4">Items</th>
                    <th className="text-left pb-4">Status</th>
                    <th className="text-left pb-4">Total</th>
                    <th className="text-left pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                  <>
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-4">
                        <button
                          onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                          className="flex items-center gap-2"
                        >
                          {expandedOrderId === order.id ? <FaChevronUp /> : <FaChevronDown />}
                          {order.orderNumber}
                        </button>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium">{order.customerInfo.name}</p>
                          <p className="text-sm text-gray-500">{order.customerInfo.email}</p>
                        </div>
                      </td>
                      <td>{order.itemCount} items</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setOrderStatus(order.status);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={['CANCELLED', 'DELIVERED'].includes(order.status)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedOrderId === order.id && (
                      <tr>
                        <td colSpan="6" className="bg-gray-50 p-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium mb-2">Shipping Address</h4>
                              <p className="text-sm">{order.shippingAddress.line1}</p>
                              <p className="text-sm">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                              <p className="text-sm">{order.shippingAddress.zip}, {order.shippingAddress.country}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Order Details</h4>
                              <p className="text-sm">Created: {formatDate(order.createdAt)}</p>
                              <p className="text-sm">Payment Status: {order.paymentStatus}</p>
                            </div>
                          </div>
                          <OrderItems 
                          items={order.items}
                          formatCurrency={formatCurrency}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                </tbody>
              </table>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && orders.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={!pagination.hasPrevPage}
              className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Order Status</h2>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Select Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;