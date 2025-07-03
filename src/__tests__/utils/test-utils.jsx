import { render } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

// ✅ Default mock context for all tests
const defaultAuthContext = {
  user: { id: 'vendor123', role: 'vendor', name: 'Test Vendor' },
  isAuthenticated: true,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  updateUser: jest.fn()
};

// ✅ Mock all services consistently
jest.mock('../../services/productService', () => ({
  getVendorProducts: jest.fn(() => Promise.resolve({
    products: [
      { id: '1', name: 'Product 1', pricePerYard: 100, quantity: 10, status: 'ACTIVE' },
      { id: '2', name: 'Product 2', pricePerYard: 200, quantity: 5, status: 'ACTIVE' }
    ]
  })),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn()
}));

export const renderWithProviders = (
  component,
  {
    authContext = defaultAuthContext,
    initialEntries = ['/'],
    useMemoryRouter = false,
    ...renderOptions
  } = {}
) => {
  const Router = useMemoryRouter ? MemoryRouter : BrowserRouter;
  const routerProps = useMemoryRouter ? { initialEntries } : {};

  const Wrapper = ({ children }) => (
    <Router {...routerProps}>
      <AuthContext.Provider value={authContext}>
        {children}
      </AuthContext.Provider>
    </Router>
  );

  return render(component, { wrapper: Wrapper, ...renderOptions });
};

// ✅ Viewport testing utility
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

// ✅ Re-export everything from React Testing Library
export * from '@testing-library/react';
