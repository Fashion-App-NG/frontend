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
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* User type selection as new homepage */}
              <Route path="/" element={<UserTypeSelectionPage />} />
              
              {/* Shopper registration flow */}
              <Route path="/register/shopper" element={<RegisterPage />} />
              <Route path="/verify-otp" element={<OTPPage />} />
              
              {/* Authentication */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Authenticated homepage (after login) */}
              <Route path="/dashboard" element={<HomePage />} />
              
              {/* Legacy routes for backward compatibility */}
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/home" element={<HomePage />} />
              
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