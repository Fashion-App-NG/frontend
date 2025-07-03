import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from '../../components/Product/ProductCard';
import { AuthContext } from '../../contexts/AuthContext';

describe('ProductCard Component', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    pricePerYard: 50,
    quantity: 10,
    materialType: 'Cotton',
    status: 'ACTIVE',
    vendor: {
      name: 'Test Vendor'
    }
  };

  const mockAuthContext = {
    user: { id: 'test-user', role: 'shopper' },
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

  test('should show vendor info when showVendorInfo is true', () => {
    renderWithProviders(<ProductCard product={mockProduct} showVendorInfo={true} />);
    
    expect(screen.getByText('Test Vendor')).toBeInTheDocument();
  });

  test('should hide vendor info when showVendorInfo is false', () => {
    renderWithProviders(<ProductCard product={mockProduct} showVendorInfo={false} />);
    
    expect(screen.queryByText('Test Vendor')).not.toBeInTheDocument();
  });

  test('should display product image with correct alt text', () => {
    const productWithImage = {
      ...mockProduct,
      image: '/path/to/image.jpg'
    };

    renderWithProviders(<ProductCard product={productWithImage} />);
    
    const image = screen.getByRole('img', { name: /test product/i });
    expect(image).toHaveAttribute('alt', 'Test Product');
  });

  test('should handle image error gracefully', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);
    
    const image = screen.getByRole('img');
    fireEvent.error(image);
    
    expect(screen.getByTestId('image-fallback')).toBeInTheDocument();
  });

  test('should show correct status badge', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});