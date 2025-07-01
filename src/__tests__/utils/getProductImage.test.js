import { getProductImage } from '../../pages/VendorProductListPage';

// Mock environment variable
const originalEnv = process.env;
beforeEach(() => {
  process.env = {
    ...originalEnv,
    REACT_APP_API_BASE_URL: 'http://localhost:3002'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('getProductImage', () => {
  test('should handle image object with url property', () => {
    const product = {
      image: { url: 'http://example.com/image.jpg' }
    };
    expect(getProductImage(product)).toBe('http://example.com/image.jpg');
  });

  test('should handle images array with string URLs', () => {
    const product = {
      images: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg']
    };
    expect(getProductImage(product)).toBe('http://example.com/image1.jpg');
  });

  test('should handle images array with base64 strings', () => {
    const product = {
      images: ['data:image/jpeg;base64,/9j/4AAQSkZJRgABA...']
    };
    expect(getProductImage(product)).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRgABA...');
  });

  test('should handle images array with relative paths', () => {
    const product = {
      images: ['relative-image.jpg']
    };
    expect(getProductImage(product)).toBe('http://localhost:3002/uploads/relative-image.jpg');
  });

  test('should handle images array with object format', () => {
    const product = {
      images: [{ url: 'http://example.com/object-image.jpg' }]
    };
    expect(getProductImage(product)).toBe('http://example.com/object-image.jpg');
  });

  test('should handle imageUrls array with strings', () => {
    const product = {
      imageUrls: ['http://example.com/url-image.jpg']
    };
    expect(getProductImage(product)).toBe('http://example.com/url-image.jpg');
  });

  test('should handle imageUrls array with relative paths', () => {
    const product = {
      imageUrls: ['relative-url-image.jpg']
    };
    expect(getProductImage(product)).toBe('http://localhost:3002/uploads/relative-url-image.jpg');
  });

  test('should handle single imageUrl property', () => {
    const product = {
      imageUrl: 'http://example.com/single-image.jpg'
    };
    expect(getProductImage(product)).toBe('http://example.com/single-image.jpg');
  });

  test('should return null for product with no images', () => {
    const product = { name: 'Test Product' };
    expect(getProductImage(product)).toBeNull();
  });

  test('should return null for empty images array', () => {
    const product = { images: [] };
    expect(getProductImage(product)).toBeNull();
  });

  test('should prioritize image object over images array', () => {
    const product = {
      image: { url: 'http://example.com/priority-image.jpg' },
      images: ['http://example.com/array-image.jpg']
    };
    expect(getProductImage(product)).toBe('http://example.com/priority-image.jpg');
  });

  test('should handle malformed image objects gracefully', () => {
    const product = {
      images: [{ malformed: 'object' }, 'http://example.com/backup.jpg']
    };
    expect(getProductImage(product)).toBeNull();
  });
});