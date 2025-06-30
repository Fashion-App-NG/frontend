import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Don't show header on auth pages or dashboard pages
  const hideHeader = location.pathname.startsWith('/login') || 
                    location.pathname.startsWith('/register') ||
                    location.pathname.startsWith('/vendor') ||
                    location.pathname.startsWith('/shopper') ||
                    location.pathname.startsWith('/admin');

  if (hideHeader) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">FC</span>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">FASHION CULTURE</h1>
            </div>
          </Link>

          {/* Main Navigation */}
          <nav className="flex items-center space-x-6">
            <Link 
              to="/browse" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Explore Products
            </Link>
            
            {!user ? (
              <>
                <Link 
                  to="/login/shopper" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Shop
                </Link>
                <Link 
                  to="/login/vendor" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Sell
                </Link>
                <Link 
                  to="/register/shopper" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to={user.role === 'vendor' ? '/vendor' : '/shopper'} 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;