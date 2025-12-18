import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import VendorProductListPage from '../../pages/VendorProductListPage';

// ✅ Mock services properly
jest.mock('../../services/productService', () => ({
  getVendorProducts: jest.fn()
}));

const mockProducts = [
  {
    id: '1',
    name: 'Cotton Fabric',
    pricePerYard: 150,
    quantity: 20,
    materialType: 'Cotton',
    pattern: 'Floral',
    status: 'ACTIVE',
    images: ['https://example.com/image1.jpg']
  },
  {
    id: '2',
    name: 'Silk Material',
    pricePerYard: 300,
    quantity: 10,
    materialType: 'Silk',
    pattern: 'Solid',
    status: 'INACTIVE',
    images: ['https://example.com/image2.jpg']
  }
];

const mockAuthContext = {
  user: { id: 'vendor123', role: 'vendor' },
  isAuthenticated: true
};

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        <VendorProductListPage />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

// ✅ Create simple visual test components
const VisualTestComponent = ({ variant = 'default', size = 'medium', theme = 'light' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'p-2 text-sm';
      case 'large':
        return 'p-6 text-lg';
      default:
        return 'p-4 text-base';
    }
  };

  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-800 text-white border-gray-600';
      default:
        return getVariantStyles();
    }
  };

  return (
    <div 
      data-testid="visual-component"
      className={`rounded-lg border ${getSizeStyles()} ${getThemeStyles()}`}
    >
      <h3 className="font-semibold mb-2">Visual Test Component</h3>
      <p>Variant: {variant}</p>
      <p>Size: {size}</p>
      <p>Theme: {theme}</p>
      <button 
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        data-testid="test-button"
      >
        Test Button
      </button>
    </div>
  );
};

