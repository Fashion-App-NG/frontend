import { useCallback, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import guestCheckoutService from '../services/guestCheckoutService';

export const useGuestCheckoutSession = () => {
  const { clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [cart, setCart] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Review Cart (same as shopper)
  const reviewCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await guestCheckoutService.reviewCart();
      setCart(data.cart);
      setCurrentStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Step 2: Save Shipping (guest needs to collect info)
  const saveShipping = useCallback(async (shippingAddress, customerInfo) => {
    setLoading(true);
    setError(null);
    try {
      // Basic validation for required fields
      if (!shippingAddress) {
        throw new Error('Shipping address is required.');
      }
      if (!customerInfo) {
        throw new Error('Customer information is required.');
      }
      setShippingInfo({ shippingAddress, customerInfo });
      setCurrentStep(3); // Move to payment step
    } catch (err) {
      if (
        err.message === 'Shipping address is required.' ||
        err.message === 'Customer information is required.'
      ) {
        setError(`Validation error: ${err.message}`);
      } else {
        setError(`Unexpected error in saveShipping: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Step 3: Confirm Order (with guest token)
  const confirmOrder = useCallback(async (paymentDetails, reservationDuration = 30) => {
    setLoading(true);
    setError(null);
    
    console.log('🔄 GUEST CHECKOUT SESSION CONFIRM ORDER:', {
      paymentDetails,
      shippingInfo,
      cart
    });
    
    try {
      const orderData = {
        cartId: cart.id,
        shippingAddress: shippingInfo.shippingAddress,
        customerInfo: shippingInfo.customerInfo,
        paymentDetails,
        reservationDuration,
        guestCheckout: true
      };
      
      const data = await guestCheckoutService.confirmOrder(orderData);
      setOrder(data.order);
      setCurrentStep(4); // Move to confirmation
      
      // ✅ FIX: Return the response so PaymentMethodStep can access it
      console.log('✅ GUEST HOOK: Returning response to PaymentMethodStep:', data);
      return data;
      
    } catch (err) {
      console.error('❌ GUEST HOOK ERROR:', err);
      setError(err.message);
      throw err; // Re-throw so PaymentMethodStep can catch it
    } finally {
      setLoading(false);
    }
  }, [cart, shippingInfo]);

  const loadCart = useCallback(async () => {
    // Guest cart loading handled by CartContext
    console.log('🔄 Guest cart reload triggered');
  }, []);

  return {
    currentStep,
    loading,
    error,
    cart,
    order,
    reviewCart,
    saveShipping,
    confirmOrder,
    setCurrentStep,
    shippingInfo,
    clearCart,
    loadCart
  };
};