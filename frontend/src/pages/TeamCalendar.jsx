import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import Layout from '../components/Layout';
import apiClient from '../api/apiClient';

export default function TeamCalendar() {
  const [attendance, setAttendance] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  const fetchAttendance = async () => {
    try {
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0);
      
      const response = await apiClient.get(
        `/attendance/all?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      setAttendance(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  };

  const getAttendanceForDate = (date) => {
    const dateStr = new Date(selectedYear, selectedMonth, date).toDateString();
    return attendance.filter(a => new Date(a.date).toDateString() === dateStr);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = getDaysInMonth();
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Calendar</h1>
            <p className="text-gray-600 mt-1">View team attendance in calendar format</p>
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

        {/* Legend */}
        <div className="card">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-700">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-700">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm text-gray-700">Half Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-700">Absent</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="card">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div>
              {/* Days of week */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-semibold text-gray-700 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {emptyDays.map((i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                ))}
                
                {days.map((day) => {
                  const dayAttendance = getAttendanceForDate(day);
                  const presentCount = dayAttendance.filter(a => a.status === 'present').length;
                  const lateCount = dayAttendance.filter(a => a.status === 'late').length;
                  const halfDayCount = dayAttendance.filter(a => a.status === 'half-day').length;
                  
                  return (
                    <div
                      key={day}
                      className="aspect-square border border-gray-200 rounded-lg p-2 hover:shadow-md transition-shadow"
                    >
                      <div className="font-semibold text-gray-900 mb-1">{day}</div>
                      <div className="space-y-1">
                        {presentCount > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">{presentCount}</span>
                          </div>
                        )}
                        {lateCount > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">{lateCount}</span>
                          </div>
                        )}
                        {halfDayCount > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">{halfDayCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
