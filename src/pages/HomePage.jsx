import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // ✅ Redirect based on role
      if (user.role === 'vendor') {
        navigate('/vendor/dashboard', { replace: true });
      } else if (user.role === 'shopper') {
        navigate('/shopper/browse', { replace: true });
      } else if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
    // If not authenticated, stay on home (will show guest browse)
  }, [isAuthenticated, user, navigate]);

  // ✅ Guest users see the browse page
  return null; // App.jsx handles redirect to /browse
};

export default HomePage;