import { useState, useEffect } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import apiClient from '../api/apiClient';

export default function MarkAttendance() {
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchTodayStatus();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await apiClient.get('/attendance/today');
      setTodayStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching today status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await apiClient.post('/attendance/checkin');
      alert('Checked in successfully!');
      fetchTodayStatus();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await apiClient.post('/attendance/checkout');
      alert('Checked out successfully!');
      fetchTodayStatus();
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

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-600 mt-1">Record your daily check-in and check-out</p>
        </div>

        {/* Current Time */}
        <div className="card text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-6 h-6" />
            <h2 className="text-2xl font-semibold">Current Time</h2>
          </div>
          <p className="text-5xl font-bold">{currentTime.toLocaleTimeString()}</p>
          <p className="text-xl mt-2">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Attendance Status */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Today's Status</h3>
          
          {!todayStatus ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">You haven't checked in yet today</p>
              <button onClick={handleCheckIn} className="btn-success px-8 py-3 text-lg">
                Check In Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Check In Time</p>
                    <p className="text-gray-600">{new Date(todayStatus.checkInTime).toLocaleTimeString()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  todayStatus.status === 'present' ? 'bg-green-100 text-green-800' :
                  todayStatus.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {todayStatus.status}
                </span>
              </div>

              {todayStatus.checkOutTime ? (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Check Out Time</p>
                      <p className="text-gray-600">{new Date(todayStatus.checkOutTime).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Hours</p>
                    <p className="text-xl font-bold text-gray-900">{todayStatus.totalHours}h</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">Remember to check out when you leave</p>
                  <button onClick={handleCheckOut} className="btn-primary px-8 py-3 text-lg">
                    Check Out Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Information */}
        <div className="card bg-blue-50">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📌 Important Notes</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Standard work hours: 9:00 AM - 6:00 PM</li>
            <li>• Grace period: 15 minutes (until 9:15 AM)</li>
            <li>• Late if checked in after 9:15 AM</li>
            <li>• Half-day if total hours less than 4 hours</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
