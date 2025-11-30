import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import MarkAttendance from './pages/MarkAttendance';
import AttendanceHistory from './pages/AttendanceHistory';
import Profile from './pages/Profile';
import AllEmployeesAttendance from './pages/AllEmployeesAttendance';
import TeamCalendar from './pages/TeamCalendar';
import Reports from './pages/Reports';

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'employee' ? '/dashboard' : '/manager/dashboard'} />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Employee Routes */}
        <Route path="/dashboard" element={<PrivateRoute role="employee"><EmployeeDashboard /></PrivateRoute>} />
        <Route path="/mark-attendance" element={<PrivateRoute role="employee"><MarkAttendance /></PrivateRoute>} />
        <Route path="/my-attendance" element={<PrivateRoute role="employee"><AttendanceHistory /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        
        {/* Manager Routes */}
        <Route path="/manager/dashboard" element={<PrivateRoute role="manager"><ManagerDashboard /></PrivateRoute>} />
        <Route path="/manager/employees" element={<PrivateRoute role="manager"><AllEmployeesAttendance /></PrivateRoute>} />
        <Route path="/manager/calendar" element={<PrivateRoute role="manager"><TeamCalendar /></PrivateRoute>} />
        <Route path="/manager/reports" element={<PrivateRoute role="manager"><Reports /></PrivateRoute>} />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
