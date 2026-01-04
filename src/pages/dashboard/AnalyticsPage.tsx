import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { getGrowthData, GrowthData } from '../../services/apiService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const growth = await getGrowthData();
        setData(growth);
      } catch (error) {
        console.error('Error fetching growth data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const lineChartData = {
    labels: data?.newsGrowth.map(d => d.month) || [],
    datasets: [
      {
        label: 'News Posts',
        data: data?.newsGrowth.map(d => d.count) || [],
        fill: true,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: data?.userGrowth.map(d => d.month) || [],
    datasets: [
      {
        label: 'New Users',
        data: data?.userGrowth.map(d => d.count) || [],
        backgroundColor: 'rgba(20, 184, 166, 0.6)',
        borderColor: 'rgb(20, 184, 166)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)'
        }
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      }
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">System Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400">Deeper insights into content performance and user engagement.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* News Growth Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">Content Publication Trend</h3>
          <div className="h-80">
            <Line data={lineChartData} options={options} />
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">User Acquisition</h3>
          <div className="h-80">
            <Bar data={barChartData} options={options} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Engagement Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">12.5%</p>
            <p className="text-xs text-green-500 mt-1">↑ 2.1% from last month</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Session Duration</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">4m 32s</p>
            <p className="text-xs text-blue-500 mt-1">Stable</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Bounce Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">38.2%</p>
            <p className="text-xs text-red-500 mt-1">↓ 1.4% from last month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;