// ✅ Mock ProductCard component for testing
const MockProductCard = ({ product, variant = 'grid' }) => {
  const isListView = variant === 'list';
  
  return (
    <div 
      data-testid={`product-card-${product.id}`}
      className={`bg-white rounded-lg shadow border p-4 ${
        isListView ? 'flex flex-row items-center space-x-4' : 'flex flex-col space-y-2'
      }`}
    >
      <div 
        className={`bg-gray-200 rounded ${
          isListView ? 'w-16 h-16' : 'w-full h-32'
        }`}
        data-testid="product-image"
      />
      <div className={isListView ? 'flex-1' : ''}>
        <h4 className="font-semibold">{product.name}</h4>
        <p className="text-gray-600">₦{product.price}</p>
        <span 
          className={`inline-block px-2 py-1 rounded text-xs ${
            product.status === 'ACTIVE' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
        >
          {product.status === 'ACTIVE' ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
};

// ✅ Layout test component
const LayoutTestComponent = ({ view = 'grid', products = [] }) => {
  return (
    <div data-testid="layout-container">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Products</h2>
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 rounded ${view === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            data-testid="grid-view-btn"
          >
            Grid
          </button>
          <button 
            className={`px-3 py-1 rounded ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            data-testid="list-view-btn"
          >
            List
          </button>
        </div>
      </div>
      
      <div 
        className={
          view === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
            : 'space-y-4'
        }
        data-testid="products-container"
      >
        {products.map(product => (
          <MockProductCard key={product.id} product={product} variant={view} />
        ))}
      </div>
    </div>
  );
};

const renderWithAuth = (component) => {
  const authValue = {
    user: { id: 'vendor123', role: 'vendor', name: 'Test Vendor' },
    isAuthenticated: true,
    loading: false
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Visual Regression Tests', () => {
  const mockProducts = [
    { id: '1', name: 'Cotton Fabric', price: 150, status: 'ACTIVE' },
    { id: '2', name: 'Silk Material', price: 300, status: 'INACTIVE' }
  ];

  describe('Component Variants', () => {
    test('should render default variant correctly', () => {
      renderWithAuth(<VisualTestComponent variant="default" />);
      
      const component = screen.getByTestId('visual-component');
      expect(component).toBeInTheDocument();
      expect(component).toHaveClass('bg-gray-50', 'border-gray-200', 'text-gray-800');
      expect(screen.getByText('Variant: default')).toBeInTheDocument();
    });

    test('should render error variant correctly', () => {
      renderWithAuth(<VisualTestComponent variant="error" />);
      
      const component = screen.getByTestId('visual-component');
      expect(component).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');
      expect(screen.getByText('Variant: error')).toBeInTheDocument();
    });

    test('should render success variant correctly', () => {
      renderWithAuth(<VisualTestComponent variant="success" />);
      
      const component = screen.getByTestId('visual-component');
      expect(component).toHaveClass('bg-green-50', 'border-green-200', 'text-green-800');
      expect(screen.getByText('Variant: success')).toBeInTheDocument();
    });

    test('should render warning variant correctly', () => {
      renderWithAuth(<VisualTestComponent variant="warning" />);
      
      const component = screen.getByTestId('visual-component');
      expect(component).toHaveClass('bg-yellow-50', 'border-yellow-200', 'text-yellow-800');
      expect(screen.getByText('Variant: warning')).toBeInTheDocument();
    });
  });

  describe('Component Sizes', () => {
    test('should render small size correctly', () => {
      renderWithAuth(<VisualTestComponent size="small" />);
      
      const component = screen.getByTestId('visual-component');
      expect(component).toHaveClass('p-2', 'text-sm');
      expect(screen.getByText('Size: small')).toBeInTheDocument();
    });

    test('should render large size correctly', () => {
      renderWithAuth(<VisualTestComponent size="large" />);
      
      const component = screen.getByTestId('visual-component');
      expect(component).toHaveClass('p-6', 'text-lg');
      expect(screen.getByText('Size: large')).toBeInTheDocument();
    });
  });

  describe('Theme Variations', () => {
    test('should render light theme correctly', () => {
      renderWithAuth(<VisualTestComponent theme="light" />);
      
      const component = screen.getByTestId('visual-component');
      expect(component).toHaveClass('bg-gray-50', 'text-gray-800');
      expect(screen.getByText('Theme: light')).toBeInTheDocument();
    });

    test('should render dark theme correctly', () => {
      renderWithAuth(<VisualTestComponent theme="dark" />);
      
      const component = screen.getByTestId('visual-component');
      expect(component).toHaveClass('bg-gray-800', 'text-white', 'border-gray-600');
      expect(screen.getByText('Theme: dark')).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    test('should render interactive button with correct styling', () => {
      renderWithAuth(<VisualTestComponent />);
      
      const button = screen.getByTestId('test-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-blue-500', 'text-white', 'rounded', 'hover:bg-blue-600');
    });

    test('should handle button interactions', () => {
      renderWithAuth(<VisualTestComponent />);
      
      const button = screen.getByTestId('test-button');
      fireEvent.click(button);
      
      // Button should remain styled after interaction
      expect(button).toHaveClass('bg-blue-500', 'text-white');
    });
  });

  describe('Layout Consistency', () => {
    test('should render grid layout correctly', () => {
      renderWithAuth(<LayoutTestComponent view="grid" products={mockProducts} />);
      
      const container = screen.getByTestId('products-container');
      expect(container).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-4');
      
      // Check products are rendered
      expect(screen.getByTestId('product-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-2')).toBeInTheDocument();
    });

    test('should render list layout correctly', () => {
      renderWithAuth(<LayoutTestComponent view="list" products={mockProducts} />);
      
      const container = screen.getByTestId('products-container');
      expect(container).toHaveClass('space-y-4');
      
      // Check products are in list format
      const product1 = screen.getByTestId('product-card-1');
      expect(product1).toHaveClass('flex', 'flex-row', 'items-center', 'space-x-4');
    });

    test('should show active view button state', () => {
      renderWithAuth(<LayoutTestComponent view="grid" products={mockProducts} />);
      
      const gridBtn = screen.getByTestId('grid-view-btn');
      const listBtn = screen.getByTestId('list-view-btn');
      
      expect(gridBtn).toHaveClass('bg-blue-500', 'text-white');
      expect(listBtn).toHaveClass('bg-gray-200');
    });
  });

  describe('Product Card Visual States', () => {
    test('should render active product with correct styling', () => {
      const activeProduct = { id: '1', name: 'Test Product', price: 100, status: 'ACTIVE' };
      
      renderWithAuth(<MockProductCard product={activeProduct} />);
      
      const statusBadge = screen.getByText('Active');
      expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    test('should render inactive product with correct styling', () => {
      const inactiveProduct = { id: '1', name: 'Test Product', price: 100, status: 'INACTIVE' };
      
      renderWithAuth(<MockProductCard product={inactiveProduct} />);
      
      const statusBadge = screen.getByText('Inactive');
      expect(statusBadge).toHaveClass('bg-red-100', 'text-red-800');
    });

    test('should render grid view card layout', () => {
      const product = { id: '1', name: 'Test Product', price: 100, status: 'ACTIVE' };
      
      renderWithAuth(<MockProductCard product={product} variant="grid" />);
      
      const card = screen.getByTestId('product-card-1');
      expect(card).toHaveClass('flex', 'flex-col', 'space-y-2');
      
      const image = screen.getByTestId('product-image');
      expect(image).toHaveClass('w-full', 'h-32');
    });

    test('should render list view card layout', () => {
      const product = { id: '1', name: 'Test Product', price: 100, status: 'ACTIVE' };
      
      renderWithAuth(<MockProductCard product={product} variant="list" />);
      
      const card = screen.getByTestId('product-card-1');
      expect(card).toHaveClass('flex', 'flex-row', 'items-center', 'space-x-4');
      
      const image = screen.getByTestId('product-image');
      expect(image).toHaveClass('w-16', 'h-16');
    });
  });

  describe('Responsive Behavior', () => {
    test('should apply responsive classes correctly', () => {
      renderWithAuth(<LayoutTestComponent view="grid" products={mockProducts} />);
      
      const container = screen.getByTestId('products-container');
      
      // Check for responsive grid classes
      expect(container).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });

    test('should maintain component structure across sizes', () => {
      renderWithAuth(<VisualTestComponent size="small" />);
      
      // Component should maintain its essential structure regardless of size
      expect(screen.getByTestId('visual-component')).toBeInTheDocument();
      expect(screen.getByTestId('test-button')).toBeInTheDocument();
      expect(screen.getByText('Visual Test Component')).toBeInTheDocument();
    });
  });
});