import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { VendorProductListPage } from '../../pages/VendorProductListPage';

// ✅ Mock setup at the top
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

jest.mock('../../services/productService');

const mockProducts = [
  { id: '1', name: 'Product 1', pricePerYard: 100, quantity: 10, status: 'ACTIVE' },
  { id: '2', name: 'Product 2', pricePerYard: 200, quantity: 5, status: 'ACTIVE' },
  { id: '3', name: 'Product 3', pricePerYard: 150, quantity: 8, status: 'ACTIVE' },
  { id: '4', name: 'Product 4', pricePerYard: 300, quantity: 3, status: 'ACTIVE' }
];

const mockAuthContext = {
  user: { id: 'vendor123', role: 'vendor' },
  isAuthenticated: true,
  loading: false,
  login: jest.fn(),
  logout: jest.fn()
};

// ✅ Single renderWithProviders declaration
const renderWithProviders = (component, options = {}) => {
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {children}
      </AuthContext.Provider>
    </BrowserRouter>
  );

  return render(component, { wrapper: Wrapper, ...options });
};

describe('Responsive Layout Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock product service
    const productService = require('../../services/productService');
    productService.getVendorProducts.mockResolvedValue({
      products: mockProducts
    });
  });

  describe('Mobile Viewport (max-width: 640px)', () => {
    beforeEach(() => {
      // Update matchMedia for mobile
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query.includes('(max-width: 640px)'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
    });

    test('should render single column grid on mobile', async () => {
      renderWithProviders(<VendorProductListPage />);
      
      await screen.findByText('Product 1');
      
      const gridContainer = screen.getByTestId('product-grid-container');
      expect(gridContainer).toHaveClass('grid-cols-1');
    });

    test('should stack view toggle buttons on mobile', async () => {
      renderWithProviders(<VendorProductListPage />);
      
      await screen.findByText('Product 1');
      
      const toggleContainer = screen.getByTestId('view-toggle-container');
      expect(toggleContainer).toHaveClass('flex-col', 'sm:flex-row');
    });
  });

  describe('Tablet Viewport (640px - 1024px)', () => {
    beforeEach(() => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query.includes('(min-width: 640px)') && query.includes('(max-width: 1024px)'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
    });

    test('should render two column grid on tablet', async () => {
      renderWithProviders(<VendorProductListPage />);
      
      await screen.findByText('Product 1');
      
      // Switch to grid view
      fireEvent.click(screen.getByText('Grid'));
      
      const gridContainer = screen.getByTestId('product-grid-container');
      expect(gridContainer).toHaveClass('sm:grid-cols-2');
    });
  });

  describe('Desktop Viewport (1024px+)', () => {
    beforeEach(() => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query.includes('(min-width: 1024px)'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
    });

    test('should render four column grid on desktop', async () => {
      renderWithProviders(<VendorProductListPage />);
      
      await screen.findByText('Product 1');
      
      fireEvent.click(screen.getByText('Grid'));
      
      const gridContainer = screen.getByTestId('product-grid-container');
      expect(gridContainer).toHaveClass('lg:grid-cols-3', 'xl:grid-cols-4');
    });
  });
});