import { useCallback, useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import checkoutService from '../services/checkoutService';

export const useCheckoutSession = () => {
  const { cartItems, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // ✅ IMPROVED: Better error handling and logging
  const initializeSession = useCallback(async () => {
    try {
      console.log('🔍 CHECKOUT HOOK DEBUG - Initialize Session Called', {
        cartItemsLength: cartItems.length,
        cartItems: cartItems
      });
      
      setLoading(true);
      setError(null); // Clear previous errors
      
      // Check for existing session
      const savedSession = localStorage.getItem('checkoutSession');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          
          // Check if session is still valid (not expired)
          if (new Date(parsed.expiresAt) > new Date()) {
            console.log('✅ Using existing valid session:', parsed);
            setSessionData(parsed);
            return parsed;
          } else {
            console.log('🔄 Removing expired session');
            localStorage.removeItem('checkoutSession');
          }
        } catch (parseError) {
          console.error('❌ Error parsing saved session:', parseError);
          localStorage.removeItem('checkoutSession');
        }
      }

      // Create new session with current cart items
      console.log('🔄 Creating new checkout session...');
      const newSession = await checkoutService.createSession(cartItems);
      
      console.log('✅ New session created:', newSession);
      setSessionData(newSession);
      return newSession;
      
    } catch (error) {
      console.error('❌ CHECKOUT HOOK DEBUG - Initialize Session Error:', error);
      setError(`Checkout initialization failed: ${error.message}`);
      
      // ✅ FIX: Don't throw error, allow UI to show error state
      return null;
    } finally {
      setLoading(false);
    }
  }, [cartItems]);

  // Session countdown timer with error handling
  useEffect(() => {
    if (!sessionData?.expiresAt) return;

    const timer = setInterval(() => {
      try {
        const remaining = new Date(sessionData.expiresAt) - new Date();
        if (remaining <= 0) {
          console.log('⏰ Session expired, clearing...');
          setTimeRemaining(0);
          
          // Auto-cancel expired session
          if (sessionData.sessionId && !sessionData.sessionId.includes('mock')) {
            checkoutService.cancelSession(sessionData.sessionId).catch(err => {
              console.warn('⚠️ Error canceling expired session:', err);
            });
          }
          setSessionData(null);
        } else {
          setTimeRemaining(remaining);
        }
      } catch (error) {
        console.error('❌ Timer error:', error);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionData]);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const goToStep = (step) => setCurrentStep(step);

  return {
    currentStep,
    sessionData,
    loading,
    error,
    timeRemaining,
    initializeSession,
    nextStep,
    prevStep,
    goToStep,
    setError
  };
};