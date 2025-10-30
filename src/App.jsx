import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthProvider from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import FavoritesProvider from './contexts/FavoritesContext';
import { TaxProvider } from './contexts/TaxContext';

// Import header component
import Header from './components/Common/Header';
import RoleConflictWarning from './components/Common/RoleConflictWarning';

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
import AdminCreateFeePage from './pages/AdminCreateFeePage';
import AdminCreateMaterialPage from './pages/AdminCreateMaterialPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminEarningsPage from './pages/AdminEarningsPage.jsx';
import AdminFeesPage from './pages/AdminFeesPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminMaterialPage from './pages/AdminMaterialPage';
import AdminOrderBreakdownPage from './pages/AdminOrderBreakdownPage.jsx';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminTaxPage from './pages/AdminTaxPage.jsx';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import AdminVendorManagementPage from './pages/AdminVendorManagementPage';
import CreateAdminPageWrapper from './pages/CreateAdminPage';

// Import legal pages
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

// Import vendor pages
import VendorDashboardPage from './pages/VendorDashboardPage';
import VendorHybridBulkUploadPage from './pages/VendorHybridBulkUploadPage';
import VendorNotificationsPage from './pages/VendorNotificationsPage';
import VendorOrderDetailsPage from './pages/VendorOrderDetailsPage';
import VendorOrdersPage from './pages/VendorOrdersPage';
import VendorProductDetailPage from './pages/VendorProductDetailPage';
import VendorProductEditPage from './pages/VendorProductEditPage';
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
import ShopperNotifications from './pages/ShopperNotifications';
import ShopperOrders from './pages/ShopperOrders';
import ShopperProfile from './pages/ShopperProfile';
import ShopperSettings from './pages/ShopperSettings';

// Import the shopper browse page
import ShopperProductListPage from './pages/ShopperProductListPage';

// ✅ ADD: Import checkout page
import CheckoutPage from './pages/checkout/CheckoutPage';
import CheckoutSuccessPage from './pages/checkout/CheckoutSuccessPage';
import GuestCheckoutPage from './pages/checkout/GuestCheckoutPage';

// Import order details page
import GuestCartPage from './pages/GuestCartPage';
import ShopperOrderDetails from './pages/ShopperOrderDetails';

// Import the new page
import VendorProfilePage from './pages/VendorProfilePage';

// Import order tracking component
import ShopperOrderTracking from './pages/ShopperOrderTracking';

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <TaxProvider>
          <Router>
            <RoleConflictWarning /> {/* ✅ Move it here, inside Router */}
            <div className="App">
              <Header />
              <Routes>
                {/* Home and public routes */}
                <Route path="/" element={<Navigate to="/user-type-selection" replace />} />
                <Route path="/user-type-selection" element={<UserTypeSelectionPage />} />
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

                <Route path="/checkout/success" element={<CheckoutSuccessPage />} />

                {/*Browse route with CartProvider */}
                <Route
                  path="/browse"
                  element={
                    <CartProvider key="browse-provider">
                      <GuestBrowsePage />
                    </CartProvider>
                  }
                />

                {/* Guest routes with CartProvider */}
                <Route
                  path="/guest/*"
                  element={
                    <CartProvider key="guest-provider">
                      <Routes>
                        <Route path="browse" element={<GuestBrowsePage />} />
                        <Route path="cart" element={<GuestCartPage />} />
                        <Route path="checkout" element={<GuestCheckoutPage />} />  {/* ✅ Add checkout route */}
                      </Routes>
                    </CartProvider>
                  }
                />

                {/* Shopper routes with CartProvider */}
                <Route
                  path="/shopper/*"
                  element={
                    <CartProvider key="shopper-provider">
                      <ShopperLayout />
                    </CartProvider>
                  }
                >
                  <Route index element={<ShopperProductListPage />} />
                  <Route path="browse" element={<ShopperProductListPage />} />
                  <Route path="dashboard" element={<ShopperDashboardPage />} />
                  <Route path="product/:productId" element={<ProductDetailPage />} />
                  <Route path="orders" element={<ShopperOrders />} />
                  <Route path="orders/:orderId" element={<ShopperOrderDetails />} />
                  
                  {/* ✅ FIX: Tracking routes directly under /shopper/orders */}
                  <Route path="orders/:orderId/tracking" element={<ShopperOrderTracking />} />
                  <Route path="orders/:orderId/tracking/:vendorId" element={<ShopperOrderTracking />} />
                  
                  <Route path="cart" element={<ShopperCart />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="profile" element={<ShopperProfile />} />
                  <Route path="favorites" element={<FavouritesPage />} />
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
                  <Route path="products/:id" element={<VendorProductDetailPage />} />
                  <Route path="products/:id/edit" element={<VendorProductEditPage />} />
                  <Route path="upload" element={<VendorProductUploadPage />} />
                  <Route path="bulk-upload" element={<VendorHybridBulkUploadPage />} />
                  <Route path="orders" element={<VendorOrdersPage />} />
                  <Route path="orders/:orderId" element={<VendorOrderDetailsPage />} />
                  <Route path="sales" element={<VendorSalesPage />} />
                  <Route path="notifications" element={<VendorNotificationsPage />} />
                  <Route path="settings" element={<VendorSettingsPage />} />
                  <Route path="profile" element={<VendorProfilePage />} /> {/* New profile route */}
                </Route>

              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/admin-orders" element={<AdminOrdersPage />} />
              <Route path="/admin/admin-materials" element={<AdminMaterialPage />} />
              <Route path="/admin/create-material" element={<AdminCreateMaterialPage />} />
              <Route path="/admin/create-fee" element={<AdminCreateFeePage />} />
              <Route path="/admin/fees-management" element={<AdminFeesPage />} />
              <Route path="/admin/order-breakdown" element={<AdminOrderBreakdownPage />} />
              <Route path="/admin/earnings" element={<AdminEarningsPage />} />
              <Route path="/admin/tax" element={<AdminTaxPage />} />
              <Route path="/admin/user-management" element={<AdminUserManagementPage />} />
              <Route path="/admin/vendor-management" element={<AdminVendorManagementPage />} />

                {/* Legal routes */}
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />


                {/* 404 route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              <ToastContainer position="top-right" autoClose={5000} />
            </div>
          </Router>
        </TaxProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;