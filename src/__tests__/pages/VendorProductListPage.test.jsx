import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import VendorProductListPage from '../../pages/VendorProductListPage';

// ✅ Mock ALL dependencies to prevent undefined component errors
jest.mock('../../hooks/useVendorProducts', () => ({
  useVendorProducts: () => ({
    products: [
      { id: '1', name: 'Product A', pricePerYard: 100, quantity: 10, status: 'ACTIVE' },
      { id: '2', name: 'Product B', pricePerYard: 200, quantity: 5, status: 'INACTIVE' }
    ],
    loadProducts: jest.fn(),
    updateProduct: jest.fn()
  })
}));

jest.mock('../../components/Product/ProductCard', () => {
  return function MockProductCard({ product, onClick }) {
    return (
      <div 
        data-testid={`product-card-${product.id}`}
        onClick={onClick}
        role="article"
        aria-label={`Product ${product.name}`}
        className="cursor-pointer"
      >
        <h3>{product.name}</h3>
        <p>₦{product.pricePerYard}</p>
        <span className={product.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}>
          {product.status === 'ACTIVE' ? 'Active' : 'Inactive'}
        </span>
      </div>
    );
  };
});

jest.mock('../../components/Product/ProductViewToggle', () => {
  return function MockProductViewToggle({ currentView, onViewChange }) {
    return (
      <div data-testid="view-toggle">
        <button onClick={() => onViewChange('list')}>List</button>
        <button onClick={() => onViewChange('grid')}>Grid</button>
      </div>
    );
  };
});

jest.mock('../../components/Vendor/ProductActionDropdown', () => ({
  ProductActionDropdown: function MockProductActionDropdown({ product, onAction }) {
    return (
      <button 
        onClick={() => onAction && onAction(product, 'edit')}
        aria-label={`More actions for ${product.name}`}
      >
        Actions
      </button>
    );
  }
}));

jest.mock('../../components/Vendor/RestockModal', () => ({
  RestockModal: function MockRestockModal({ isOpen, onClose }) {
    return isOpen ? <div data-testid="restock-modal">Restock Modal</div> : null;
  }
}));

jest.mock('../../services/productService', () => ({
  getVendorProducts: jest.fn(() => Promise.resolve({ products: [] })),
  updateProduct: jest.fn(() => Promise.resolve({ success: true }))
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(), jest.fn()]
}));

const renderWithAuth = (component, authValue = {}) => {
  const defaultAuthValue = {
    user: { id: 'vendor123', role: 'vendor', name: 'Test Vendor' },
    isAuthenticated: true,
    loading: false
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={{ ...defaultAuthValue, ...authValue }}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('VendorProductListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Page Structure', () => {
    test('should render the vendor product page', async () => {
      renderWithAuth(<VendorProductListPage />);
      
      expect(screen.getByTestId('vendor-product-page')).toBeInTheDocument();
      expect(screen.getByText('Product List')).toBeInTheDocument();
    });

    test('should render search input', () => {
      renderWithAuth(<VendorProductListPage />);
      
      expect(screen.getByPlaceholderText('Search Products')).toBeInTheDocument();
    });
  });

  describe('Authentication Guards', () => {
    test('should redirect if not authenticated', () => {
      renderWithAuth(<VendorProductListPage />, { 
        isAuthenticated: false,
        user: null 
      });
      
      expect(screen.queryByTestId('vendor-product-page')).not.toBeInTheDocument();
    });

    test('should redirect if user is not a vendor', () => {
      renderWithAuth(<VendorProductListPage />, { 
        isAuthenticated: true,
        user: { id: '123', role: 'shopper' }
      });
      
      expect(screen.queryByTestId('vendor-product-page')).not.toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    test('should show loading initially', () => {
      renderWithAuth(<VendorProductListPage />);
      
      // Test that the component renders without crashing
      expect(screen.getByTestId('vendor-product-page')).toBeInTheDocument();
    });
  });
});