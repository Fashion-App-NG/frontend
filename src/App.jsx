import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Import header component
import Header from './components/Common/Header';

// ✅ Import all page types
import ExplorePage from './pages/ExplorePage';
import FavouritesPage from './pages/FavouritesPage';
import LoginPage from './pages/LoginPage';
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

// Import legal pages
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

// Import vendor pages
import VendorDashboardPage from './pages/VendorDashboardPage';
import VendorHybridBulkUploadPage from './pages/VendorHybridBulkUploadPage';
import VendorNotificationsPage from './pages/VendorNotificationsPage';
import VendorOrdersPage from './pages/VendorOrdersPage';
import VendorProductListPage from './pages/VendorProductListPage';
import VendorProductUploadPage from './pages/VendorProductUploadPage';
import VendorSalesPage from './pages/VendorSalesPage';
import VendorSettingsPage from './pages/VendorSettingsPage';

// ✅ FIXED: Import browse and ONE adaptive ProductDetail component
import GuestBrowsePage from './pages/GuestBrowsePage';
import ProductDetailPage from './pages/ProductDetailPage';

// Import shopper layout and pages
import ShopperLayout from './components/Layout/ShopperLayout';
import VendorLayout from './components/Layout/VendorLayout';
import ShopperCart from './pages/ShopperCart';
import ShopperDashboardPage from './pages/ShopperDashboardPage';
import ShopperFavorites from './pages/ShopperFavorites';
import ShopperNotifications from './pages/ShopperNotifications';
import ShopperOrders from './pages/ShopperOrders';
import ShopperProfile from './pages/ShopperProfile';
import ShopperSettings from './pages/ShopperSettings';

// Import the shopper browse page
import ShopperBrowsePage from './pages/ShopperBrowsePage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Header />
            <Routes>
              {/* Home route */}
              <Route path="/" element={<Navigate to="/user-type-selection" replace />} />
              
              {/* Public routes */}
              <Route path="/user-type-selection" element={<UserTypeSelectionPage />} />
              <Route path="/browse" element={<GuestBrowsePage />} />
              {/* ✅ FIXED: Guest product detail route - adaptive component */}
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/products" element={<Navigate to="/browse" replace />} />
              <Route path="/explore" element={<GuestBrowsePage />} />

              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/login/shopper" element={<LoginPage />} />
              <Route path="/login/vendor" element={<VendorLoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register/shopper" element={<RegisterPage />} />
              <Route path="/register/vendor" element={<VendorRegisterPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/create" element={<CreateAdminPageWrapper />} />
              <Route path="/otp" element={<OTPPage />} />
              <Route path="/verify-otp" element={<OTPPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<PasswordResetPage />} />

              {/* Shopper routes with layout */}
              <Route path="/shopper/*" element={<ShopperLayout />}>
                <Route index element={<ShopperDashboardPage />} />
                <Route path="dashboard" element={<ShopperDashboardPage />} />
                <Route path="browse" element={<ShopperBrowsePage />} />
                {/* ✅ FIXED: Shopper product detail route - same adaptive component */}
                <Route path="product/:id" element={<ProductDetailPage />} />
                <Route path="orders" element={<ShopperOrders />} />
                <Route path="cart" element={<ShopperCart />} />
                <Route path="profile" element={<ShopperProfile />} />
                <Route path="favorites" element={<ShopperFavorites />} />
                <Route path="notifications" element={<ShopperNotifications />} />
                <Route path="settings" element={<ShopperSettings />} />
              </Route>

              {/* Legacy shopper routes */}
              <Route path="/dashboard" element={<Navigate to="/shopper" replace />} />
              <Route path="/explore-page" element={<ExplorePage />} />
              <Route path="/favourites" element={<FavouritesPage />} />
              <Route path="/orders" element={<OrdersPage />} />

              {/* Vendor routes */}
              <Route path="/vendor/*" element={<VendorLayout />}>
                <Route index element={<VendorDashboardPage />} />
                <Route path="dashboard" element={<VendorDashboardPage />} />
                <Route path="products" element={<VendorProductListPage />} />
                <Route path="upload" element={<VendorProductUploadPage />} />
                <Route path="bulk-upload" element={<VendorHybridBulkUploadPage />} />
                <Route path="orders" element={<VendorOrdersPage />} />
                <Route path="sales" element={<VendorSalesPage />} />
                <Route path="notifications" element={<VendorNotificationsPage />} />
                <Route path="settings" element={<VendorSettingsPage />} />
                {/* ✅ FIXED: Vendor product detail route - same adaptive component */}
                <Route path="product/:id" element={<ProductDetailPage />} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

              {/* Legal routes */}
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />

              {/* 404 route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;