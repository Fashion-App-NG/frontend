import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

describe('Visual Regression Tests', () => {
  let productService;

  beforeEach(() => {
    productService = require('../../services/productService');
    productService.getVendorProducts.mockClear();
    productService.getVendorProducts.mockResolvedValue({
      products: mockProducts
    });
  });

  test('should maintain consistent grid layout appearance', async () => {
    renderComponent();
    
    await screen.findByText('Cotton Fabric');
    
    fireEvent.click(screen.getByText('Grid'));
    
    // ✅ Test layout behavior instead of DOM structure
    const gridContainer = screen.getByTestId('product-grid-container');
    expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2');
    
    // ✅ Test that products are visible in grid layout
    expect(screen.getByText('Cotton Fabric')).toBeVisible();
    expect(screen.getByText('Silk Material')).toBeVisible();
  });

  test('should maintain consistent list layout appearance', async () => {
    renderComponent();
    
    await screen.findByText('Cotton Fabric');
    
    // ✅ Test list layout behavior instead of DOM access
    const listContainer = screen.getByTestId('product-list-container');
    expect(listContainer).toHaveClass('space-y-4');
    
    // ✅ Test that products are displayed in list format
    expect(screen.getAllByTestId(/product-card-/)).toHaveLength(2);
  });

  test('should maintain consistent loading state appearance', () => {
    // Mock delayed loading
    productService.getVendorProducts.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ products: mockProducts }), 1000))
    );
    
    renderComponent();
    
    // ✅ Test loading state elements instead of DOM structure
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading your products...')).toBeInTheDocument();
  });

  test('should maintain consistent empty state appearance', async () => {
    productService.getVendorProducts.mockResolvedValue({ products: [] });
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('No products yet')).toBeInTheDocument();
    });
    
    // ✅ Test empty state elements
    expect(screen.getByTestId('empty-state-container')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add product/i })).toBeInTheDocument();
  });

  test('should maintain consistent error state appearance', async () => {
    productService.getVendorProducts.mockRejectedValue(
      new Error('Failed to load products')
    );
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Error Loading Products')).toBeInTheDocument();
    });
    
    // ✅ Test error state elements
    expect(screen.getByTestId('error-state-container')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});