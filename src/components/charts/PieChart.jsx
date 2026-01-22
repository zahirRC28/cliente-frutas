import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const PieChart = ({ labels, data, label }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        backgroundColor: [
          '#2563eb',
          '#facc15',
          '#16a34a',
          '#dc2626',
          '#8b5cf6'
        ],
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom', 
        labels: { boxWidth: 12, font: { size: 12 }, padding: 12 }
      },
      tooltip: { enabled: true }
    }
  };

  return <Pie data={chartData} options={options} />;
};