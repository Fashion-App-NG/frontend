import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// ✅ LEARNING: Verify all page imports exist
import ExplorePage from './pages/ExplorePage';
import FavouritesPage from './pages/FavouritesPage';
import LoginPage from './pages/LoginPage'; // ✅ This will now work
import NotFoundPage from './pages/NotFoundPage';
import OrdersPage from './pages/OrdersPage';
import OTPPage from './pages/OTPPage';
import RegisterPage from './pages/RegisterPage';
import UserTypeSelectionPage from './pages/UserTypeSelectionPage';
import VendorLoginPage from './pages/VendorLoginPage';
import VendorRegisterPage from './pages/VendorRegisterPage';

// Import forgot password pages
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PasswordResetPage from './pages/PasswordResetPage';

// Import admin pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import CreateAdminPageWrapper from './pages/CreateAdminPage';
import ShopperDashboardPage from './pages/ShopperDashboardPage';
import VendorDashboardPage from './pages/VendorDashboardPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* User type selection as homepage */}
              <Route path="/" element={<UserTypeSelectionPage />} />
              
              {/* Authentication routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/login/vendor" element={<VendorLoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register/shopper" element={<RegisterPage />} />
              <Route path="/register/vendor" element={<VendorRegisterPage />} />
              <Route path="/verify-otp" element={<OTPPage />} />
              
              {/* Password reset routes */}
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<PasswordResetPage />} />
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/create-admin" element={<CreateAdminPageWrapper />} />
              
              {/* Guest browsing route */}
              <Route path="/browse" element={<ShopperDashboardPage />} />
              
              {/* Smart dashboard routing */}
              <Route path="/dashboard" element={<ShopperDashboardPage />} />
              <Route path="/shopper/dashboard" element={<ShopperDashboardPage />} />
              <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
              
              {/* Sidebar navigation routes */}
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/favourites" element={<FavouritesPage />} />
              
              {/* 404 page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;