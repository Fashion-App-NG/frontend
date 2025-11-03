import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { RevenueChart } from '../components/Vendor/charts/RevenueChart';
import { SalesStatusChart } from '../components/Vendor/charts/SalesStatusChart';
import { useAuth } from '../contexts/AuthContext';
import vendorAnalyticsService from '../services/vendorAnalyticsService';

export const VendorSalesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [salesAnalytics, setSalesAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  useEffect(() => {
    const loadSalesAnalytics = async () => {
      setLoading(true);
      
      try {
        const analytics = await vendorAnalyticsService.getSalesAnalytics(selectedPeriod);
        console.log('📊 Sales Analytics Loaded:', analytics);
        setSalesAnalytics(analytics);
      } catch (error) {
        console.error('❌ Failed to load sales analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadSalesAnalytics();
    }
  }, [user?.id, selectedPeriod]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Sales Analytics</h1>
              <p className="text-gray-600">Comprehensive sales performance overview</p>
            </div>
            
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium"
            >
              <option value="daily">Last 30 Days</option>
              <option value="weekly">Last 12 Weeks</option>
              <option value="monthly">Last 12 Months</option>
              <option value="yearly">Last 5 Years</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin text-6xl mb-4">⏳</div>
              <div className="text-lg text-gray-600">Loading analytics...</div>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {salesAnalytics?.stats?.growth?.revenue > 0 ? '+' : ''}{salesAnalytics?.stats?.growth?.revenue?.toFixed(1) || '0'}%
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    ₦{formatNumber(salesAnalytics?.stats?.totalRevenue || 0)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Revenue</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {salesAnalytics?.stats?.growth?.orders > 0 ? '+' : ''}{salesAnalytics?.stats?.growth?.orders?.toFixed(1) || '0'}%
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatNumber(salesAnalytics?.stats?.totalOrders || 0)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Orders</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💵</span>
                  </div>
                  <div className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {salesAnalytics?.stats?.growth?.averageOrderValue > 0 ? '+' : ''}{salesAnalytics?.stats?.growth?.averageOrderValue?.toFixed(1) || '0'}%
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    ₦{formatNumber(salesAnalytics?.stats?.averageOrderValue || 0)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Avg Order Value</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {salesAnalytics?.topProducts?.length || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Top Products</div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Revenue Trends Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Revenue & Orders Trends</h2>
                  <p className="text-sm text-gray-500">Performance over time</p>
                </div>
                
                <div className="h-80">
                  {salesAnalytics?.revenueTrends ? (
                    <RevenueChart data={salesAnalytics.revenueTrends} />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <div className="text-sm text-gray-600">No data available</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sales by Status Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Sales by Status</h2>
                  <p className="text-sm text-gray-500">Revenue breakdown</p>
                </div>
                
                <div className="h-80">
                  {salesAnalytics?.salesByStatus ? (
                    <SalesStatusChart data={salesAnalytics.salesByStatus} />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <div className="text-sm text-gray-600">No data available</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top Products Section */}
            {salesAnalytics?.topProducts && salesAnalytics.topProducts.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Top Selling Products</h2>
                  <p className="text-sm text-gray-500">Best performers this period</p>
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
                          <div className="text-lg font-bold text-gray-900">₦{formatNumber(product.totalRevenue)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-600">Avg Price</div>
                          <div className="text-sm font-semibold text-gray-700">₦{formatNumber(product.averagePrice)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VendorSalesPage;