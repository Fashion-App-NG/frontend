import { useAuth } from '../../contexts/AuthContext';
import GuestSidebar from '../Common/GuestSidebar';
import ShopperSidebar from '../Common/ShopperSidebar';

const UniversalLayout = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  // ✅ LEARNING: Dynamic layout based on auth state
  const renderSidebar = () => {
    if (!isAuthenticated || !user) {
      return <GuestSidebar />;
    }
    
    if (user.role === 'shopper') {
      return <ShopperSidebar />;
    }
    
    // For other roles, show guest sidebar as fallback
    return <GuestSidebar />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {renderSidebar()}
      <div className="flex-1">
        <main className="p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UniversalLayout;