import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // ✅ FIX: Fallback: Load cart from localStorage (migration support)
  const loadCartFromLocalStorage = useCallback(async () => {
    try {
      let savedCart = localStorage.getItem('fashionCart');
      
      if (!savedCart) {
        const oldCart = localStorage.getItem('fashionCultureCart');
        if (oldCart) {
          savedCart = oldCart;
          localStorage.setItem('fashionCart', oldCart);
          localStorage.removeItem('fashionCultureCart');
        }
      }
      
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCartItems(parsed);
          setCartCount(parsed.reduce((total, item) => total + (item.quantity || 1), 0));
          
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ Loaded cart from localStorage fallback:', parsed.length, 'items');
          }
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      setCartItems([]);
      setCartCount(0);
    }
  }, []); // ✅ FIX: No dependencies needed - pure localStorage function

  // ✅ FIX: Migrate localStorage cart to API (separate function)
  const migrateLocalStorageToAPI = useCallback(async (localItems) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Migrating localStorage cart to API...');
      }

      for (const item of localItems) {
        try {
          await cartService.addItem({
            productId: item.id,
            name: item.name,
            pricePerYard: item.pricePerYard || item.price,
            quantity: item.quantity || 1,
            materialType: item.materialType,
            pattern: item.pattern,
            image: item.image,
            vendorId: item.vendorId,
            vendorName: item.vendorName
          });
        } catch (error) {
          console.error('Failed to migrate item:', item.name, error);
        }
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('fashionCart');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Cart migration completed');
      }
    } catch (error) {
      console.error('❌ Cart migration failed:', error);
    }
  }, []); // ✅ FIX: No dependencies needed - receives data as parameter

  // ✅ Load cart from API
  const loadCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await cartService.getCart();
      
      if (response.success && response.cart) {
        setCartItems(response.cart.items || []);
        setCartCount(response.cart.itemCount || 0);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Cart loaded from API:', {
            itemCount: response.cart.itemCount,
            totalAmount: response.cart.totalAmount
          });
        }
      }
    } catch (error) {
      console.error('❌ Failed to load cart:', error);
      setError(error.message);
      
      // Fallback to localStorage for backward compatibility
      await loadCartFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  }, [loadCartFromLocalStorage]); // ✅ FIX: Include loadCartFromLocalStorage dependency

  // ✅ Initialize cart on mount and auth changes
  useEffect(() => {
    const initializeCart = async () => {
      if (isAuthenticated) {
        // Check for localStorage items to migrate first
        try {
          const savedCart = localStorage.getItem('fashionCart');
          if (savedCart) {
            const parsed = JSON.parse(savedCart);
            if (Array.isArray(parsed) && parsed.length > 0) {
              await migrateLocalStorageToAPI(parsed);
            }
          }
        } catch (error) {
          console.error('Migration check failed:', error);
        }
        
        // Load from API
        await loadCart();
      } else {
        // Guest user - create guest session and load cart
        if (!cartService.getGuestSessionId()) {
          await cartService.createGuestSession();
        }
        await loadCart();
      }
    };

    initializeCart();
  }, [isAuthenticated, loadCart, migrateLocalStorageToAPI]); // ✅ FIX: Include all dependencies

  // ✅ Handle login cart merging
  useEffect(() => {
    const handleLoginCartMerge = async () => {
      if (isAuthenticated && user) {
        const guestSessionId = cartService.getGuestSessionId();
        
        if (guestSessionId) {
          try {
            await cartService.mergeGuestCart(guestSessionId);
            await loadCart(); // Reload merged cart
          } catch (error) {
            console.error('Failed to merge guest cart:', error);
            // Continue with normal cart loading
            await loadCart();
          }
        } else {
          await loadCart();
        }
      }
    };

    handleLoginCartMerge();
  }, [user, isAuthenticated, loadCart]); // ✅ FIX: Include loadCart dependency

  // Add these helper functions before the addToCartSync function

  // Calculate cart count
  const updateCartCount = (cart) => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  // Save to localStorage
  const saveCartToLocalStorage = (cart) => {
    localStorage.setItem('fashionCart', JSON.stringify(cart));
  };

  // Then either use addToCartSync or remove it
  // Option 1: Remove unused function (simplest solution)
  // Delete the entire addToCartSync function

  // Option 2: Use it instead of the regular addToCart function
  // Replace your addToCart implementation with addToCartSync

  // ✅ FIX: Single, simplified addToCart function
  const addToCart = useCallback(async (product) => {
    // ✅ FIX: Prevent multiple simultaneous requests
    if (isAddingToCart) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Add to cart already in progress, ignoring duplicate request');
      }
      return;
    }

    try {
      setIsAddingToCart(true);
      setError(null);

      // ✅ FIX: Extract vendorId from multiple possible sources
      const extractVendorId = (product) => {
        // Try direct vendorId field
        if (product.vendorId) return product.vendorId;
        
        // Try vendor object
        if (product.vendor?.id) return product.vendor.id;
        if (product.vendor?._id) return product.vendor._id;
        
        // Try createdBy field (often used as vendor reference)
        if (product.createdBy?.id) return product.createdBy.id;
        if (product.createdBy?._id) return product.createdBy._id;
        if (product.createdBy && typeof product.createdBy === 'string') return product.createdBy;
        
        // If no vendor found, log warning and use placeholder
        console.warn('⚠️ No vendorId found for product:', product.name, 'Available fields:', Object.keys(product));
        return 'unknown-vendor'; // Backend might accept this or reject it
      };

      // ✅ FIX: Better product data normalization with vendorId extraction
      const productData = {
        productId: product.id || product._id,
        name: product.name,
        pricePerYard: parseFloat(product.pricePerYard || product.price || 0),
        quantity: parseInt(product.quantity || 1),
        materialType: product.materialType || 'Unknown',
        pattern: product.pattern || 'Unknown', 
        image: product.image || product.imageUrl || product.images?.[0] || '',
        vendorId: extractVendorId(product), // ✅ FIX: Extract vendorId properly
        vendorName: product.vendorName || product.vendor?.name || product.vendor?.storeName || 'Unknown Vendor'
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('🛒 Adding to cart via API:', productData);
        console.log('🔍 VendorId extraction debug:', {
          originalProduct: {
            vendorId: product.vendorId,
            vendor: product.vendor,
            createdBy: product.createdBy
          },
          extractedVendorId: productData.vendorId
        });
      }

      const response = await cartService.addItem(productData);

      if (response.success && response.cart) {
        setCartItems(response.cart.items || []);
        setCartCount(response.cart.itemCount || 0);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Item added to cart successfully:', {
            totalItems: response.cart.itemCount,
            totalAmount: response.cart.totalAmount
          });
        }
      }
    } catch (error) {
      console.error('❌ Failed to add item to cart:', error);
      setError(error.message);
      
      // ✅ Fallback with normalized data
      const fallbackItem = {
        id: product.id || product._id,
        productId: product.id || product._id,
        name: product.name,
        pricePerYard: product.pricePerYard || product.price,
        quantity: product.quantity || 1,
        materialType: product.materialType || 'Unknown',
        pattern: product.pattern || 'Unknown',
        image: product.image || product.imageUrl || '',
        vendorId: product.vendorId || product.vendor?.id || 'unknown-vendor',
        vendorName: product.vendorName || product.vendor?.name || 'Unknown Vendor',
        isLocalItem: true
      };
      
      setCartItems(prev => {
        const existingIndex = prev.findIndex(item => 
          (item.id === fallbackItem.id) || (item.productId === fallbackItem.productId)
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex].quantity = (updated[existingIndex].quantity || 1) + (fallbackItem.quantity || 1);
          return updated;
        }
        return [...prev, fallbackItem];
      });
      
      setCartCount(prev => prev + (product.quantity || 1));
    } finally {
      setIsAddingToCart(false);
    }
  }, [isAddingToCart]);

  // Add API synchronization to existing methods
  const addToCartSync = async (product) => {
    setIsAddingToCart(true);
    try {
      // First, update UI immediately for responsiveness
      const updatedCart = [...cartItems];
      const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        updatedCart[existingItemIndex].quantity += product.quantity || 1;
      } else {
        // Add new item
        updatedCart.push({...product, quantity: product.quantity || 1});
      }
      
      // Update local state first for immediate feedback
      setCartItems(updatedCart);
      updateCartCount(updatedCart);
      saveCartToLocalStorage(updatedCart);
      
      // Then sync with backend
      if (isAuthenticated) {
        await cartService.addToCart({
          productId: product.id,
          quantity: product.quantity || 1
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Cart synchronized with backend');
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      setError(error.message);
      return false;
    } finally {
      setIsAddingToCart(false);
    }
  };

  // ✅ Remove item from cart
  const removeFromCart = useCallback(async (productId) => {
    try {
      setIsLoading(true);
      setError(null);

      if (process.env.NODE_ENV === 'development') {
        console.log('🗑️ Removing from cart via API:', productId);
      }

      const response = await cartService.removeItem(productId);

      if (response.success && response.cart) {
        setCartItems(response.cart.items || []);
        setCartCount(response.cart.itemCount || 0);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Item removed from cart successfully');
        }
      }
    } catch (error) {
      console.error('❌ Failed to remove item from cart:', error);
      setError(error.message);
      
      // ✅ FIX: Better fallback to local removal with proper ID matching
      setCartItems(prev => prev.filter(item => 
        (item.id !== productId) && (item.productId !== productId)
      ));
      setCartCount(prev => {
        const removedItem = cartItems.find(item => 
          (item.id === productId) || (item.productId === productId)
        );
        return Math.max(0, prev - (removedItem?.quantity || 1));
      });
    } finally {
      setIsLoading(false);
    }
  }, [cartItems]); // ✅ FIX: Add cartItems dependency

  // ✅ Update cart item quantity
  const updateCartItemQuantity = useCallback(async (productId, newQuantity) => {
    console.log('🔍 UPDATE QUANTITY DEBUG - Start:', {
      productId,
      newQuantity,
      currentCartItems: cartItems.length,
      itemBeingUpdated: cartItems.find(item => 
        (item.id === productId) || (item.productId === productId)
      )
    });

    if (newQuantity <= 0) {
      console.log('🔍 UPDATE QUANTITY - Redirecting to removeFromCart for quantity 0');
      return removeFromCart(productId);
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 UPDATE QUANTITY - Making API call:', { productId, newQuantity });

      const response = await cartService.updateQuantity(productId, newQuantity);

      console.log('🔍 UPDATE QUANTITY - API Response:', {
        success: response.success,
        cartItemsCount: response.cart?.items?.length || 0,
        cartItemCount: response.cart?.itemCount || 0,
        responseCart: response.cart
      });

      if (response.success && response.cart) {
        console.log('🔍 UPDATE QUANTITY - Setting new cart state:', {
          newItems: response.cart.items,
          newCount: response.cart.itemCount
        });
        
        setCartItems(response.cart.items || []);
        setCartCount(response.cart.itemCount || 0);
        
        console.log('✅ Cart quantity updated successfully');
      }
    } catch (error) {
      console.error('❌ Failed to update cart quantity:', error);
      console.log('🔍 UPDATE QUANTITY - Error details:', {
        message: error.message,
        stack: error.stack,
        productId,
        newQuantity
      });
      
      setError(error.message);
      
      // ✅ FIX: Better fallback to local update with proper ID matching
      console.log('🔍 UPDATE QUANTITY - Using fallback local update');
      setCartItems(prev => {
        const updated = prev.map(item => {
          if ((item.id === productId) || (item.productId === productId)) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
        console.log('🔍 FALLBACK UPDATE - New cart items:', updated);
        return updated;
      });
      
      // ✅ FIX: Update cart count properly in fallback
      setCartCount(prev => {
        const item = cartItems.find(item => 
          (item.id === productId) || (item.productId === productId)
        );
        if (item) {
          const difference = newQuantity - (item.quantity || 1);
          return prev + difference;
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  }, [removeFromCart, cartItems]); // ✅ FIX: Add cartItems dependency

  // ✅ Clear entire cart - enhanced for checkout completion
  const clearCart = useCallback(async (isCheckoutCompletion = false) => {
    try {
      setIsLoading(true);
      setError(null);

      if (process.env.NODE_ENV === 'development') {
        console.log('🗑️ Clearing cart via API...', { isCheckoutCompletion });
      }

      const response = await cartService.clearCart();

      if (response.success) {
        setCartItems([]);
        setCartCount(0);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Cart cleared successfully');
        }
      }
    } catch (error) {
      console.error('❌ Failed to clear cart:', error);
      
      // For checkout completion, always clear locally even if API fails
      if (isCheckoutCompletion) {
        console.log('🔄 Forcing local cart clear after checkout completion');
        setCartItems([]);
        setCartCount(0);
        localStorage.removeItem('fashionCart');
        localStorage.removeItem('guestSessionId'); // Clear guest session too
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Check if product is in cart
  const isInCart = useCallback((productId) => {
    return cartItems.some(item => item.productId === productId || item.id === productId);
  }, [cartItems]);

  // ✅ Get cart total
  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = item.pricePerYard || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  }, [cartItems]);

  // ✅ Get cart item count from context (real-time)
  const getCartItemCount = useCallback(() => {
    return cartCount;
  }, [cartCount]);

  const value = {
    cartItems,
    cartCount,
    isLoading,
    isAddingToCart,
    error,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    isInCart,
    getCartTotal,
    getCartItemCount,
    loadCart
  };

  // ✅ DEBUG: Add comprehensive state logging
  useEffect(() => {
    console.log('🔍 CART STATE DEBUG:', {
      cartItems: cartItems.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        pricePerYard: item.pricePerYard,
        price: item.price,
        quantity: item.quantity,
        allFields: Object.keys(item)
      })),
      cartCount,
      isLoading,
      error,
      timestamp: new Date().toISOString()
    });
  }, [cartItems, cartCount, isLoading, error]);

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