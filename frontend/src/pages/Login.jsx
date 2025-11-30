import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, UserCog } from 'lucide-react';
import apiClient from '../api/apiClient';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { data, token } = response.data;
      
      // Check if role matches selected login type
      if (selectedRole !== data.role) {
        setError(`This account is registered as ${data.role}. Please use ${data.role === 'manager' ? 'Manager' : 'Employee'} Login.`);
        setLoading(false);
        return;
      }
      
      setAuth(data, token);
      
      if (data.role === 'employee') {
        navigate('/dashboard');
      } else {
        navigate('/manager/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // If no role selected, show role selection
  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-5xl w-full mx-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">ShiftLog</h1>
            <p className="text-xl text-gray-600">Employee Attendance Management System</p>
          </div>

          {/* Login Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Manager Login */}
            <div 
              onClick={() => setSelectedRole('manager')}
              className="card hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-primary group"
            >
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 group-hover:scale-110 transition-transform">
                  <UserCog className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Manager Login</h2>
                <p className="text-gray-600 mb-6">Access team management and reports</p>
                <div className="inline-flex items-center text-primary font-semibold group-hover:gap-3 transition-all">
                  Click to Login
                  <span className="ml-2 group-hover:ml-3 transition-all">→</span>
                </div>
              </div>
            </div>

            {/* Employee Login */}
            <div 
              onClick={() => setSelectedRole('employee')}
              className="card hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-success group"
            >
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-teal-600 rounded-full mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Employee Login</h2>
                <p className="text-gray-600 mb-6">Mark attendance and view records</p>
                <div className="inline-flex items-center text-success font-semibold group-hover:gap-3 transition-all">
                  Click to Login
                  <span className="ml-2 group-hover:ml-3 transition-all">→</span>
                </div>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Login form for selected role
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md w-full mx-4">
        {/* Back button */}
        <button
          onClick={() => {
            setSelectedRole(null);
            setError('');
            setEmail('');
            setPassword('');
          }}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← Back to selection
        </button>

        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            selectedRole === 'manager' 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
              : 'bg-gradient-to-br from-green-500 to-teal-600'
          }`}>
            {selectedRole === 'manager' ? (
              <UserCog className="w-8 h-8 text-white" />
            ) : (
              <Users className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {selectedRole === 'manager' ? 'Manager' : 'Employee'} Login
          </h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 disabled:opacity-50 text-white font-semibold rounded-lg transition ${
                selectedRole === 'manager'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>

        
      </div>
    </div>
  );
}
