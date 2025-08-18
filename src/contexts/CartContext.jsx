import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import cartService from "../services/cartService";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const providerId = useRef(Math.random().toString(36).substr(2, 9)); // More unique ID
  
  useEffect(() => {
    console.log(`[MULTI-PROVIDER-TEST] CartProvider-${providerId.current} MOUNTED`);
    console.log(`[MULTI-PROVIDER-TEST] Active providers:`, window.activeCartProviders || 0);
    
    // Track active providers globally
    if (!window.activeCartProviders) window.activeCartProviders = 0;
    window.activeCartProviders++;
    
    return () => {
      window.activeCartProviders--;
      console.log(`[MULTI-PROVIDER-TEST] CartProvider-${providerId.current} UNMOUNTED`);
      console.log(`[MULTI-PROVIDER-TEST] Remaining providers:`, window.activeCartProviders);
    };
  }, []);

  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounce ref
  const debounceTimeout = useRef();

  // Debounced loadCart
  const loadCartCallCount = useRef(0);
  const loadCart = useCallback(() => {
    const callId = ++loadCartCallCount.current;
    console.log(`[LOAD-CART-DEBOUNCE-TEST] loadCart called #${callId} - Provider: ${providerId.current}`);
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(async () => {
      console.log(`[LOAD-CART-DEBOUNCE-TEST] Executing debounced call #${callId}`);
      setIsLoading(true);
      setError(null); // Clear previous errors
    
      try {
        const response = await cartService.getCart();
        console.log(`[LOAD-CART-DEBOUNCE-TEST] API response for call #${callId}:`, response);
        
        if (response && response.cart) {
          setCartItems(response.cart.items || []);
          setCartCount(response.cart.itemCount || 0);
          setError(null);
          console.log('✅ Cart loaded successfully');
        } else {
          console.warn('⚠️ Invalid cart response, using empty cart');
          setCartItems([]);
          setCartCount(0);
          setError(null);
        }
        
      } catch (err) {
        console.error(`[LOAD-CART-DEBOUNCE-TEST] Error in call #${callId}:`, err);
        
        // ✅ GRACEFUL ERROR HANDLING: Don't show errors to users for auth issues
        if (err.message.includes('401') || err.message.includes('Authentication')) {
          console.log('🔄 Auth error - using empty cart silently');
          setCartItems([]);
          setCartCount(0);
          setError(null); // Don't show auth errors
        } else {
          setError("Cart temporarily unavailable");
        }
      } finally {
        setIsLoading(false);
      }
    }, 400);
  }, [providerId]); // Add providerId to track which instance

  useEffect(() => {
    loadCart();
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [loadCart]);

  // --- Add Item to Cart ---
  const addToCart = useCallback(async (product) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await cartService.addItem(product);
      if (response.success && response.cart) {
        setCartItems(response.cart.items || []);
        setCartCount(response.cart.itemCount || 0);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Item added to cart:', product, response.cart);
        }
      }
    } catch (err) {
      setError(err.message);
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to add item to cart:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Update Cart Item Quantity ---
  const updateCartItemQuantity = useCallback(async (productId, quantity) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await cartService.updateQuantity(productId, quantity);
      if (response.success && response.cart) {
        setCartItems(response.cart.items || []);
        setCartCount(response.cart.itemCount || 0);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Cart item quantity updated:', productId, quantity, response.cart);
        }
      }
    } catch (err) {
      setError(err.message);
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to update cart item:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Remove Item from Cart ---
  const removeFromCart = useCallback(async (productId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await cartService.removeItem(productId);
      if (response.success && response.cart) {
        setCartItems(response.cart.items || []);
        setCartCount(response.cart.itemCount || 0);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Item removed from cart:', productId, response.cart);
        }
      }
    } catch (err) {
      setError(err.message);
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to remove item from cart:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add this BEFORE the existing clearCart definition
  const clearCartCallCount = useRef(0);
  const lastClearCartCall = useRef(0);

  // --- Clear Cart ---
  const clearCart = useCallback(async (isCheckoutComplete = false) => {
    const callId = ++clearCartCallCount.current;
    const now = Date.now();
    const timeSinceLastCall = now - lastClearCartCall.current;
    
    console.log(`[CLEAR-CART-LOOP-TEST] Call #${callId} - Provider: ${providerId.current}`);
    console.log(`[CLEAR-CART-LOOP-TEST] Time since last call: ${timeSinceLastCall}ms`);
    console.log(`[CLEAR-CART-LOOP-TEST] Current dependencies - cartCount: ${cartCount}, cartItems: ${cartItems.length}`);
    console.log(`[CLEAR-CART-LOOP-TEST] isCheckoutComplete: ${isCheckoutComplete}`);
    
    lastClearCartCall.current = now;
    
    // If called too frequently, log warning
    if (timeSinceLastCall < 1000 && callId > 1) {
      console.warn(`[CLEAR-CART-LOOP-TEST] ⚠️ Rapid calls detected! ${timeSinceLastCall}ms gap`);
      console.trace('[CLEAR-CART-LOOP-TEST] Call stack trace:');
    }
    
    console.log('[DEBUG] clearCart called');
    setIsLoading(true);
    setError(null);
    try {
      const response = await cartService.clearCart();
      if (process.env.NODE_ENV === 'development') {
        console.log('[DEBUG] cartService.clearCart response:', response);
      }
      if (response.success) {
        setCartItems([]);
        setCartCount(0);
        if (process.env.NODE_ENV === 'development') {
          console.log('[DEBUG] clearCart called: cartItems should now be [] and cartCount 0');
          setTimeout(() => {
            console.log('[DEBUG] After clearCart, cartItems:', cartItems, 'cartCount:', cartCount);
          }, 100); // allow state to update
        }
      }
    } catch (err) {
      setError(err.message);
      if (process.env.NODE_ENV === 'development') {
        console.error('[DEBUG] cartService.clearCart error:', err);
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to clear cart:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // TEMPORARILY REMOVE ALL DEPENDENCIES TO TEST

  // --- Merge Guest Cart (after login) ---
  const mergeGuestCart = useCallback(async (userJwt, guestSessionId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await cartService.mergeGuestCart(userJwt, guestSessionId);
      if (response.success && response.cart) {
        setCartItems(response.cart.items || []);
        setCartCount(response.cart.itemCount || 0);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Guest cart merged:', response.cart);
        }
      }
    } catch (err) {
      setError(err.message);
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to merge guest cart:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Helpers ---
  const isInCart = useCallback(
    (productId) => cartItems.some(item => item.productId === productId),
    [cartItems]
  );

  // --- Add this: Get cart total ---
  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = item.pricePerYard || item.price || 0;
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0);
  }, [cartItems]);

  // --- Context Value ---
  const value = {
    cartItems,
    cartCount,
    isLoading,
    error,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    isInCart,
    loadCart,
    mergeGuestCart,
    getCartTotal,
  };

  // --- Debug: Log cart state changes ---
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 CART STATE:', { cartItems, cartCount, isLoading, error });
    }
  }, [cartItems, cartCount, isLoading, error]);

  useEffect(() => {
    console.log('[CART] Cart items changed:', cartItems);
    console.log('[CART] Cart count:', cartCount);
  }, [cartItems, cartCount]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
