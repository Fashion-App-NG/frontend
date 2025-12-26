import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for requiring authentication and role-based access
 * @param {Object} options - Configuration options
 * @param {string} options.requiredRole - Required user role ('vendor', 'shopper', 'admin')
 * @param {string} options.redirectTo - Where to redirect if unauthorized
 * @returns {Object} - { user, loading, isAuthorized }
 */
export const useRequireAuth = (options = {}) => {
  const { 
    requiredRole = null, 
    redirectTo = '/login',
    allowRoles = [] // Alternative: array of allowed roles
  } = options;
  
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't check until auth finishes loading
    if (loading) return;

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      navigate(redirectTo, { replace: true });
      return;
    }

    // Check required role
    if (requiredRole && user.role !== requiredRole) {
      // Role-specific redirects
      const roleRedirects = {
        vendor: '/vendor/dashboard',
        shopper: '/shopper/dashboard',
        admin: '/admin/dashboard',
        superadmin: '/admin/dashboard'
      };
      
      const destination = roleRedirects[user.role] || '/';
      navigate(destination, { replace: true });
      return;
    }

    // Check allowed roles (if using array)
    if (allowRoles.length > 0 && !allowRoles.includes(user.role)) {
      const roleRedirects = {
        vendor: '/vendor/dashboard',
        shopper: '/shopper/dashboard',
        admin: '/admin/dashboard',
        superadmin: '/admin/dashboard'
      };
      
      const destination = roleRedirects[user.role] || '/';
      navigate(destination, { replace: true });
    }
  }, [user, isAuthenticated, loading, requiredRole, allowRoles, redirectTo, navigate]);

  return {
    user,
    loading,
    isAuthenticated,
    isAuthorized: !loading && isAuthenticated && user && (
      !requiredRole || user.role === requiredRole ||
      (allowRoles.length > 0 && allowRoles.includes(user.role))
    )
  };
};