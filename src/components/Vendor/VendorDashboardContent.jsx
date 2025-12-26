import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import vendorAnalyticsService from '../../services/vendorAnalyticsService';
import { RevenueChart } from './charts/RevenueChart';
import { SalesStatusChart } from './charts/SalesStatusChart';

export const VendorDashboardContent = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [statusFilter, setStatusFilter] = useState('all');

  // ✅ ADD: Initialize salesAnalytics with default chart data structure
  const [salesAnalytics, setSalesAnalytics] = useState({
    revenueTrends: {
      labels: [],
      datasets: [
        {
          label: 'Revenue',
          data: [],
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y',
        },
        {
          label: 'Orders',
          data: [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1',
        }
      ]
    },
    salesByStatus: {
      labels: ['Processing', 'Completed', 'Cancelled'],
      datasets: [
        {
          label: 'Sales Status',
          data: [0, 0, 0],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 1,
        }
      ]
    }
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      try {
        const summaryData = await vendorAnalyticsService.getDashboardSummary();
        setDashboardData(summaryData);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const historyData = await vendorAnalyticsService.getOrderHistory();
        const processedOrderHistory = Array.isArray(historyData) ? historyData : [];
        setOrderHistory(processedOrderHistory);
        
      } catch (error) {
        console.error('❌ Failed to load dashboard data:', error);
        setDashboardData(null);
        setOrderHistory([]);
      } finally {
        setLoading(false);
      }
    };

    const loadSalesAnalytics = async () => {
      setAnalyticsLoading(true);
      
      try {
        const analytics = await vendorAnalyticsService.getSalesAnalytics(selectedPeriod);
        console.log('📊 Sales Analytics Loaded:', analytics);
        
        // ✅ CHANGE: Merge with defaults to ensure structure exists
        if (analytics) {
          setSalesAnalytics(prevState => ({
            revenueTrends: analytics.revenueTrends || prevState.revenueTrends,
            salesByStatus: analytics.salesByStatus || prevState.salesByStatus
          }));
        }
      } catch (error) {
        console.error('❌ Failed to load sales analytics:', error);
        // Keep default empty chart data on error
      } finally {
        setAnalyticsLoading(false);
      }
    };

    if (user?.id) {
      loadDashboardData();
      loadSalesAnalytics();
    }
  }, [user?.id, selectedPeriod]);

  const formatNumber = (num) => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue)) return '0';
    
    if (numValue >= 1000000) {
      return (numValue / 1000000).toFixed(1) + 'M';
    } else if (numValue >= 1000) {
      return (numValue / 1000).toFixed(1) + 'K';
    }
    return numValue.toLocaleString();
  };

  // ✅ ADD: New function for price formatting with 2 decimal places
  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(price)) return '0.00';
    const numValue = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numValue)) return '0.00';
    
    // ✅ Always show 2 decimal places for prices
    return numValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getSafeOrderData = (order, field, fallback = '') => {
    if (!order || typeof order !== 'object') return fallback;
    
    const fieldMapping = {
      id: order.orderNumber || order._id || fallback,
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : fallback,
      customerName: order.customerInfo?.name || fallback,
      location: order.shippingAddress?.city || order.shippingAddress?.street || fallback,
      amount: order.totalAmount || order.totalWithShipping || 0,
      // ✅ FIX: Use displayStatus (vendor-specific) instead of overall status
      status: order.displayStatus || order.vendorOrderStatus || order.status || order.paymentStatus || fallback
    };
    
    return fieldMapping[field] !== undefined ? fieldMapping[field] : order[field] !== undefined ? order[field] : fallback;
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = (status || '').toLowerCase();
    
    // ✅ Map PENDING to CONFIRMED for display
    const displayStatus = normalizedStatus === 'pending' ? 'confirmed' : normalizedStatus;
    
    const statusConfig = {
      pending: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🔵' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🔵' },
      processing: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: '🟣' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: '🟢' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴' },
    };

    const config = statusConfig[displayStatus] || statusConfig.confirmed;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon} {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
      </span>
    );
  };

  const filteredOrders = statusFilter === 'all' 
    ? orderHistory 
    : orderHistory.filter(order => {
        // ✅ Use displayStatus for filtering
        const orderStatus = (order.displayStatus || order.vendorOrderStatus || order.status || order.paymentStatus || '').toLowerCase();
        const filterStatus = statusFilter.toLowerCase();
        
        // Map PENDING to CONFIRMED for filtering
        const normalizedOrderStatus = orderStatus === 'pending' ? 'confirmed' : orderStatus;
        const normalizedFilterStatus = filterStatus === 'pending' ? 'confirmed' : filterStatus;
        
        return normalizedOrderStatus === normalizedFilterStatus;
      });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-8 py-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.storeName || 'Vendor'}! 👋
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              Here's your store performance overview
            </p>
          </div>

          <div className="flex items-center gap-6">
            
            <div className="flex items-center gap-4">
              
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {(user?.storeName || 'V')[0].toUpperCase()}
                  </span>
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">{user?.storeName || 'Vendor'}</div>
                  <div className="text-gray-500">{user?.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Orders */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {dashboardData?.totalOrders?.change || '0%'}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatNumber(dashboardData?.totalOrders?.value)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Orders</div>
                  <div className="text-xs text-gray-500 mt-2">
                    📈 {dashboardData?.totalOrders?.period || 'this week'}
                  </div>
                </div>
              </div>

              {/* Active Orders */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                    {dashboardData?.activeOrders?.change || '0%'}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatNumber(dashboardData?.activeOrders?.value)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Active Orders</div>
                  <div className="text-xs text-gray-500 mt-2">
                    📈 {dashboardData?.activeOrders?.period || 'this week'}
                  </div>
                </div>
              </div>

              {/* Completed Orders */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    dashboardData?.completedOrders?.change?.startsWith('-') 
                      ? 'text-red-600 bg-red-100' 
                      : 'text-green-600 bg-green-100'
                  }`}>
                    {dashboardData?.completedOrders?.change || '0%'}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatNumber(dashboardData?.completedOrders?.value)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Completed Orders</div>
                  <div className="text-xs text-gray-500 mt-2">
                    {dashboardData?.completedOrders?.change?.startsWith('-') ? '📉' : '📈'} {dashboardData?.completedOrders?.period || 'this week'}
                  </div>
                </div>
              </div>

              {/* Revenue Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {salesAnalytics?.stats?.growth?.revenue > 0 ? '+' : ''}{salesAnalytics?.stats?.growth?.revenue?.toFixed(1) || '0'}%
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {/* ✅ Use formatPrice for revenue with 2 decimals */}
                    ₦{formatPrice(salesAnalytics?.stats?.totalRevenue || dashboardData?.totalRevenue?.value || 0)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Revenue</div>
                  <div className="text-xs text-gray-500 mt-2">
                    📈 Avg: ₦{formatPrice(salesAnalytics?.stats?.averageOrderValue || 0)}/order
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="px-8 pb-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trends Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="h-80">
              {analyticsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <RevenueChart data={salesAnalytics.revenueTrends} />
              )}
            </div>
          </div>

          {/* Sales Status Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Status</h3>
            <div className="h-80">
              {analyticsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <SalesStatusChart data={salesAnalytics.salesByStatus} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products Section */}
      {salesAnalytics?.topProducts && salesAnalytics.topProducts.length > 0 && (
        <div className="px-8 pb-8">
          <div className="max-w-7xl mx-auto bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Top Selling Products</h2>
                <p className="text-sm text-gray-500">Best performers this period</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {salesAnalytics.topProducts.slice(0, 3).map((product, index) => (
                <div key={product.productId} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                      <p className="text-xs text-gray-500">{product.totalSold} units sold</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-600">Revenue</div>
                      {/* ✅ Use formatPrice for revenue */}
                      <div className="text-lg font-bold text-gray-900">₦{formatPrice(product.totalRevenue)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">Avg Price</div>
                      {/* ✅ Use formatPrice for average */}
                      <div className="text-sm font-semibold text-gray-700">₦{formatPrice(product.averagePrice)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Order History Table - keep existing implementation */}
      <div className="px-8 pb-8">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
                  {statusFilter !== 'all' && ` (${orderHistory.length} total)`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select 
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Orders</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-8"></div></td>
                    </tr>
                  ))
                ) : currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <span className="text-2xl">📦</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500">Orders will appear here once customers start purchasing from your store.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order, index) => (
                    <tr key={getSafeOrderData(order, 'id', `order-${index}`)} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {getSafeOrderData(order, 'id', 'N/A')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getSafeOrderData(order, 'date', 'N/A')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-blue-600">
                              {getSafeOrderData(order, 'customerName', 'U')[0]}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {getSafeOrderData(order, 'customerName', 'Unknown Customer')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getSafeOrderData(order, 'location', 'N/A')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">
                          ₦{formatPrice(getSafeOrderData(order, 'amount', 0))}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(getSafeOrderData(order, 'status', 'Pending'))}
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          ⋯
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ FIXED: Complete Pagination */}
          {filteredOrders.length > ordersPerPage && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} results
                  {statusFilter !== 'all' && (
                    <span className="ml-2 text-gray-400">({orderHistory.length} total)</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNumber = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (pageNumber > totalPages) return null;
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === pageNumber
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardContent;