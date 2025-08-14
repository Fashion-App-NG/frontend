import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import vendorAnalyticsService from '../../services/vendorAnalyticsService';
import VendorAnalyticsVerification from './VendorAnalyticsVerification';

// React Component: Main vendor dashboard content matching design
export const VendorDashboardContent = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]); // ✅ Always initialize as array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // ✅ Add error state

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null); // ✅ Reset error state
      
      try {
        // Load dashboard summary and order history concurrently
        const [summaryData, historyData] = await Promise.all([
          vendorAnalyticsService.getDashboardSummary(),
          vendorAnalyticsService.getOrderHistory()
        ]);

        console.log('📊 RAW API RESPONSES:', { 
          summaryData, 
          historyData,
          summaryType: typeof summaryData,
          historyType: typeof historyData,
          historyIsArray: Array.isArray(historyData)
        });

        // ✅ ENHANCED: Better data validation
        setDashboardData(summaryData || null);
        
        // ✅ ENHANCED: Multiple fallback layers for orderHistory
        let processedOrderHistory = [];
        
        if (Array.isArray(historyData)) {
          processedOrderHistory = historyData;
        } else if (historyData && typeof historyData === 'object') {
          // Try to extract array from nested object
          if (historyData.orders && Array.isArray(historyData.orders)) {
            processedOrderHistory = historyData.orders;
          } else if (historyData.data && Array.isArray(historyData.data)) {
            processedOrderHistory = historyData.data;
          } else {
            // Look for any array property
            const arrayValues = Object.values(historyData).filter(val => Array.isArray(val));
            if (arrayValues.length > 0) {
              processedOrderHistory = arrayValues[0];
            }
          }
        }
        
        setOrderHistory(processedOrderHistory);
        
        console.log('📊 PROCESSED DATA:', { 
          dashboardData: summaryData,
          orderHistoryLength: processedOrderHistory.length,
          firstOrder: processedOrderHistory[0]
        });
        
      } catch (error) {
        console.error('❌ Failed to load dashboard data:', error);
        setError(error.message);
        // ✅ ENHANCED: Ensure fallback data on error
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

  // ✅ ENHANCED: Safe formatNumber function
  const formatNumber = (num) => {
    // Handle undefined, null, or invalid numbers
    if (num === undefined || num === null || isNaN(num)) {
      return '0';
    }
    
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    
    if (isNaN(numValue)) {
      return '0';
    }
    
    if (numValue >= 1000) {
      return (numValue / 1000).toFixed(1) + 'K';
    }
    
    return numValue.toLocaleString();
  };

  // ✅ ENHANCED: Safe formatCurrency function
  const formatCurrency = (amount) => {
    return `₦${formatNumber(amount)}`;
  };

  // ✅ ADD: Safe order data extraction
  const getSafeOrderData = (order, field, fallback = '') => {
    if (!order || typeof order !== 'object') return fallback;
    return order[field] !== undefined ? order[field] : fallback;
  };

  return (
    <div className="min-h-screen bg-[#d8dfe9]">
      {/* Header */}
      <header className="bg-white border-b border-black/8 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Welcome Section */}
          <div>
            <h1 className="text-[32px] font-bold text-[#3e3e3e] leading-[150%]">
              Welcome {user?.storeName || 'Vendor'}
            </h1>
            <p className="text-[16px] text-[#2e2e2e] leading-[120%] w-[312px]">
              Here is the information about all your orders
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-[284px]">
            <div className="flex items-center bg-[#f5f5f5] rounded-[50px] px-3 py-2 gap-2">
              <div className="w-6 h-6">🔍</div>
              <input 
                type="text" 
                placeholder="Search"
                className="flex-1 bg-transparent outline-none text-[#9e9e9e] text-[16px]"
              />
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <div className="w-6 h-6">🔔</div>
            <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden">
              <img 
                src="/api/placeholder/36/36" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ✅ Analytics Verification Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-6 pt-5">
          <VendorAnalyticsVerification />
        </div>
      )}

      {/* ✅ Enhanced Error Display */}
      {error && (
        <div className="px-6 pt-5">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h4 className="font-medium text-red-800 mb-2">⚠️ Error Loading Dashboard Data</h4>
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ✅ UPDATED: Dynamic Stats Cards */}
      <div className="px-6 py-5">
        <div className="bg-[#f9f9f9] border border-[#e6edff] rounded-[5px] p-5">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading dashboard data...</div>
          ) : (
            <div className="grid grid-cols-4 gap-[38px]">
              {/* Total Orders */}
              <div className="flex flex-col gap-3">
                <div>
                  <div className="text-[28px] font-bold leading-[150%] text-black">
                    {formatNumber(dashboardData?.totalOrders?.value)}
                  </div>
                  <div className="text-[16px] leading-[150%] text-black">Total orders</div>
                </div>
                <div className="flex items-center gap-3 text-[14px] text-[#7c8db5]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5">
                      {dashboardData?.totalOrders?.trend === 'up' ? '📈' : '📉'}
                    </div>
                    <span>10.2</span>
                  </div>
                  <span>{dashboardData?.totalOrders?.change || '+0%'} {dashboardData?.totalOrders?.period || 'this week'}</span>
                </div>
              </div>

              <div className="w-px bg-[#e6edff] h-[103px] -ml-[19px]"></div>

              {/* Active Orders */}
              <div className="flex flex-col gap-3 -ml-[19px]">
                <div>
                  <div className="text-[28px] font-bold leading-[150%] text-black">
                    {formatNumber(dashboardData?.activeOrders?.value)}
                  </div>
                  <div className="text-[16px] leading-[150%] text-black">Active orders</div>
                </div>
                <div className="flex items-center gap-3 text-[14px] text-[#7c8db5]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5">
                      {dashboardData?.activeOrders?.trend === 'up' ? '📈' : '📉'}
                    </div>
                    <span>3.1</span>
                  </div>
                  <span>{dashboardData?.activeOrders?.change || '+0%'} {dashboardData?.activeOrders?.period || 'this week'}</span>
                </div>
              </div>

              <div className="w-px bg-[#e6edff] h-[103px] -ml-[19px]"></div>

              {/* Completed Orders */}
              <div className="flex flex-col gap-3 -ml-[19px]">
                <div>
                  <div className="text-[28px] font-bold leading-[150%] text-black">
                    {formatNumber(dashboardData?.completedOrders?.value)}
                  </div>
                  <div className="text-[16px] leading-[150%] text-black">Completed orders</div>
                </div>
                <div className="flex items-center gap-3 text-[14px] text-[#7c8db5]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5">
                      {dashboardData?.completedOrders?.trend === 'up' ? '📈' : '📉'}
                    </div>
                    <span>2.56</span>
                  </div>
                  <span>{dashboardData?.completedOrders?.change || '+0%'} {dashboardData?.completedOrders?.period || 'this week'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Section - Keep existing placeholder for now */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Order Analytics Chart */}
          <div className="col-span-2 bg-[#f9f9f9] border border-[#e6edff] rounded-[5px] p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[24px] font-bold text-black">Order Analytics</h2>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#347ae2]"></div>
                  <span className="text-[12px] font-medium text-black">Offline orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#ff9500]"></div>
                  <span className="text-[12px] font-medium text-black">Online orders</span>
                </div>
                <div className="bg-white rounded-lg px-3 py-1 shadow-sm">
                  <div className="flex items-center gap-1 text-[12px] font-medium">
                    <span>Monthly</span>
                    <div className="w-4 h-4">▼</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Chart placeholder */}
            <div className="h-[200px] bg-white rounded border flex items-center justify-center text-gray-500">
              📊 Order Analytics Chart
            </div>
          </div>

          {/* Earnings Chart */}
          <div className="bg-[#f9f9f9] border border-[#e6edff] rounded-[5px] p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-bold text-black">Earnings</h2>
              <div className="w-6 h-6">⋯</div>
            </div>
            {/* Circle chart placeholder */}
            <div className="h-[216px] flex items-center justify-center text-gray-500">
              🟢 Earnings Chart
            </div>
            <div className="flex items-center justify-center gap-5 mt-5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#34c759]"></div>
                <span className="text-[12px] font-medium text-black">Offline</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#ff9500]"></div>
                <span className="text-[12px] font-medium text-black">Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#347ae2]"></div>
                <span className="text-[12px] font-medium text-black">Trade</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: Dynamic Order List */}
      <div className="px-6 pb-6">
        <div className="bg-[#f9f9f9] border border-[#e6edff] rounded-t-[10px] p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[24px] font-bold text-black">Order List</h2>
            <div className="bg-white rounded-lg px-3 py-1 shadow-sm">
              <div className="flex items-center gap-1 text-[12px] font-medium">
                <span>Monthly</span>
                <div className="w-4 h-4">▼</div>
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-8 gap-4 bg-[#f9f9f9] py-4 border-b border-black/8 text-[12px] font-semibold text-black">
            <div className="text-center">No</div>
            <div>ID</div>
            <div>Date</div>
            <div>Customer Name</div>
            <div>Location</div>
            <div>Amount</div>
            <div>Status Order</div>
            <div>Action</div>
          </div>

          {/* ✅ BULLETPROOF: Order Rows with Multiple Safety Checks */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading orders...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <p>Failed to load orders</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : !Array.isArray(orderHistory) ? (
            <div className="text-center py-12 text-yellow-600">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <p>Invalid order data format</p>
              <p className="text-sm">Order data is not an array: {typeof orderHistory}</p>
            </div>
          ) : orderHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <p>No orders yet</p>
              <p className="text-sm">Orders will appear here once customers start purchasing</p>
            </div>
          ) : (
            orderHistory.map((order, index) => (
              <div key={getSafeOrderData(order, 'id', `order-${index}`)} className="grid grid-cols-8 gap-4 py-4 border-b border-black/8 text-[12px] text-[#111]">
                <div className="text-center font-medium">{index + 1}</div>
                <div className="font-medium">{getSafeOrderData(order, 'id', 'N/A')}</div>
                <div>{getSafeOrderData(order, 'date', 'N/A')}</div>
                <div className="font-medium">{getSafeOrderData(order, 'customerName', 'Unknown Customer')}</div>
                <div>{getSafeOrderData(order, 'location', 'N/A')}</div>
                <div className="flex items-center gap-1">
                  <span>₦</span>
                  <span className="font-medium">{formatNumber(getSafeOrderData(order, 'amount', 0))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    getSafeOrderData(order, 'statusColor', 'gray') === 'green' ? "bg-[#34c759]" : 
                    getSafeOrderData(order, 'statusColor', 'gray') === 'red' ? "bg-[#cd0000]" : "bg-[#ff9500]"
                  }`}></div>
                  <span className="bg-white px-3 py-1 rounded-lg shadow-sm text-[#2e2e2e]">
                    {getSafeOrderData(order, 'status', 'Unknown')}
                  </span>
                </div>
                <div className="text-center">
                  <button className="w-8 h-8 hover:bg-gray-100 rounded">⋯</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ✅ Enhanced Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-6 pt-2">
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <h4 className="font-medium text-green-800 mb-2">🔍 ORDER HISTORY DEBUG:</h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <p><strong>Order History Type:</strong> {typeof orderHistory}</p>
                <p><strong>Is Array:</strong> {Array.isArray(orderHistory) ? '✅' : '❌'}</p>
                <p><strong>Length:</strong> {Array.isArray(orderHistory) ? orderHistory.length : 'N/A'}</p>
                <p><strong>Has Error:</strong> {error ? '❌ ' + error : '✅'}</p>
              </div>
              <div>
                <p><strong>Dashboard Data Type:</strong> {typeof dashboardData}</p>
                <p><strong>Has Dashboard Data:</strong> {dashboardData ? '✅' : '❌'}</p>
                <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p><strong>User ID:</strong> {user?.id || 'Not found'}</p>
                <p><strong>User Role:</strong> {user?.role || 'Not found'}</p>
                <p><strong>Store Name:</strong> {user?.storeName || 'Not found'}</p>
              </div>
            </div>
            
            {orderHistory && !Array.isArray(orderHistory) && (
              <details className="mt-2">
                <summary className="cursor-pointer text-green-600 text-sm">⚠️ Non-Array Order History Structure</summary>
                <pre className="mt-1 p-2 bg-green-100 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(orderHistory, null, 2)}
                </pre>
              </details>
            )}
            
            {Array.isArray(orderHistory) && orderHistory.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-green-600 text-sm">📋 First Order Sample</summary>
                <pre className="mt-1 p-2 bg-green-100 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(orderHistory[0], null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboardContent;