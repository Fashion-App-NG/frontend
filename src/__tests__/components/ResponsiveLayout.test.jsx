import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import VendorProductListPage from '../../pages/VendorProductListPage'; // ✅ Fixed import

// ✅ Mock setup
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
});

jest.mock('../../services/productService', () => ({
  getVendorProducts: jest.fn(() => Promise.resolve({
    products: [
      { id: '1', name: 'Product 1', pricePerYard: 100, quantity: 10, status: 'ACTIVE' },
      { id: '2', name: 'Product 2', pricePerYard: 200, quantity: 5, status: 'ACTIVE' }
    ]
  }))
}));

const mockAuthContext = {
  user: { id: 'vendor123', role: 'vendor' },
  isAuthenticated: true,
  loading: false
};

// ✅ Fixed renderWithProviders function
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Mobile Viewport (max-width: 640px)', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query.includes('(max-width: 640px)'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    });
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
    expect(toggleContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row');
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
    }));
  });

  test('should render two column grid on tablet', async () => {
    renderWithProviders(<VendorProductListPage />);
    
    await screen.findByText('Product 1');
    
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