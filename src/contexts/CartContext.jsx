import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import cartService from "../services/cartService";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounce ref
  const debounceTimeout = useRef();

  // Debounced loadCart
  const loadCart = useCallback(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await cartService.getCart();
        setCartItems(response.cart?.items || []);
        setCartCount(response.cart?.itemCount || 0);
        setError(null);
      } catch (err) {
        setError("Failed to fetch cart: " + err?.message);
      } finally {
        setIsLoading(false);
      }
    }, 400); // 400ms debounce
  }, []);

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

  // --- Clear Cart ---
  const clearCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await cartService.clearCart();
      if (response.success) {
        setCartItems([]);
        setCartCount(0);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Cart cleared');
        }
      }
    } catch (err) {
      setError(err.message);
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to clear cart:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

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