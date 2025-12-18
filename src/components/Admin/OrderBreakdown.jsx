import { useState, useEffect, useCallback } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { adminService } from '../../services/adminService';
import ItemsTable from './AdminItems';
import FilterSection from './AdminFilter';
import Pagination from './AdminPagination';
import ErrorMessage from './AdminError';


const OrderBreakdown = () => {

  const [orders, setOrders] = useState([]);
  const [breakdown, setBreakdown] = useState([])
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

  const paymentStatusOptions = [
    'PAID',
    'PENDING',
    'FAILED'
  ];

  const columns = [
    { key: "productId", label: "Product ID" },
    { key: "vendorId", label: "Vendor ID" },
    { key: "itemSubtotal", label: "Item Subtotal", render: (item) => formatCurrency(item?.itemSubtotal) },
    { key: "feeAmount", label: "Fee Amount", render: (item) => formatCurrency(item?.feeAmount) },
    { key: "feeLevel", label: "Fee Level", render: (item) => item?.feeLevel },
    { key: "feeType", label: "Fee Type", render: (item) => item?.feeType },
    { key: "feeValue", label: "Fee Value", render: (item) => item?.feeValue },
    { key: "feePercentage", label: "Fee Percentage", render: (item) => item?.feePercentage },
  ];



  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    vendorId: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  const filterConfigs = [
    { key: "status", type: "select", placeholder: "All Statuses", options: statusOptions },
    { key: "paymentStatus", type: "select", placeholder: "All Payment Statuses", options: paymentStatusOptions },
    { key: "startDate", type: "date" },
    { key: "endDate", type: "date" },
    { key: "vendorId", type: "text", placeholder: "Filter by Vendor ID" },
  ];

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
  
  const fetchOrderBreakdown = useCallback(async (orderId) => {
    setLoading(true);
    try {
        const data = await adminService.getOrderBreakdown();
      
        if (data?.feeBreakdown) {
            setBreakdown(data.feeBreakdown);
            setError(null);
        } else {
            setError(data.message || "No Breakdown Available")
        }
      
    } catch (err) {
      setError(err.message || " Error fetching breakdown")
    } finally {
      setLoading(false);
    }

  }, []);
  
  // Fetch orders on component mount
  useEffect (() => {
    fetchOrders();
  }, [pagination.currentPage, fetchOrders]);

  useEffect (() => {
    fetchOrderBreakdown(expandedOrderId);
  }, [fetchOrderBreakdown, expandedOrderId]);

  

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  }

  // format date
  /*const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }*/


  // handle filter search change
  const handleFilterChange = (key, value) => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setFilters((prev) => ({ ...prev, [key]: value }));
  };


  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Order Breakdown</h1>
        <p className="text-gray-600">See all Order Fees</p>
      </div>

      {/* Error Message */}
      <ErrorMessage message={error} />

      {/* Search and Filter Section */}
      <FilterSection 
        filters={filters}
        onFilterChange={handleFilterChange}
        filterConfigs={filterConfigs}
        onReset={() => {
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
      />



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
                    </tr>
                    {expandedOrderId === order.id && (
                      <tr>
                        <td colSpan="6" className="bg-gray-50 p-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium mb-2">Price Breakdown</h4>
                              <p className="text-sm">Total Subtotal: {formatCurrency(breakdown.totalSubtotal)}</p>
                              <p className="text-sm">Fees: {formatCurrency(breakdown.Fees)}</p>
                              <p className="text-sm">Total: {formatCurrency(breakdown.WithFees)}</p>
                            </div>
                          </div>
                          <ItemsTable 
                          items={breakdown}
                          columns={columns}
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
      <Pagination 
        pagination={pagination}
        onPageChange={(newPage) =>
          setPagination((prev) => ({ ...prev, currentPage: newPage }))
        }
      />
    </div>
  );
};

export default OrderBreakdown;