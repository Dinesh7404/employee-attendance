import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import Layout from '../components/Layout';
import apiClient from '../api/apiClient';

export default function AttendanceHistory() {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      const [historyRes, summaryRes] = await Promise.all([
        apiClient.get(`/attendance/my-history?startDate=${new Date(selectedYear, selectedMonth, 1).toISOString()}&endDate=${new Date(selectedYear, selectedMonth + 1, 0).toISOString()}`),
        apiClient.get(`/attendance/my-summary?month=${selectedMonth}&year=${selectedYear}`)
      ]);
      
      setAttendance(historyRes.data.data);
      setSummary(summaryRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Attendance History</h1>
            <p className="text-gray-600 mt-1">View your attendance records</p>
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="input-field"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input-field"
            >
              {[2024, 2023, 2022].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card bg-green-50">
              <p className="text-sm text-green-600 font-medium">Present Days</p>
              <p className="text-3xl font-bold text-green-700">{summary.present}</p>
            </div>
            <div className="card bg-yellow-50">
              <p className="text-sm text-yellow-600 font-medium">Late Days</p>
              <p className="text-3xl font-bold text-yellow-700">{summary.late}</p>
            </div>
            <div className="card bg-orange-50">
              <p className="text-sm text-orange-600 font-medium">Half Days</p>
              <p className="text-3xl font-bold text-orange-700">{summary.halfDay}</p>
            </div>
            <div className="card bg-blue-50">
              <p className="text-sm text-blue-600 font-medium">Total Hours</p>
              <p className="text-3xl font-bold text-blue-700">{summary.totalHours.toFixed(1)}h</p>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Attendance Records</h3>
          </div>
          
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
                {attendance.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
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
            
            {attendance.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No attendance records found for this period
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
