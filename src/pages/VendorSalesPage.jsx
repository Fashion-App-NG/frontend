import { useEffect, useState } from 'react';
import { RevenueChart } from '../components/Vendor/charts/RevenueChart';
import { SalesStatusChart } from '../components/Vendor/charts/SalesStatusChart';
import { useRequireAuth } from '../hooks/useRequireAuth';
import vendorAnalyticsService from '../services/vendorAnalyticsService';

const VendorSalesPage = () => {
  // ✅ Auth check
  const { user, loading: authLoading, isAuthorized } = useRequireAuth({
    requiredRole: 'vendor',
    redirectTo: '/login/vendor'
  });

  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);

  // ✅ Initialize with default chart data structure
  const [salesAnalytics, setSalesAnalytics] = useState({
    revenueData: {
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
    statusData: {
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
    const loadSalesData = async () => {
      if (!isAuthorized || !user?.id) return;

      setLoading(true);
      try {
        const analytics = await vendorAnalyticsService.getSalesAnalytics(selectedPeriod);
        
        // ✅ Merge with defaults to ensure structure exists
        if (analytics) {
          setSalesAnalytics(prevState => ({
            revenueData: analytics.revenueData || analytics.revenueTrends || prevState.revenueData,
            statusData: analytics.statusData || analytics.salesByStatus || prevState.statusData
          }));
        }
      } catch (error) {
        console.error('Failed to load sales analytics:', error);
        // Keep default empty chart data on error
      } finally {
        setLoading(false);
      }
    };

    loadSalesData();
  }, [user?.id, isAuthorized, selectedPeriod]);

  // ✅ Show loading while auth checks
  if (authLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sales Analytics</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Revenue Trends</h3>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="h-80">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <RevenueChart data={salesAnalytics.revenueData} period={selectedPeriod} />
              )}
            </div>
          </div>

          {/* Sales Status Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Sales by Status</h3>
            <div className="h-80">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <SalesStatusChart data={salesAnalytics.statusData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSalesPage;