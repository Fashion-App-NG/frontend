// ✅ ADD: Unit tests for complex status derivation logic

import { getProductStatus } from '../../pages/VendorProductListPage';

describe('getProductStatus', () => {
  test('should return true for ACTIVE status', () => {
    expect(getProductStatus({ status: 'ACTIVE' })).toBe(true);
  });

  test('should return true for active status', () => {
    expect(getProductStatus({ status: 'active' })).toBe(true);
  });

  test('should return true for boolean true status', () => {
    expect(getProductStatus({ status: true })).toBe(true);
  });

  test('should return true for available status', () => {
    expect(getProductStatus({ status: 'available' })).toBe(true);
  });

  test('should return false for INACTIVE status', () => {
    expect(getProductStatus({ status: 'INACTIVE' })).toBe(false);
  });

  test('should return false for inactive status', () => {
    expect(getProductStatus({ status: 'inactive' })).toBe(false);
  });

  test('should return false for boolean false status', () => {
    expect(getProductStatus({ status: false })).toBe(false);
  });

  test('should return false for unavailable status', () => {
    expect(getProductStatus({ status: 'unavailable' })).toBe(false);
  });

  test('should handle display field combinations', () => {
    expect(getProductStatus({ display: true })).toBe(true);
    expect(getProductStatus({ display: false })).toBe(false);
    expect(getProductStatus({ display: 'true' })).toBe(true);
  });

  test('should handle complex field combinations', () => {
    // ✅ COMPREHENSIVE: Cover all precedence scenarios in one test
    expect(getProductStatus({ 
      status: 'INACTIVE', 
      display: true 
    })).toBe(false); // status takes precedence
    
    expect(getProductStatus({ 
      status: 'ACTIVE', 
      display: false 
    })).toBe(true); // status takes precedence

    expect(getProductStatus({ 
      status: 'inactive', 
      display: true 
    })).toBe(false); // lowercase inactive

    expect(getProductStatus({ 
      status: false, 
      display: true 
    })).toBe(false); // boolean false status

    expect(getProductStatus({ 
      display: true 
    })).toBe(true); // fallback to display when no status
  });

  test('should handle complex priority scenarios', () => {
    // INACTIVE status should always win
    expect(getProductStatus({ 
      status: 'INACTIVE', 
      display: true, 
      active: true, 
      available: true 
    })).toBe(false);
    
    // ACTIVE status should win over display when both present
    expect(getProductStatus({ 
      status: 'ACTIVE', 
      display: false 
    })).toBe(true);
    
    // display should only be used as fallback
    expect(getProductStatus({ 
      display: true 
    })).toBe(true);
  });
});