import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const SalesStatusChart = ({ data }) => {
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
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            
            return `${label}: ₦${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%',
  };

  // Calculate total for center text
  const total = data.datasets[0].data.reduce((a, b) => a + b, 0);

  return (
    <div className="relative h-full">
      <Doughnut options={options} data={data} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '-20%' }}>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            ₦{(total / 1000).toFixed(1)}K
          </div>
          <div className="text-xs text-gray-500">Total Revenue</div>
        </div>
      </div>
    </div>
  );
};