import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import VendorProductListPage from '../../pages/VendorProductListPage';
import productService from '../../services/productService';

// Mock dependencies
jest.mock('../../services/productService');
jest.mock('../../components/Product/ProductCard', () => {
  return function MockProductCard({ product }) {
    return <div data-testid={`product-card-${product.id}`}>{product.name}</div>;
  };
});
jest.mock('../../components/Product/ProductFilters', () => {
  return function MockProductFilters({ onFiltersChange }) {
    return (
      <div data-testid="product-filters">
        <button onClick={() => onFiltersChange({ search: 'test' })}>
          Apply Filter
        </button>
      </div>
    );
  };
});

const mockProducts = [
  {
    id: '1',
    name: 'Product A',
    pricePerYard: 100,
    quantity: 10,
    materialType: 'Cotton',
    status: 'ACTIVE',
    images: ['image1.jpg'],
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: '2', 
    name: 'Product B',
    pricePerYard: 200,
    quantity: 5,
    materialType: 'Silk',
    status: 'INACTIVE',
    images: ['image2.jpg'],
    createdAt: '2024-01-02T10:00:00Z'
  }
];

const mockAuthContext = {
  user: { id: 'vendor123', role: 'vendor' },
  isAuthenticated: true
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('VendorProductListPage', () => {
  beforeEach(() => {
    productService.getVendorProducts.mockClear();
    productService.getVendorProducts.mockResolvedValue({
      products: mockProducts
    });
  });

  describe('View Mode Toggle', () => {
    test('should render in list view by default', async () => {
      renderWithProviders(<VendorProductListPage />);
      
      // ✅ Wait for just one condition
      await waitFor(() => {
        expect(screen.getByText('List')).toHaveClass('bg-white');
      });
      
      // ✅ Then assert the rest immediately
      expect(screen.getByText('Grid')).not.toHaveClass('bg-white');
    });

    test('should switch to grid view when grid button clicked', async () => {
      renderWithProviders(<VendorProductListPage />);
      
      // ✅ Wait for products to load
      await waitFor(() => {
        expect(screen.getByText('Product A')).toBeInTheDocument();
      });

      const gridButton = screen.getByText('Grid');
      fireEvent.click(gridButton);

      // ✅ Wait for the primary change
      await waitFor(() => {
        expect(gridButton).toHaveClass('bg-white');
      });
      
      // ✅ Assert secondary condition
      expect(screen.getByText('List')).not.toHaveClass('bg-white');
    });

    test('should persist view mode in localStorage', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      
      renderWithProviders(<VendorProductListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Product A')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Grid'));
      
      // ✅ Wait for the view change to complete
      await waitFor(() => {
        expect(screen.getByText('Grid')).toHaveClass('bg-white');
      });
      
      // ✅ Assert localStorage call immediately
      expect(setItemSpy).toHaveBeenCalledWith('vendorProductView', 'grid');
      
      setItemSpy.mockRestore();
    });
  });

  describe('Product Loading and Display', () => {
    test('should load vendor products on mount', async () => {
      renderWithProviders(<VendorProductListPage />);
      
      // ✅ Wait for the primary condition (products loaded)
      await waitFor(() => {
        expect(screen.getByText('Product A')).toBeInTheDocument();
      });
      
      // ✅ Assert additional conditions immediately after
      expect(productService.getVendorProducts).toHaveBeenCalledWith('vendor123');
      expect(screen.getByText('Product B')).toBeInTheDocument();
    });

    test('should show loading state initially', () => {
      renderWithProviders(<VendorProductListPage />);
      
      expect(screen.getByText('Loading your products...')).toBeInTheDocument();
    });

    test('should show error state when loading fails', async () => {
      productService.getVendorProducts.mockRejectedValue(
        new Error('Failed to load products')
      );
      
      renderWithProviders(<VendorProductListPage />);
      
      // ✅ Wait for just the primary error indicator
      await waitFor(() => {
        expect(screen.getByText('Error Loading Products')).toBeInTheDocument();
      });
      
      // ✅ Assert additional error details immediately
      expect(screen.getByText('Failed to load products')).toBeInTheDocument();
    });

    test('should show empty state when no products exist', async () => {
      productService.getVendorProducts.mockResolvedValue({ products: [] });
      
      renderWithProviders(<VendorProductListPage />);
      
      // ✅ Wait for just the primary empty state indicator
      await waitFor(() => {
        expect(screen.getByText('No products yet')).toBeInTheDocument();
      });
      
      // ✅ Assert additional empty state elements immediately
      expect(screen.getByText('Create your first product')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add product/i })).toBeInTheDocument();
    });

    test('should display product cards in list view', async () => {
      renderWithProviders(<VendorProductListPage />);
      
      // ✅ Wait for products to load
      await waitFor(() => {
        expect(screen.getByText('Product A')).toBeInTheDocument();
      });
      
      // ✅ Assert product details and layout immediately
      expect(screen.getByText('Product B')).toBeInTheDocument();
      expect(screen.getByText('$29.99')).toBeInTheDocument();
      expect(screen.getAllByTestId('product-card')).toHaveLength(2);
    });
  });

  describe('Product Filtering', () => {
    test('should apply filters and reload products', async () => {
      renderWithProviders(<VendorProductListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Product A')).toBeInTheDocument();
      });

      const filterButton = screen.getByText('Apply Filter');
      fireEvent.click(filterButton);

      // Should trigger reloading with new filters
      expect(productService.getVendorProducts).toHaveBeenCalledTimes(2);
    });

    test('should show filtered empty state when no matches', async () => {
      renderWithProviders(<VendorProductListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Product A')).toBeInTheDocument();
      });

      // Simulate filter that returns no results
      productService.getVendorProducts.mockResolvedValueOnce({ products: [] });
      
      fireEvent.click(screen.getByText('Apply Filter'));
      
      // ✅ Wait for just the primary empty state indicator
      await waitFor(() => {
        expect(screen.getByText('No products match your filters')).toBeInTheDocument();
      });
      
      // ✅ Assert additional UI elements immediately
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
    });

    test('should clear filters and reload all products', async () => {
      renderWithProviders(<VendorProductListPage />);
      
      // Start with filtered results
      productService.getVendorProducts.mockResolvedValueOnce({ products: [] });
      fireEvent.click(screen.getByText('Apply Filter'));
      
      await waitFor(() => {
        expect(screen.getByText('No products match your filters')).toBeInTheDocument();
      });
      
      // Mock successful reload with all products
      productService.getVendorProducts.mockResolvedValueOnce({ 
        products: [
          { id: 1, name: 'Product A', price: 29.99 },
          { id: 2, name: 'Product B', price: 39.99 }
        ] 
      });
      
      fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
      
      // ✅ Wait for products to reload
      await waitFor(() => {
        expect(screen.getByText('Product A')).toBeInTheDocument();
      });
      
      // ✅ Assert all products are back
      expect(screen.getByText('Product B')).toBeInTheDocument();
      expect(screen.queryByText('No products match your filters')).not.toBeInTheDocument();
      expect(productService.getVendorProducts).toHaveBeenCalledWith('vendor123', {});
    });
  });

  describe('Authentication and Authorization', () => {
    test('should redirect to login when not authenticated', () => {
      const unauthenticatedContext = {
        user: null,
        isAuthenticated: false,
        loading: false
      };
      
      const mockNavigate = jest.fn();
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate
      }));
      
      renderWithProviders(<VendorProductListPage />, { 
        authContext: unauthenticatedContext 
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('should show access denied for non-vendor users', async () => {
      const nonVendorContext = {
        user: { id: 'user123', role: 'customer' },
        isAuthenticated: true,
        loading: false
      };
      
      renderWithProviders(<VendorProductListPage />, { 
        authContext: nonVendorContext 
      });
      
      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });
      
      expect(screen.getByText('You must be a vendor to access this page')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /go back/i })).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    test('should render grid layout with responsive classes', async () => {
      renderWithProviders(<VendorProductListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Product A')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Grid'));
      
      // ✅ Use data-testid on the container itself, not parent access
      const gridContainer = screen.getByTestId('product-grid-container');
      expect(gridContainer).toHaveClass(
        'grid',
        'grid-cols-1',
        'sm:grid-cols-2', 
        'lg:grid-cols-3',
        'xl:grid-cols-4'
      );
    });

    test('should render list layout with proper spacing', async () => {
      renderWithProviders(<VendorProductListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Product A')).toBeInTheDocument();
      });

      // ✅ Use specific test IDs for layout containers
      const listContainer = screen.getByTestId('product-list-container');
      expect(listContainer).toHaveClass('space-y-4', 'flex', 'flex-col');
    });

    test('should show different product card styles per layout', async () => {
      renderWithProviders(<VendorProductListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Product A')).toBeInTheDocument();
      });

      // Test list view card style
      const listCard = screen.getByTestId('product-card-1');
      expect(listCard).toHaveClass('flex', 'flex-row', 'w-full');

      // Switch to grid view
      fireEvent.click(screen.getByText('Grid'));
      
      await waitFor(() => {
        expect(screen.getByText('Grid')).toHaveClass('bg-white');
      });

      // Test grid view card style
      const gridCard = screen.getByTestId('product-card-1');
      expect(gridCard).toHaveClass('flex', 'flex-col', 'rounded-lg');
    });
  });

  describe('Product Card Interactions', () => {
    test('should handle product card click navigation', async () => {
      const mockNavigate = jest.fn();
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate
      }));

      renderWithProviders(<VendorProductListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Product A')).toBeInTheDocument();
      });

      // ✅ Use role and accessible name instead of DOM traversal
      const productCard = screen.getByRole('article', { name: /product a/i });
      fireEvent.click(productCard);

      expect(mockNavigate).toHaveBeenCalledWith('/vendor/products/1');
    });

    test('should show product actions menu', async () => {
      renderWithProviders(<VendorProductListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Product A')).toBeInTheDocument();
      });

      // ✅ Use accessible button selectors
      const moreActionsButton = screen.getByRole('button', { 
        name: /more actions for product a/i 
      });
      fireEvent.click(moreActionsButton);

      // Assert menu items appear
      expect(screen.getByRole('menuitem', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /duplicate/i })).toBeInTheDocument();
    });
  });
});