import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { getProductImage, getProductStatus } from '../../pages/VendorProductListPage';

// Mock the ProductListItem since it's defined in VendorProductListPage
const ProductListItem = ({ product, onEdit }) => {
  const [imageError, setImageError] = React.useState(false);
  const productImage = getProductImage(product);
  const isActive = getProductStatus(product);

  const handleImageError = () => setImageError(true);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow" data-testid="product-list-item">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden" data-testid="image-container">
          {!imageError && productImage ? (
            <img 
              src={productImage}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" data-testid="image-fallback">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0" data-testid="product-content">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
            <span>₦{(product.pricePerYard || product.price)?.toLocaleString()}</span>
            <span>•</span>
            <span>{product.quantity} yards</span>
            {product.materialType && (
              <>
                <span>•</span>
                <span>{product.materialType}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
          
          <button 
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            onClick={() => onEdit(product)}
            aria-label={`edit ${product.name}`}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

describe('ProductListItem', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    pricePerYard: 150,
    quantity: 20,
    material: 'Cotton',
    imageUrl: '/test-image.jpg'
  };

  describe('List Layout Behavior', () => {
    test('should render product information horizontally', () => {
      render(<ProductListItem product={mockProduct} />);
      
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('₦150')).toBeInTheDocument();
      expect(screen.getByText('20 yards')).toBeInTheDocument();
      expect(screen.getByText('Cotton')).toBeInTheDocument();
    });

    test('should show compact image thumbnail', () => {
      render(<ProductListItem product={mockProduct} />);
      
      const image = screen.getByRole('img');
      // ✅ Use data-testid instead of parentElement access
      const imageContainer = screen.getByTestId('image-container');
      
      expect(imageContainer).toHaveClass('w-16', 'h-16');
      expect(image).toHaveClass('w-full', 'h-full', 'object-cover');
    });

    test('should handle image error gracefully', () => {
      render(<ProductListItem product={mockProduct} />);
      
      const image = screen.getByRole('img');
      fireEvent.error(image);
      
      expect(screen.getByTestId('image-fallback')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    test('should display horizontal layout structure', () => {
      render(<ProductListItem product={mockProduct} />);
      
      // ✅ Test the layout container directly
      const listItem = screen.getByTestId('product-list-item');
      expect(listItem).toHaveClass('flex', 'flex-row', 'items-center');
      
      // ✅ Test content area
      const contentArea = screen.getByTestId('product-content');
      expect(contentArea).toHaveClass('flex-1', 'ml-4');
    });

    test('should show product actions in list view', () => {
      const mockOnEdit = jest.fn();
      const mockOnDelete = jest.fn();
      
      render(
        <ProductListItem 
          product={mockProduct} 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );
      
      // ✅ Use accessible selectors for actions
      const editButton = screen.getByRole('button', { name: /edit test product/i });
      const deleteButton = screen.getByRole('button', { name: /delete test product/i });
      
      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
      
      fireEvent.click(editButton);
      expect(mockOnEdit).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('Responsive Behavior', () => {
    test('should adapt to mobile layout', () => {
      // ✅ Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<ProductListItem product={mockProduct} />);
      
      const listItem = screen.getByTestId('product-list-item');
      expect(listItem).toHaveClass('flex-col', 'sm:flex-row');
    });
  });
});