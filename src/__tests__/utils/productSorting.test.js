// ✅ ADD: New test file for sorting logic
describe('Product Sorting Logic', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Product A',
      pricePerYard: 100,
      quantity: 10,
      createdAt: '2024-01-01T10:00:00Z',
      dateCreated: '2024-01-01T10:00:00Z'
    },
    {
      id: '2',
      name: 'Product B',
      pricePerYard: 200,
      quantity: 5,
      createdAt: '2024-01-02T10:00:00Z',
      dateCreated: '2024-01-02T10:00:00Z'
    },
    {
      id: '3',
      name: 'Product C',
      pricePerYard: 150,
      quantity: 8,
      dateCreated: '2024-01-03T10:00:00Z'
    }
  ];

  test('should sort by date descending (newest first)', () => {
    const sorted = [...mockProducts].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.dateCreated || 0);
      const dateB = new Date(b.createdAt || b.dateCreated || 0);
      return dateB - dateA;
    });

    expect(sorted[0].id).toBe('3'); // Newest (2024-01-03)
    expect(sorted[1].id).toBe('2'); // 2024-01-02
    expect(sorted[2].id).toBe('1'); // Oldest (2024-01-01)
  });

  test('should sort by pricePerYard correctly', () => {
    const sorted = [...mockProducts].sort((a, b) => b.pricePerYard - a.pricePerYard);
    
    expect(sorted[0].pricePerYard).toBe(200); // Highest price
    expect(sorted[1].pricePerYard).toBe(150);
    expect(sorted[2].pricePerYard).toBe(100);
  });

  test('should handle missing date fields gracefully', () => {
    const productsWithMissingDates = [
      { id: '1', name: 'Product 1' }, // No date fields
      { id: '2', name: 'Product 2', createdAt: '2024-01-01T10:00:00Z' }
    ];

    const sorted = [...productsWithMissingDates].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.dateCreated || 0);
      const dateB = new Date(b.createdAt || b.dateCreated || 0);
      return dateB - dateA;
    });

    expect(sorted[0].id).toBe('2'); // Has createdAt
    expect(sorted[1].id).toBe('1'); // No dates (gets epoch 0)
  });
});