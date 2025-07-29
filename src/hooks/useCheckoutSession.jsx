import { useCallback, useState } from 'react';
import checkoutService from '../services/checkoutService';

export const useCheckoutSession = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [cart, setCart] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setShippingInfo({ shippingAddress, customerInfo });
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
    try {
      console.log('Confirming order with:', {
        shippingAddress: shippingInfo.shippingAddress,
        customerInfo: shippingInfo.customerInfo,
        paymentDetails,
        reservationDuration
      });
      const data = await checkoutService.confirmOrder({
        shippingAddress: shippingInfo.shippingAddress,
        customerInfo: shippingInfo.customerInfo,
        paymentDetails,
        reservationDuration
      });
      setOrder(data.order);
      setCurrentStep(4); // Move to confirmation step
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [shippingInfo]);

  return {
    currentStep,
    cart,
    shippingInfo,
    order,
    loading,
    error,
    reviewCart,
    saveShipping,
    confirmOrder,
    setCurrentStep
  };
};
