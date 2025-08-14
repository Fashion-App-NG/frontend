import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import vendorAnalyticsService from '../../services/vendorAnalyticsService';

export const VendorDashboardContent = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ ADD: Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // ✅ FIX: Load sequentially to avoid 429 rate limiting
        const summaryData = await vendorAnalyticsService.getDashboardSummary();
        console.log('🔍 DASHBOARD SUMMARY DETAILED:', {
          rawData: summaryData,
          keys: Object.keys(summaryData || {}),
          totalOrdersPath: summaryData?.totalOrders,
          totalOrdersValue: summaryData?.totalOrders?.value,
          allValues: summaryData
        });
        
        setDashboardData(summaryData);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const historyData = await vendorAnalyticsService.getOrderHistory();
        console.log('🔍 ORDER HISTORY DETAILED:', {
          rawData: historyData,
          isArray: Array.isArray(historyData),
          length: Array.isArray(historyData) ? historyData.length : 'N/A',
          firstItem: Array.isArray(historyData) ? historyData[0] : 'N/A',
          keys: historyData && typeof historyData === 'object' ? Object.keys(historyData) : 'N/A'
        });
        
        // ✅ ENHANCED: Better data validation with detailed logging
        let processedOrderHistory = [];
        if (Array.isArray(historyData)) {
          processedOrderHistory = historyData;
          console.log('📊 Using direct array data');
        } else if (historyData && typeof historyData === 'object') {
          if (historyData.orders && Array.isArray(historyData.orders)) {
            processedOrderHistory = historyData.orders;
            console.log('📊 Using historyData.orders');
          } else if (historyData.data && Array.isArray(historyData.data)) {
            processedOrderHistory = historyData.data;
            console.log('📊 Using historyData.data');
          } else {
            console.log('🔍 Searching for arrays in:', Object.keys(historyData));
            // Look for any array property
            const arrayValues = Object.values(historyData).filter(val => Array.isArray(val));
            if (arrayValues.length > 0) {
              processedOrderHistory = arrayValues[0];
              console.log('📊 Found array property with length:', arrayValues[0].length);
            } else {
              console.warn('⚠️ No arrays found in historyData');
            }
          }
        }
        
        setOrderHistory(processedOrderHistory);
        console.log('✅ Final processed data:', {
          dashboardData: summaryData,
          orderHistoryLength: processedOrderHistory.length,
          firstOrder: processedOrderHistory[0]
        });
        
      } catch (error) {
        console.error('❌ Failed to load dashboard data:', error);
        setError(error.message);
        setDashboardData(null);
        setOrderHistory([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  // ✅ ENHANCED: Better number formatting
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

  const getSafeOrderData = (order, field, fallback = '') => {
    if (!order || typeof order !== 'object') return fallback;
    
    // ✅ FIX: Map API fields to expected frontend fields
    const fieldMapping = {
      id: order.orderNumber || order._id || fallback,
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : fallback,
      customerName: order.customerInfo?.name || fallback,
      location: order.shippingAddress?.city || order.shippingAddress?.street || fallback,
      amount: order.totalAmount || order.totalWithShipping || 0,
      status: order.status || order.paymentStatus || fallback
    };
    
    return fieldMapping[field] !== undefined ? fieldMapping[field] : order[field] !== undefined ? order[field] : fallback;
  };

  // ✅ ADD: Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orderHistory.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orderHistory.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ✅ ENHANCED: Better Header Design */}
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
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search orders, customers..."
                className="w-80 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-12 text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <div className="text-xl">🔔</div>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </button>
              
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

      {/* ✅ ENHANCED: Better Stats Cards */}
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
                    +{dashboardData?.totalOrders?.change || '0%'}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatNumber(dashboardData?.totalOrders?.value)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Orders</div>
                  <div className="text-xs text-gray-500 mt-2">
                    📈 +10.2 this week
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
                    +{dashboardData?.activeOrders?.change || '0%'}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatNumber(dashboardData?.activeOrders?.value)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Active Orders</div>
                  <div className="text-xs text-gray-500 mt-2">
                    📈 +3.1 this week
                  </div>
                </div>
              </div>

              {/* Completed Orders */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                    {dashboardData?.completedOrders?.change || '0%'}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatNumber(dashboardData?.completedOrders?.value)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Completed Orders</div>
                  <div className="text-xs text-gray-500 mt-2">
                    📉 -2.56 this week
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    +12.5%
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    ₦{formatNumber(59492)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Revenue</div>
                  <div className="text-xs text-gray-500 mt-2">
                    📈 +₦7.2K this week
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ ENHANCED: Better Charts Section */}
      <div className="px-8 pb-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Analytics Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order Analytics</h2>
                <p className="text-sm text-gray-500">Monthly order trends</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">Offline</span>
                </div>
                <select className="text-sm border border-gray-200 rounded-lg px-3 py-1">
                  <option>Monthly</option>
                  <option>Weekly</option>
                  <option>Daily</option>
                </select>
              </div>
            </div>
            
            {/* Enhanced Chart Placeholder */}
            <div className="h-64 bg-gradient-to-br from-blue-50 to-orange-50 rounded-xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center">
              <div className="text-6xl mb-4">📈</div>
              <div className="text-lg font-semibold text-gray-700 mb-2">Order Trends Chart</div>
              <div className="text-sm text-gray-500 text-center max-w-xs">
                Beautiful line chart showing online vs offline order trends over the last 12 months
              </div>
              <div className="mt-4 flex gap-2">
                <div className="w-2 h-8 bg-blue-400 rounded animate-pulse"></div>
                <div className="w-2 h-12 bg-orange-400 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-6 bg-blue-400 rounded animate-pulse" style={{animationDelay: '0.4s'}}></div>
                <div className="w-2 h-10 bg-orange-400 rounded animate-pulse" style={{animationDelay: '0.6s'}}></div>
                <div className="w-2 h-8 bg-blue-400 rounded animate-pulse" style={{animationDelay: '0.8s'}}></div>
              </div>
            </div>
          </div>

          {/* Earnings Donut Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Revenue</h2>
                <p className="text-sm text-gray-500">By sales channel</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">⋯</button>
            </div>
            
            {/* Enhanced Donut Chart Placeholder */}
            <div className="h-48 flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border-8 border-gray-100"></div>
                <div className="absolute inset-0 rounded-full border-8 border-green-400 border-r-transparent border-b-transparent animate-spin" style={{animationDuration: '3s'}}></div>
                <div className="absolute inset-4 rounded-full border-6 border-orange-400 border-l-transparent border-t-transparent"></div>
                <div className="absolute inset-8 rounded-full border-4 border-blue-400 border-r-transparent border-b-transparent"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">₦59.5K</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">Online Sales</span>
                </div>
                <div className="text-sm font-bold text-gray-900">45%</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">Offline Sales</span>
                </div>
                <div className="text-sm font-bold text-gray-900">35%</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">Wholesale</span>
                </div>
                <div className="text-sm font-bold text-gray-900">20%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ ENHANCED: Better Order List with Pagination */}
      <div className="px-8 pb-8">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, orderHistory.length)} of {orderHistory.length} orders
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option>All Orders</option>
                  <option>Pending</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
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
                          ₦{formatNumber(getSafeOrderData(order, 'amount', 0))}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          🟡 {getSafeOrderData(order, 'status', 'Pending')}
                        </span>
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
          {orderHistory.length > ordersPerPage && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, orderHistory.length)} of {orderHistory.length} results
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