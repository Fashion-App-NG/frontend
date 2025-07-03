import VendorService from '../../services/vendorService';

// Mock fetch
global.fetch = jest.fn();

describe('VendorService.createProductMultipart', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Mock auth token
    VendorService.prototype.getAuthToken = jest.fn().mockReturnValue('mock-token');
  });

  describe('Single Product Scenarios', () => {
    test('should create single product successfully', async () => {
      const mockProduct = {
        name: 'Test Product',
        pricePerYard: 100,
        quantity: 10,
        materialType: 'Cotton',
        vendorId: 'vendor123',
        images: []
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          product: { id: 'product123', ...mockProduct }
        })
      });

      const service = new VendorService();
      const result = await service.createProductMultipart(mockProduct);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/product'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );

      expect(result.success).toBe(true);
      expect(result.product.id).toBe('product123');
    });

    test('should handle single product creation failure', async () => {
      const mockProduct = {
        name: 'Test Product',
        pricePerYard: 100,
        quantity: 10,
        materialType: 'Cotton',
        vendorId: 'vendor123',
        images: []
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          message: 'Validation error'
        })
      });

      const service = new VendorService();
      await expect(service.createProductMultipart(mockProduct))
        .rejects.toThrow('Validation error');
    });
  });

  describe('Bulk Product Scenarios', () => {
    test('should create multiple products successfully', async () => {
      const mockProducts = [
        {
          name: 'Product 1',
          pricePerYard: 100,
          quantity: 10,
          materialType: 'Cotton',
          vendorId: 'vendor123',
          images: []
        },
        {
          name: 'Product 2',
          pricePerYard: 200,
          quantity: 20,
          materialType: 'Silk',
          vendorId: 'vendor123',
          images: []
        }
      ];

      // Mock successful responses for both products
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            product: { id: 'product1', ...mockProducts[0] }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            product: { id: 'product2', ...mockProducts[1] }
          })
        });

      const service = new VendorService();
      const result = await service.createProductMultipart(mockProducts);

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
      expect(result.createdCount).toBe(2);
      expect(result.errorCount).toBe(0);
      expect(result.errors).toEqual([]);
    });

    test('should handle mixed success/failure in bulk upload', async () => {
      const mockProducts = [
        {
          name: 'Product 1',
          pricePerYard: 100,
          quantity: 10,
          materialType: 'Cotton',
          vendorId: 'vendor123',
          images: []
        },
        {
          name: 'Product 2',
          pricePerYard: 200,
          quantity: 20,
          materialType: 'Silk',
          vendorId: 'vendor123',
          images: []
        }
      ];

      // Mock mixed responses
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            product: { id: 'product1', ...mockProducts[0] }
          })
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () => Promise.resolve({
            message: 'Validation error for product 2'
          })
        });

      const service = new VendorService();
      const result = await service.createProductMultipart(mockProducts);

      expect(result.success).toBe(true);
      expect(result.createdCount).toBe(1);
      expect(result.errorCount).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        index: 1,
        error: 'Validation error for product 2'
      });
    });

    test('should throw error when all products fail', async () => {
      const mockProducts = [
        { name: 'Product 1', vendorId: 'vendor123' },
        { name: 'Product 2', vendorId: 'vendor123' }
      ];

      // Mock failed responses for both products
      fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ message: 'Error 1' })
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ message: 'Error 2' })
        });

      const service = new VendorService();
      await expect(service.createProductMultipart(mockProducts))
        .rejects.toThrow('All 2 products failed in multipart fallback');
    });
  });

  describe('Image Handling', () => {
    test('should handle products with File objects as images', async () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const mockProduct = {
        name: 'Product with Image',
        pricePerYard: 100,
        quantity: 10,
        materialType: 'Cotton',
        vendorId: 'vendor123',
        images: [{ file: mockFile, name: 'test.jpg' }]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          product: { id: 'product123', ...mockProduct }
        })
      });

      const service = new VendorService();
      await service.createProductMultipart(mockProduct);

      // Verify FormData was used (body should be FormData instance)
      const callArgs = fetch.mock.calls[0][1];
      expect(callArgs.body).toBeInstanceOf(FormData);
    });
  });
});