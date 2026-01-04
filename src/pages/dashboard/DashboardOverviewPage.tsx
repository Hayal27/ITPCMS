import React, { useEffect, useState } from 'react';
import { getDashboardStats, DashboardStats } from '../../services/apiService';
import {
  HiOutlineNewspaper,
  HiOutlineUserGroup,
  HiOutlineChatAlt2,
  HiOutlineMailOpen,
  HiOutlineUserAdd,
  HiOutlineClipboardList
} from "react-icons/hi";

const DashboardOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Posts',
      value: stats?.totalPosts || 0,
      icon: <HiOutlineNewspaper className="w-8 h-8" />,
      color: 'blue',
      description: 'Published news & articles'
    },
    {
      title: 'Active Users',
      value: stats?.totalUsers || 0,
      icon: <HiOutlineUserGroup className="w-8 h-8" />,
      color: 'green',
      description: 'Registered system users'
    },
    {
      title: 'Pending Comments',
      value: stats?.pendingComments || 0,
      icon: <HiOutlineChatAlt2 className="w-8 h-8" />,
      color: 'amber',
      description: 'Awaiting moderation'
    },
    {
      title: 'Active Subscribers',
      value: stats?.activeSubscribers || 0,
      icon: <HiOutlineMailOpen className="w-8 h-8" />,
      color: 'purple',
      description: 'Newsletter subscribers'
    },
    {
      title: 'Pending Inquiries',
      value: stats?.pendingInquiries || 0,
      icon: <HiOutlineClipboardList className="w-8 h-8" />,
      color: 'rose',
      description: 'Investor inquiries'
    },
    {
      title: 'New Messages',
      value: stats?.newMessages || 0,
      icon: <HiOutlineUserAdd className="w-8 h-8" />,
      color: 'teal',
      description: 'Contact form submissions'
    }
  ];

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-${card.color}-500/10 rounded-full blur-2xl group-hover:bg-${card.color}-500/20 transition-all`}></div>

            <div className="flex items-center gap-5">
              <div className={`flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-${card.color}-50 dark:bg-${card.color}-900/20 text-${card.color}-600 dark:text-${card.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{card.title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                    {card.value.toLocaleString()}
                  </h3>
                </div>
                <p className="text-xs text-gray-400 mt-1 truncate">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              Recent News Growth
            </h3>
            <button className="text-sm text-blue-600 hover:underline">View Analytics</button>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Placeholder for a simplified growth line chart.</p>
          <div className="h-48 mt-4 flex items-end gap-3 px-2">
            {/* Simple visual representation of growth */}
            {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
              <div key={i} className="flex-1 bg-blue-500/20 rounded-t-lg group relative h-full flex flex-col justify-end">
                <div className="bg-blue-600 rounded-t-lg transition-all duration-500 group-hover:bg-blue-400" style={{ height: `${h}%` }}></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-teal-600 rounded-full"></span>
              System Alerts
            </h3>
          </div>
          <div className="space-y-4">
            {stats?.pendingComments && stats.pendingComments > 0 ? (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                  <HiOutlineChatAlt2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">{stats.pendingComments} Comments pending</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-0.5">Moderation required to go public</p>
                </div>
              </div>
            ) : null}
            {stats?.pendingInquiries && stats.pendingInquiries > 0 ? (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                  <HiOutlineClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">{stats.pendingInquiries} Investor inquiries</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400/80 mt-0.5">Potential partners awaiting response</p>
                </div>
              </div>
            ) : null}
            {(!stats?.pendingComments && !stats?.pendingInquiries) && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No urgent alerts. All caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverviewPage;
