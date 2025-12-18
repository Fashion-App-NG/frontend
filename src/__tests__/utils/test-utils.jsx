import { render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext'; // ✅ Import real AuthContext

// ✅ Create a mock CartContext only
const CartContext = React.createContext();

const AllTheProviders = ({ children, authValue, cartValue }) => {
  const defaultAuthValue = {
    user: { id: 'vendor123', role: 'vendor', name: 'Test Vendor' },
    isAuthenticated: true,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn()
  };

  const defaultCartValue = {
    items: [],
    cartCount: 0,
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    clearCart: jest.fn(),
    updateQuantity: jest.fn()
  };

  return (
    <BrowserRouter>
      <AuthContext.Provider value={authValue || defaultAuthValue}>
        <CartContext.Provider value={cartValue || defaultCartValue}>
          {children}
        </CartContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

const customRender = (ui, { authValue, cartValue, ...options } = {}) =>
  render(ui, { 
    wrapper: (props) => <AllTheProviders {...props} authValue={authValue} cartValue={cartValue} />, 
    ...options 
  });

// ✅ Export the real AuthContext and mock CartContext
export { AuthContext, CartContext };

// re-export everything
  export * from '@testing-library/react';

// override render method
export { customRender as render };

// ✅ Test utility functions
export const mockViewport = (width) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => {
      const isMobile = width <= 640;
      const isTablet = width > 640 && width <= 1024;
      const isDesktop = width > 1024;

      let matches = false;
      if (query.includes('(max-width: 640px)') && isMobile) matches = true;
      if (query.includes('(min-width: 640px)') && !isMobile) matches = true;
      if (query.includes('(min-width: 1024px)') && isDesktop) matches = true;

      return {
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    }),
  });
};

describe('Test Utils', () => {
  test('should export render utilities', () => {
    expect(customRender).toBeDefined();
    expect(AuthContext).toBeDefined();
    expect(CartContext).toBeDefined();
  });
});
