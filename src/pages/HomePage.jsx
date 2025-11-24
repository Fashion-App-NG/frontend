import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ FIX: Wait for loading to complete
    if (loading) return;

    // ✅ FIX: Check if user exists before accessing properties
    if (!user) return;

    if (isAuthenticated && user) {
      // Redirect based on role
      if (user.role === 'vendor') {
        navigate('/vendor/dashboard', { replace: true });
      } else if (user.role === 'shopper') {
        navigate('/shopper/browse', { replace: true });
      } else if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, loading, navigate]);

  // ✅ FIX: Show loading spinner while auth initializes
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ FIX: Redirect unauthenticated users to browse immediately
  if (!isAuthenticated) {
    return <Navigate to="/browse" replace />;
  }

  // ✅ Redirect in progress for authenticated users
  return null;
};

export default HomePage;