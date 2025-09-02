import { useCallback, useEffect, useRef, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import checkoutService from '../services/checkoutService';

export const useCheckoutSession = () => {
  const { clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [cart, setCart] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Add state for payment errors
  const [paymentError, setPaymentError] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Clear payment errors when changing steps
  useEffect(() => {
    setPaymentError(null);
  }, [currentStep]);

  // Add a function to clear payment errors
  const clearPaymentError = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Clearing payment error state in useCheckoutSession');
    }
    setPaymentError(null);
  }, []);

  // Step 1: Review Cart
  const reviewCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkoutService.reviewCart();
      setCart(data.cart);
      setCurrentStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Step 2: Save Shipping
  const saveShipping = useCallback(async (shippingAddress, customerInfo) => {
    setLoading(true);
    setError(null);
    try {
      // Call backend and get full response
      const response = await checkoutService.saveShippingInfo(shippingAddress, customerInfo);
      setShippingInfo(response); // <-- Use full response, not just address/info
      if (process.env.NODE_ENV === 'development') {
        console.log('[DEBUG] setShippingInfo called with:', response);
      }
      setCurrentStep(3); // Move to payment step
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Step 3: Confirm Order
  const confirmOrder = useCallback(async (paymentDetails, reservationDuration = 30) => {
    setLoading(true);
    setError(null);
    setIsProcessingPayment(true);
    
    // Clear any previous payment errors
    setPaymentError(null);
    
    if(process.env.NODE_ENV === 'development') {
      console.log('🔄 CHECKOUT SESSION CONFIRM ORDER PAYLOAD:', {
        paymentDetails,
        shippingInfo,
        reservationDuration,
        timestamp: new Date().toISOString()
      });
    }

    try {
      // Make sure payment reference is always included and properly formatted
      if (!paymentDetails || !paymentDetails.reference) {
        console.error('❌ Missing payment reference:', paymentDetails);
        const refError = 'Payment reference is required';
        setPaymentError(refError);
        throw new Error(refError);
      }

      const data = await checkoutService.confirmOrder({
        shippingAddress: shippingInfo.shippingAddress,
        customerInfo: shippingInfo.customerInfo,
        paymentDetails,
        reservationDuration
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('📋 CHECKOUT SESSION ORDER RESPONSE:', data);
        
        if (data.payment && data.payment.error) {
          console.error('❌ PAYMENT ERROR DETECTED:', {
            error: data.payment.error,
            paymentStatus: data.order?.paymentStatus,
            paymentReference: paymentDetails.reference
          });
        }
        
        if (data.statusCode) {
          console.log(`📊 RESPONSE STATUS CODE: ${data.statusCode}`);
        }
      }

      // Store the order data
      setOrder(data.order);
      
      // Check for payment errors even if the order was created
      if (data.payment && data.payment.error) {
        setPaymentError(data.payment.error);
      } else if (data.message && data.message.includes('failed')) {
        setPaymentError(data.message);
      }
      
      // Only navigate if payment is successful
      if (data.success && data.order?.paymentStatus === 'PAID') {
        setCurrentStep(4); // Move to confirmation step
      }
      
      return data;

    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ CHECKOUT SESSION CONFIRM ORDER ERROR:', err);
      }
      
      // Set both general error and payment error for display
      setError(err.message);
      setPaymentError(err.message);
      throw err;
    } finally {
      setLoading(false);
      setIsProcessingPayment(false);
    }
  }, [shippingInfo]);

  // Return the additional state and functions
  return {
    currentStep,
    cart,
    shippingInfo,
    order,
    loading,
    error,
    paymentError,
    isProcessingPayment,
    reviewCart,
    saveShipping,
    confirmOrder,
    setCurrentStep,
    clearCart,
    clearPaymentError
  };
};
