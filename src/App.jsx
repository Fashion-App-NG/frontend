import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
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

// Import legal pages
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

// Import vendor product upload page
import VendorNotificationsPage from './pages/VendorNotificationsPage';
import VendorOrdersPage from './pages/VendorOrdersPage';
import VendorProductListPage from './pages/VendorProductListPage';
import VendorProductUploadPage from './pages/VendorProductUploadPage';
import VendorSalesPage from './pages/VendorSalesPage';
import VendorSettingsPage from './pages/VendorSettingsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Non-cart routes */}
            <Route path="/" element={<UserTypeSelectionPage />} />
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
            <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />

            {/* Guest browsing route */}
            <Route path="/browse" element={<ShopperDashboardPage />} />

            {/* Smart dashboard routing */}
            <Route path="/shopper/dashboard" element={<ShopperDashboardPage />} />
            <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />

            {/* Vendor routes */}
            <Route path="/vendor/orders" element={<VendorOrdersPage />} />
            <Route path="/vendor/products" element={<VendorProductListPage />} />
            <Route path="/vendor/products/add" element={<VendorProductUploadPage />} />
            <Route path="/vendor/sales" element={<VendorSalesPage />} />
            <Route path="/vendor/notifications" element={<VendorNotificationsPage />} />
            <Route path="/vendor/settings" element={<VendorSettingsPage />} />

            {/* Legal pages */}
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

            {/* Shopping routes with cart */}
            <Route path="/shopping/*" element={
              <CartProvider>
                <Routes>
                  <Route path="dashboard" element={<ShopperDashboardPage />} />
                  <Route path="explore" element={<ExplorePage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="favourites" element={<FavouritesPage />} />
                </Routes>
              </CartProvider>
            } />

            {/* Backwards compatibility redirects */}
            <Route path="/dashboard" element={<Navigate to="/shopping/dashboard" replace />} />
            <Route path="/explore" element={<Navigate to="/shopping/explore" replace />} />

            {/* 404 page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;