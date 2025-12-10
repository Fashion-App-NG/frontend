import { Link, useLocation } from 'react-router-dom';

const GuestSidebar = ({ isOpen = false, onClose = () => {} }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Browse Products', href: '/browse', icon: 'grid' },
    { name: 'Login', href: '/login/shopper', icon: 'user' },
    { name: 'Register', href: '/register/shopper', icon: 'plus' }
  ];

  const iconComponents = {
    grid: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    user: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    plus: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    )
  };

  return (
    <>
      {/* ✅ Desktop: Always visible */}
      {/* ✅ Mobile/Tablet: Slide-in drawer */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg lg:shadow-sm border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* ✅ Header with Close Button (Mobile Only) */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-3 flex-1 min-w-0" onClick={onClose}>
            <img 
              src="/assets/logos/faari-icon-lg.png" 
              alt="Fáàrí" 
              className="h-12 w-12 lg:h-16 lg:w-16 object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">Fáàrí</h1>
              <p className="text-xs lg:text-sm text-gray-500 truncate">Fashion Marketplace</p>
            </div>
          </Link>

          {/* ✅ Close Button (Mobile/Tablet Only) */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0 ml-2"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ✅ Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className={`${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                    {iconComponents[item.icon]}
                  </span>
                  <span className="ml-3">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* ✅ Additional Links */}
          <div className="mt-6 space-y-2">
            <Link
              to="/browse"
              onClick={onClose}
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                location.pathname === '/browse'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="font-medium">Browse Fabrics</span>
            </Link>

            {/* ✅ Get Started Link */}
            <Link
              to="/get-started"
              onClick={onClose}
              className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 transition-all shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <div>
                <span className="font-semibold block text-sm">Get Started</span>
                <span className="text-xs text-teal-100">Sign up or sell with us</span>
              </div>
            </Link>

            <Link
              to="/guest/cart"
              onClick={onClose}
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                location.pathname === '/guest/cart'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 5.293A1 1 0 005.414 20H17a1 1 0 00.707-.293L21 13H7z" />
              </svg>
              <span className="font-medium">Your Cart</span>
            </Link>
          </div>
        </nav>

        {/* ✅ Call to Action (Bottom) */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Join Fáàrí today
            </p>
            <Link
              to="/register/shopper"
              onClick={onClose}
              className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium block text-center"
            >
              Create Account
            </Link>
            <Link
              to="/login/vendor"
              onClick={onClose}
              className="w-full text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium block text-center"
            >
              I'm a Vendor
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default GuestSidebar;