import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import cartService from "../services/cartService";
import { getPriceWithPlatformFee } from '../utils/formatPrice';
import { stepPurchaseUnit } from '../utils/purchaseUnits';

const CartContext = createContext();

let activeCartProviders = 0;

export const CartProvider = ({ children }) => {
  const providerId = useRef(
  window.crypto && window.crypto.randomUUID
    ? window.crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11)
);

  useEffect(() => {
    activeCartProviders++;
    console.log(`[MULTI-PROVIDER-TEST] Active providers:`, activeCartProviders);
    return () => {
      activeCartProviders--;
      console.log(`[MULTI-PROVIDER-TEST] Remaining providers:`, activeCartProviders);
    };
  }, []);

  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceTimeout = useRef();

  const loadCartCallCount = useRef(0);
  const loadCart = useCallback(() => {
    const callId = ++loadCartCallCount.current;
    const id = providerId.current;
    console.log(`[LOAD-CART-DEBOUNCE-TEST] loadCart called #${callId} - Provider: ${id}`);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      console.log(`[LOAD-CART-DEBOUNCE-TEST] Executing debounced call #${callId}`);
      setIsLoading(true);
      setError(null);

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

        if (err.message.includes('401') || err.message.includes('Authentication')) {
          console.log('🔄 Auth error - using empty cart silently');
          setCartItems([]);
          setCartCount(0);
          setError(null);
        } else {
          setError("Cart temporarily unavailable");
        }
      } finally {
        setIsLoading(false);
      }
    }, 400);
  }, []);

  useEffect(() => {
    loadCart();
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [loadCart]);

  const addToCart = useCallback(async (product) => {
    console.log('🔍 DEBUG - addToCart payload:', {
      productData: product,
      basePrice: product.pricePerYard || product.price || 0,
      platformFee: product.platformFee?.amount || 0,
      totalPrice: (product.pricePerYard || product.price || 0) + (product.platformFee?.amount || 0),
      calculatedByUtility: getPriceWithPlatformFee(product)
    });

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
      if (err.message.includes('Session expired')) {
        setError('Your session has expired. Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/user-type-selection';
        }, 2000);
      } else {
        setError(err.message);
      }

      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to add item to cart:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Unchanged: still available for any caller that just wants to set a raw
  // yard quantity directly (e.g. a future manual "type a number" input).
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

  // ✅ NEW: this is what the cart's +/- stepper should call instead of
  // updateCartItemQuantity. Takes the full item (not just its id) because it
  // needs to know the item's current unit to decide whether to step the
  // unit count or the raw yard quantity — see stepPurchaseUnit in
  // purchaseUnits.js for that decision logic, kept fully unit-tested there.
  const stepCartItemUnit = useCallback(async (item, direction) => {
    const productId = item.productId || item.id;
    const step = stepPurchaseUnit(item, direction);

    setIsLoading(true);
    setError(null);
    try {
      // step.mode === 'unit' now carries EITHER offeringId (current
      // vendor-configurable offerings) or unitType (legacy, vestigial —
      // see stepPurchaseUnit's own comment). offeringId is checked first
      // since it's the live path.
      const response =
        step.mode === 'unit'
          ? await cartService.updateQuantity(
              productId,
              step.offeringId
                ? { offeringId: step.offeringId, unitCount: step.unitCount }
                : { unitType: step.unitType, unitCount: step.unitCount }
            )
          : await cartService.updateQuantity(productId, { quantity: step.quantity });

      if (response.success && response.cart) {
        setCartItems(response.cart.items || []);
        setCartCount(response.cart.itemCount || 0);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Cart item stepped:', productId, step, response.cart);
        }
      }
    } catch (err) {
      setError(err.message);
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to step cart item:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const clearCart = useCallback(async () => {
    try {
      setIsLoading(false);
      const response = await cartService.clearCart();
      if (process.env.NODE_ENV === 'development') {
        console.log('[DEBUG] cartService.clearCart response:', response);
      }
      if (response.success) {
        setCartItems([]);
        setCartCount(0);
        if (process.env.NODE_ENV === 'development') {
          console.log('[DEBUG] clearCart called: cartItems should now be [] and cartCount 0');
        }
      }
    } catch (err) {
      setError(err.message);
      if (process.env.NODE_ENV === 'development') {
        console.error('[DEBUG] cartService.clearCart error:', err);
        console.error('❌ Failed to clear cart:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const isInCart = useCallback(
    (productId) => cartItems.some(item => item.productId === productId),
    [cartItems]
  );

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = item.pricePerYard || item.price || 0;
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    cartCount,
    isLoading,
    error,
    addToCart,
    updateCartItemQuantity,
    stepCartItemUnit,
    removeFromCart,
    clearCart,
    isInCart,
    loadCart,
    mergeGuestCart,
    getCartTotal,
    setCartItems
  };

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
