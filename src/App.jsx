import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Import pages
import UserTypeSelectionPage from './pages/UserTypeSelectionPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OTPPage from './pages/OTPPage';
import ExplorePage from './pages/ExplorePage';
import OrdersPage from './pages/OrdersPage';
import FavouritesPage from './pages/FavouritesPage';
import NotFoundPage from './pages/NotFoundPage';

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
              <Route path="/register/shopper" element={<RegisterPage />} />
              <Route path="/verify-otp" element={<OTPPage />} />
              
              {/* Dashboard and main app routes */}
              <Route path="/dashboard" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              
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