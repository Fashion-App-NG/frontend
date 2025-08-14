import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import vendorOrderService from '../services/vendorOrderService';

// Order status configurations matching Figma
const ORDER_STATUSES = [
  { key: 'All', label: 'All', active: true },
  { key: 'New Order', label: 'New Order', active: false },
  { key: 'Completed', label: 'Completed', active: false },
  { key: 'In Progress', label: 'In Progress', active: false },
  { key: 'Pending', label: 'Pending', active: false },
  { key: 'Cancelled', label: 'Cancelled', active: false }
];

const STATUS_COLORS = {
  'New Order': { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  'Cancelled': { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
  'In Progress': { bg: 'bg-yellow-50', text: 'text-yellow-600', dot: 'bg-yellow-500' },
  'Completed': { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' },
  'Expired': { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500' }
};

export const VendorOrdersPage = () => {
  // ✅ ALL HOOKS FIRST
  const { user, isAuthenticated } = useAuth();
  
  // ✅ Replace dummy data with real state
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalOrdersChange: '+0%',
    activeOrders: 0,
    activeOrdersChange: '+0%',
    completedOrders: 0,
    completedOrdersChange: '+0%',
    cancelledOrders: 0,
    cancelledOrdersChange: '+0%'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Add useEffect to fetch real data
  useEffect(() => {
    const fetchVendorOrders = async () => {
      if (!user?.id || !isAuthenticated || user.role !== 'vendor') {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Fetching orders for vendor:', user.id);
        
        const response = await vendorOrderService.getVendorOrders(user.id);
        
        // ✅ FIXED: API returns orders directly at root level, not nested in data
        if (response.success && response.orders) {  // Changed from response.data
          console.log('✅ Orders fetched:', response.orders);
          
          // ✅ FIXED: Transform orders to match table expectations
          const transformedOrders = response.orders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            date: new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short', 
              day: 'numeric'
            }),
            customerName: order.customerInfo?.name || 'Unknown Customer',
            location: `${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}`.replace(/^,\s*/, ''),
            amount: `₦${order.totalAmount?.toLocaleString() || '0'}`,
            status: order.status,
            paymentStatus: order.paymentStatus
          }));
          
          setOrders(transformedOrders);
          
          // ✅ FIXED: Update stats if available (check both locations)
          if (response.summary || response.data?.summary) {
            const summary = response.summary || response.data.summary;
            setStats({
              totalOrders: summary.totalRevenue || response.orders.length || 0,  // Use orders count as fallback
              totalOrdersChange: '+0%',
              activeOrders: summary.pendingOrders + summary.processingOrders || response.orders.filter(o => o.status === 'PENDING').length || 0,
              activeOrdersChange: '+0%',
              completedOrders: summary.deliveredOrders || response.orders.filter(o => o.status === 'COMPLETED').length || 0,
              completedOrdersChange: '+0%',
              cancelledOrders: summary.cancelledOrders || response.orders.filter(o => o.status === 'CANCELLED').length || 0,
              cancelledOrdersChange: '+0%'
            });
          } else {
            // ✅ Calculate stats from orders array since no summary provided
            const orders = response.orders || [];
            setStats({
              totalOrders: orders.length,
              totalOrdersChange: '+0%',
              activeOrders: orders.filter(o => ['PENDING', 'IN_PROGRESS', 'PROCESSING'].includes(o.status)).length,
              activeOrdersChange: '+0%',
              completedOrders: orders.filter(o => o.status === 'COMPLETED').length,
              completedOrdersChange: '+0%',
              cancelledOrders: orders.filter(o => o.status === 'CANCELLED').length,
              cancelledOrdersChange: '+0%'
            });
          }
        } else {
          console.log('📭 No orders found or API returned no data');
          console.log('🔍 RESPONSE ANALYSIS:', {
            success: response.success,
            hasData: !!response.data,
            hasOrders: !!response.orders,
            response: response
          });
          setOrders([]);
        }
      } catch (err) {
        console.error('❌ Error fetching orders:', err);
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorOrders();
  }, [user?.id, isAuthenticated, user?.role]);

  // ✅ All computed values using hooks go here too
  const filteredOrders = useMemo(() => {
    if (activeStatus === 'All') return orders;
    return orders.filter(order => order.status === activeStatus);
  }, [orders, activeStatus]);

  // ✅ CONDITIONAL LOGIC AFTER ALL HOOKS
  // Authentication checks
  if (!isAuthenticated) {
    return <Navigate to="/login/vendor" replace />;
  }

  if (user && user.role !== 'vendor') {
    if (user.role === 'shopper') {
      return <Navigate to="/shopper/dashboard" replace />;
    }
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // ✅ After your conditional authentication checks, add loading/empty states

  if (loading) {
    return (
      <div className="flex-1 ml-[254px] p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 ml-[254px] p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error Loading Orders</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ Component functions after hooks and conditional logic
  const StatusBadge = ({ status }) => {
    const config = STATUS_COLORS[status] || { 
      bg: 'bg-gray-50', 
      text: 'text-gray-600', 
      dot: 'bg-gray-500' 
    };
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${config.dot}`}></div>
        {status}
      </div>
    );
  };

  // ✅ Main render logic
  return (
    <div className="flex-1 ml-[254px] p-6 bg-gray-50 min-h-screen">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {user?.storeName || `${user?.firstName} ${user?.lastName}` || 'Vendor Dashboard'}
            </p>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.storeName || `${user?.firstName} ${user?.lastName}` || 'Vendor'}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.storeName?.charAt(0)?.toUpperCase() || user?.firstName?.charAt(0)?.toUpperCase() || 'V'}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Orders */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-green-600 text-sm font-medium">{stats.totalOrdersChange} this week</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalOrders.toLocaleString()}</div>
            <div className="text-gray-500 text-sm">Total orders</div>
          </div>

          {/* Active Orders */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-blue-600 text-sm font-medium">{stats.activeOrdersChange} this week</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.activeOrders.toLocaleString()}</div>
            <div className="text-gray-500 text-sm">Active orders</div>
          </div>

          {/* Completed Orders */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-red-600 text-sm font-medium">{stats.completedOrdersChange} this week</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.completedOrders.toLocaleString()}</div>
            <div className="text-gray-500 text-sm">Completed orders</div>
          </div>

          {/* Cancelled Orders */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-green-600 text-sm font-medium">{stats.cancelledOrdersChange} this week</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.cancelledOrders.toLocaleString()}</div>
            <div className="text-gray-500 text-sm">Cancelled orders</div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Search and Filter Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search orders"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
              </div>

              {/* Filter Button */}
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filter
              </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2 mt-4">
              {ORDER_STATUSES.map(status => (
                <button
                  key={status.key}
                  onClick={() => setActiveStatus(status.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeStatus === status.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Order List Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Order List</h2>
            <select className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Daily</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button className="flex items-center">
                      ID
                      <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button className="flex items-center">
                      Customer Name
                      <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button className="flex items-center">
                      Amount
                      <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button className="flex items-center">
                      Status Order
                      <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                      {activeStatus === 'All' 
                        ? "You haven't received any orders yet." 
                        : `No ${activeStatus.toLowerCase()} orders found.`
                      }
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{order.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination would go here if needed */}
        </div>

        {/* ✅ Add this temporary debug section in your render (remove after testing) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <h4 className="font-medium text-yellow-800 mb-3">🔧 Debug Info:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Vendor ID:</strong> {user?.id || 'Not found'}</p>
                <p><strong>Vendor Email:</strong> {user?.email || 'Not found'}</p>
                <p><strong>Store Name:</strong> {user?.storeName || 'Not found'}</p>
                <p><strong>First Name:</strong> {user?.firstName || 'Not found'}</p>
                <p><strong>Last Name:</strong> {user?.lastName || 'Not found'}</p>
                <p><strong>User Role:</strong> {user?.role || 'Not found'}</p>
              </div>
              <div>
                <p><strong>Orders Count:</strong> {orders.length}</p>
                <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                <p><strong>Error:</strong> {error || 'None'}</p>
                <p><strong>API BASE URL:</strong> {process.env.REACT_APP_API_BASE_URL || 'Not set'}</p>
                <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
                <p><strong>Auth Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
              </div>
            </div>
            
            {/* Show actual user object */}
            <details className="mt-3">
              <summary className="cursor-pointer text-yellow-700 font-medium">📋 Raw User Object</summary>
              <pre className="mt-2 p-2 bg-yellow-100 rounded text-xs overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOrdersPage;