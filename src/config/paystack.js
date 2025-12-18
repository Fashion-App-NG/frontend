export const PAYSTACK_CONFIG = {
  publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || 'pk_test_your_test_key_here',
  currency: 'NGN',
  channels: ['card', 'bank', 'ussd', 'mobile_money'],
  sandbox: process.env.NODE_ENV !== 'production' // Use sandbox for development
};

export const formatAmountForPaystack = (amount) => {
  // Paystack expects amount in kobo (multiply by 100)
  return Math.round(amount * 100);
};

export const formatAmountFromPaystack = (amount) => {
  // Convert from kobo to naira (divide by 100)
  return amount / 100;
};