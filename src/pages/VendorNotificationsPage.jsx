import { useRequireAuth } from '../hooks/useRequireAuth';

export const VendorNotificationsPage = () => {
  // ✅ One line replaces all auth logic!
  const { loading, isAuthorized } = useRequireAuth({
    requiredRole: 'vendor',
    redirectTo: '/login/vendor'
  });

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#d8dfe9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#d8dfe9] flex">
      <div className="flex-1 ml-[254px] p-6">
        <div className="bg-white rounded-[10px] p-8 text-center">
          <div className="text-6xl mb-4">🔔</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Notifications</h2>
          <p className="text-gray-500">Coming Soon - Manage your notifications here</p>
        </div>
      </div>
    </div>
  );
};

export default VendorNotificationsPage;