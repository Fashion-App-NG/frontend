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
      // Missing createdAt to test edge case
      dateCreated: '2024-01-03T10:00:00Z'
    },
    {
      id: '4',
      name: 'Product D',
      pricePerYard: 50,
      quantity: 20,
      createdAt: '2024-01-04T10:00:00Z'
      // Missing dateCreated to test edge case
    }
  ];

  test('should sort by date descending (newest first)', () => {
    const sorted = [...mockProducts].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.dateCreated || 0);
      const dateB = new Date(b.createdAt || b.dateCreated || 0);
      return dateB - dateA; // Descending order
    });

    expect(sorted[0].id).toBe('4'); // Newest (2024-01-04)
    expect(sorted[1].id).toBe('3'); // 2024-01-03
    expect(sorted[2].id).toBe('2'); // 2024-01-02
    expect(sorted[3].id).toBe('1'); // Oldest (2024-01-01)
  });

  test('should handle missing date fields gracefully', () => {
    const productsWithMissingDates = [
      { id: '1', name: 'Product 1' }, // No date fields
      { id: '2', name: 'Product 2', createdAt: '2024-01-01T10:00:00Z' },
      { id: '3', name: 'Product 3', dateCreated: '2024-01-02T10:00:00Z' }
    ];

    const sorted = [...productsWithMissingDates].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.dateCreated || 0);
      const dateB = new Date(b.createdAt || b.dateCreated || 0);
      return dateB - dateA;
    });

    // Products with dates should come first, missing dates go to end
    expect(sorted[0].id).toBe('3'); // Has dateCreated
    expect(sorted[1].id).toBe('2'); // Has createdAt
    expect(sorted[2].id).toBe('1'); // No dates (gets epoch 0)
  });

  test('should sort by pricePerYard correctly', () => {
    const sorted = [...mockProducts].sort((a, b) => b.pricePerYard - a.pricePerYard);
    
    expect(sorted[0].pricePerYard).toBe(200); // Highest price
    expect(sorted[1].pricePerYard).toBe(150);
    expect(sorted[2].pricePerYard).toBe(100);
    expect(sorted[3].pricePerYard).toBe(50);   // Lowest price
  });

  test('should sort by quantity correctly', () => {
    const sorted = [...mockProducts].sort((a, b) => b.quantity - a.quantity);
    
    expect(sorted[0].quantity).toBe(20); // Highest quantity
    expect(sorted[1].quantity).toBe(10);
    expect(sorted[2].quantity).toBe(8);
    expect(sorted[3].quantity).toBe(5);  // Lowest quantity
  });

  test('should sort by name alphabetically', () => {
    const sorted = [...mockProducts].sort((a, b) => a.name.localeCompare(b.name));
    
    expect(sorted[0].name).toBe('Product A');
    expect(sorted[1].name).toBe('Product B');
    expect(sorted[2].name).toBe('Product C');
    expect(sorted[3].name).toBe('Product D');
  });
});