import VendorProductUploadContent from '../components/Vendor/VendorProductUploadContent';
import { useRequireAuth } from '../hooks/useRequireAuth';

export const VendorProductUploadPage = () => {
  // ✅ One line replaces all auth/redirect logic!
  const { loading, isAuthorized } = useRequireAuth({
    requiredRole: 'vendor',
    redirectTo: '/login/vendor'
  });

  // ✅ Show loading while auth checks
  if (loading || !isAuthorized) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ At this point, user is guaranteed to be authenticated and authorized
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <VendorProductUploadContent />
    </div>
  );
};

export default VendorProductUploadPage;