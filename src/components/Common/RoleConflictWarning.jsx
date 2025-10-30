import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RoleConflictWarning = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!user) return;

    const currentPath = location.pathname;
    const isVendorRoute = currentPath.startsWith('/vendor');
    const isAdminRoute = currentPath.startsWith('/admin');
    const isShopperRoute = currentPath.startsWith('/shopper');

    const roleMismatch = 
      (isVendorRoute && user.role !== 'vendor') ||
      (isAdminRoute && !['admin', 'superadmin'].includes(user.role)) ||
      (isShopperRoute && user.role !== 'shopper');

    setShowWarning(roleMismatch);
  }, [user, location.pathname]);

  if (!showWarning) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-4 z-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="font-semibold">Role Mismatch Detected</p>
          <p className="text-sm">You're logged in as {user?.role} but viewing a different role's page.</p>
        </div>
      </div>
      <button
        onClick={logout}
        className="bg-white text-red-600 px-4 py-2 rounded hover:bg-red-50 font-medium"
      >
        Switch Account
      </button>
    </div>
  );
};

export default RoleConflictWarning;