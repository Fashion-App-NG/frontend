import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const SalesStatusChart = ({ data }) => {
  // ✅ ADD: Check if data exists and has valid values
  if (!data || !data.datasets || !data.datasets[0] || !data.datasets[0].data) {
    return (
      <div className="relative h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">No sales data available yet</p>
        </div>
      </div>
    );
  }

  // ✅ ADD: Calculate total and check if it's valid
  const total = data.datasets[0].data.reduce((a, b) => (a || 0) + (b || 0), 0);
  
  // ✅ ADD: Show placeholder if total is 0 or NaN
  if (total === 0 || isNaN(total)) {
    return (
      <div className="relative h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-32 h-32 rounded-full border-8 border-gray-200 mx-auto mb-4"></div>
          <p className="text-sm font-medium">No sales recorded</p>
          <p className="text-xs mt-1">Sales data will appear here once you have orders</p>
        </div>
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            
            // ✅ FIX: Format with proper Naira symbol and handle 0 values
            return `${label}: ₦${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%',
  };

  return (
    <div className="relative h-full">
      <Doughnut options={options} data={data} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '-20%' }}>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {/* ✅ FIX: Show 0 instead of NaN, and format properly */}
            ₦{total > 0 ? (total >= 1000 ? (total / 1000).toFixed(1) + 'K' : total.toLocaleString()) : '0'}
          </div>
          <div className="text-xs text-gray-500">Total Revenue</div>
        </div>
      </div>
    </div>
  );
};