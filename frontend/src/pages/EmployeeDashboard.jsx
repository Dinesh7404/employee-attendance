import { useState, useEffect } from 'react';
import { Clock, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import apiClient from '../api/apiClient';
import { useAuthStore } from '../store/authStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
  present: '#22c55e',
  late: '#facc15',
  halfDay: '#f97316',
  absent: '#ef4444'
};

export default function EmployeeDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/dashboard/employee');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await apiClient.post('/attendance/checkin');
      alert('Checked in successfully!');
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await apiClient.post('/attendance/checkout');
      alert('Checked out successfully!');
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to check out');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // Prepare pie chart data
  const pieData = [
    { name: 'Present', value: stats?.thisMonth?.present || 0, color: COLORS.present },
    { name: 'Late', value: stats?.thisMonth?.late || 0, color: COLORS.late },
    { name: 'Half Day', value: stats?.thisMonth?.halfDay || 0, color: COLORS.halfDay },
  ];

  // Filter out zero values
  const filteredPieData = pieData.filter(item => item.value > 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-600 mt-1">Here's your attendance overview</p>
        </div>

        {/* Check In/Out Buttons */}
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Today's Attendance</h3>
              <p className="text-blue-100">
                {stats?.todayStatus?.checkedIn 
                  ? `Checked in at ${new Date(stats.todayStatus.checkInTime).toLocaleTimeString()}`
                  : 'Not checked in yet'
                }
              </p>
              {stats?.todayStatus?.checkOutTime && (
                <p className="text-blue-100 mt-1">
                  Checked out at {new Date(stats.todayStatus.checkOutTime).toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {!stats?.todayStatus?.checkedIn ? (
                <button onClick={handleCheckIn} className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition">
                  Check In
                </button>
              ) : !stats?.todayStatus?.checkOutTime ? (
                <button onClick={handleCheckOut} className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition">
                  Check Out
                </button>
              ) : (
                <div className="bg-white text-green-600 font-semibold py-3 px-6 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Completed
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Present Days</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.thisMonth?.present || 0}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Late Arrivals</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.thisMonth?.late || 0}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.thisMonth?.totalHours?.toFixed(1) || 0}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Attendance Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Overall Attendance This Month</h3>
            {filteredPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={filteredPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {filteredPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No attendance data for this month yet
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Monthly Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium text-gray-900">Present Days</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{stats?.thisMonth?.present || 0}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="font-medium text-gray-900">Late Arrivals</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{stats?.thisMonth?.late || 0}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="font-medium text-gray-900">Half Days</span>
                </div>
                <span className="text-2xl font-bold text-orange-600">{stats?.thisMonth?.halfDay || 0}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Total Hours</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{stats?.thisMonth?.totalHours?.toFixed(1) || 0}h</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Total Days</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">{stats?.thisMonth?.totalDays || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Recent Attendance (Last 7 Days)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.recentAttendance?.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(record.checkInTime).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.totalHours?.toFixed(1) || 0}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'present' ? 'bg-green-100 text-green-800' :
                        record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                        record.status === 'half-day' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
