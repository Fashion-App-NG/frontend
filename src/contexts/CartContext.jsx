import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // ✅ Load cart from localStorage on mount
  useEffect(() => {
    try {
      let savedCart = localStorage.getItem('fashionCart');
      
      // Check for old key if new key is not found
      if (!savedCart) {
        const oldCart = localStorage.getItem('fashionCultureCart');
        if (oldCart) {
          savedCart = oldCart;
          localStorage.setItem('fashionCart', oldCart); // Migrate to new key
          localStorage.removeItem('fashionCultureCart'); // Remove old key
        }
      }
      
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      setCartItems([]);
      setCartCount(0);
    }
  }, []);

  // ✅ Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('fashionCart', JSON.stringify(cartItems));
      const newCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
      setCartCount(newCount);
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  const addToCart = (product) => {
    console.log('🛒 Adding to cart:', product);
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + (product.quantity || 1) }
            : item
        );
      } else {
        // Add new item
        return [...prevItems, { ...product, quantity: product.quantity || 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    console.log('🗑️ Removing from cart:', productId);
    
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
    localStorage.removeItem('fashionCart');
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || item.pricePerYard || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const value = {
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    isInCart,
    getCartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};