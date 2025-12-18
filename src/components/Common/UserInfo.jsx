import { useAuth } from '../../contexts/AuthContext';

const UserInfo = ({ showEmail = false, size = 'md' }) => {
  const { user } = useAuth();

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const getDisplayName = () => {
    if (user?.role === 'vendor') {
      return user?.storeName || `${user?.firstName} ${user?.lastName}` || 'Vendor';
    }
    return `${user?.firstName} ${user?.lastName}` || user?.email || 'User';
  };

  const getInitials = () => {
    if (user?.role === 'vendor' && user?.storeName) {
      return user.storeName.charAt(0).toUpperCase();
    }
    return user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`bg-blue-600 rounded-full flex items-center justify-center ${sizeClasses[size]}`}>
        <span className="text-white font-medium">
          {getInitials()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {getDisplayName()}
        </p>
        {showEmail && (
          <p className="text-xs text-gray-500 truncate">
            {user?.email}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserInfo;