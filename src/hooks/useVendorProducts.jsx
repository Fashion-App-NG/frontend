import { useCallback, useState } from 'react';

export const useVendorProducts = () => {
  const [products, setProducts] = useState([]);

  const loadProducts = useCallback(async () => {
    // Mock implementation
    setProducts([
      { id: '1', name: 'Product A', pricePerYard: 100, quantity: 10, status: 'ACTIVE' },
      { id: '2', name: 'Product B', pricePerYard: 200, quantity: 5, status: 'INACTIVE' }
    ]);
  }, []);

  const updateProduct = useCallback(async (product) => {
    // Mock implementation
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, ...product } : p));
  }, []);

  return {
    products,
    loadProducts,
    updateProduct
  };
};

export default useVendorProducts;