import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export const LineChart = ({ labels, data, label }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        tension: 0.4,
        borderColor: '#1aa531',
        backgroundColor: 'rgba(37,99,235,0.2)',
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true }
    }
  };

  return <Line data={chartData} options={options} />;
};