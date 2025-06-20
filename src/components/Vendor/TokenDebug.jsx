import { useAuth } from '../../contexts/AuthContext';

const TokenDebug = () => {
  const { user } = useAuth();

  const checkTokens = () => {
    const vendorToken = localStorage.getItem('vendorToken');
    const authToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔍 Token Debug Info:', {
      vendorToken: vendorToken ? `${vendorToken.substring(0, 30)}...` : 'None',
      authToken: authToken ? `${authToken.substring(0, 30)}...` : 'None',
      storedUser: storedUser ? JSON.parse(storedUser) : 'None',
      currentUser: user
    });
    
    return {
      vendorToken: !!vendorToken,
      authToken: !!authToken,
      storedUser: !!storedUser,
      currentUser: !!user
    };
  };

  const tokens = checkTokens();

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-400 rounded-lg p-3 text-xs max-w-xs z-30">
      <h4 className="font-bold text-yellow-800 mb-2">🔐 Token Debug</h4>
      <div className="space-y-1 text-yellow-700">
        <div>Vendor Token: {tokens.vendorToken ? '✅' : '❌'}</div>
        <div>Auth Token: {tokens.authToken ? '✅' : '❌'}</div>
        <div>Stored User: {tokens.storedUser ? '✅' : '❌'}</div>
        <div>Current User: {tokens.currentUser ? '✅' : '❌'}</div>
        <div>User Role: {user?.role || 'None'}</div>
        <div>User ID: {user?.id || 'None'}</div>
      </div>
      <button
        onClick={checkTokens}
        className="mt-2 px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs"
      >
        Refresh
      </button>
    </div>
  );
};

export default TokenDebug;