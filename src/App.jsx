import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Import pages
import UserTypeSelectionPage from './pages/UserTypeSelectionPage';
import DashboardRouter from './components/Common/DashboardRouter';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VendorRegisterPage from './pages/VendorRegisterPage';
import VendorLoginPage from './pages/VendorLoginPage';
import OTPPage from './pages/OTPPage';
import ExplorePage from './pages/ExplorePage';
import OrdersPage from './pages/OrdersPage';
import FavouritesPage from './pages/FavouritesPage';
import NotFoundPage from './pages/NotFoundPage';

// ✅ Import forgot password pages (following your existing pattern)
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PasswordResetPage from './pages/PasswordResetPage';

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
              
              {/* ✅ Password reset routes */}
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<PasswordResetPage />} />
              
              {/* Smart dashboard routing */}
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/home" element={<DashboardRouter />} />
              
              {/* Sidebar navigation routes */}
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/favourites" element={<FavouritesPage />} />
              
              {/* Legacy/fallback routes */}
              <Route path="/register" element={<RegisterPage />} />
              
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