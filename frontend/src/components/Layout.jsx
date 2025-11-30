import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Clock, Calendar, FileText, User, LogOut, Users, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Layout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const employeeLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/mark-attendance', icon: Clock, label: 'Mark Attendance' },
    { to: '/my-attendance', icon: Calendar, label: 'My Attendance' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const managerLinks = [
    { to: '/manager/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/manager/employees', icon: Users, label: 'All Employees' },
    { to: '/manager/calendar', icon: Calendar, label: 'Team Calendar' },
    { to: '/manager/reports', icon: BarChart3, label: 'Reports' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const links = user?.role === 'employee' ? employeeLinks : managerLinks;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-200">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-primary">ShiftLog</h1>
            <p className="text-sm text-gray-600 mt-1">{user?.role === 'employee' ? 'Employee' : 'Manager'} Portal</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {links.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === to
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-sm text-gray-500 truncate">{user?.employeeId}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
