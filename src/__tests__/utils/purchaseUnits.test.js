import {
  stepPurchaseUnit,
  hasActivePurchaseUnit,
  getAvailableSellingUnits,
  maxUnitsForYardsPerUnit,
  resolveAddToCartPayload,
  formatPurchaseQuantity,
  getPricePerUnitDisplay,
} from '../../utils/purchaseUnits';

// resolveAddToCartPayload(data) decides what actually gets sent to the
// addToCart API. This is the fix for the "2 Packs of 3 yards added 10
// yards instead of 6" bug: ProductDetailPage/ProductCard build the
// addToCart() argument as { ...product, offeringId, unitCount }, and that
// spread of ...product carries the PRODUCT'S OWN stock \`quantity\` field
// (e.g. 10 yards in stock) — completely unrelated to what the shopper
// selected. cartService.js's addItem() currently sends that leaked stock
// quantity to the backend, and — separately — never sends offeringId at
// all (it still only checks the old \`unitType\` field, which no longer
// exists anywhere in the rewritten components). Together, those two gaps
// mean the backend falls back to its legacy plain-quantity path and uses
// the leaked stock number as the cart quantity. This function is the fix:
// centralize the payload-building rule in one place, so a leaked stock
// \`quantity\` alongside a real \`offeringId\` is always ignored.
describe('hasActivePurchaseUnit — offering-based items (vendor-configurable units)', () => {
  it('is true for an offering-based item (offeringId + label + count, no legacy purchaseUnitType)', () => {
    const item = {
      offeringId: 'off1',
      purchaseUnitLabel: 'Pack',
      purchaseUnitYardsPerUnit: 3,
      purchaseUnitCount: 1,
      purchaseUnitType: undefined,
    };
    expect(hasActivePurchaseUnit(item)).toBe(true);
  });
});

describe('formatPurchaseQuantity — offering-based items', () => {
  it('formats an offering-based item as "N Label (X yards)", not a plain yard count', () => {
    const item = {
      quantity: 3,
      offeringId: 'off1',
      purchaseUnitLabel: 'Pack',
      purchaseUnitYardsPerUnit: 3,
      purchaseUnitCount: 1,
    };
    expect(formatPurchaseQuantity(item)).toBe('1 Pack (3 yards)');
  });

  it('pluralizes the label when count > 1', () => {
    const item = {
      quantity: 6,
      offeringId: 'off1',
      purchaseUnitLabel: 'Pack',
      purchaseUnitYardsPerUnit: 3,
      purchaseUnitCount: 2,
    };
    expect(formatPurchaseQuantity(item)).toBe('2 Packs (6 yards)');
  });
});

describe('stepPurchaseUnit — offering-based items', () => {
  it('steps the unit count and returns offeringId (not unitType) for an offering-based item', () => {
    const item = {
      quantity: 3,
      offeringId: 'off1',
      purchaseUnitLabel: 'Pack',
      purchaseUnitYardsPerUnit: 3,
      purchaseUnitCount: 1,
    };
    expect(stepPurchaseUnit(item, +1)).toEqual({
      mode: 'unit',
      offeringId: 'off1',
      unitCount: 2,
    });
  });
});

describe('getPricePerUnitDisplay', () => {
  it('returns the offering price and label for an offering-based item, not the per-yard breakdown', () => {
    const item = {
      pricePerYard: 6666.667, // derived internal number — should never surface
      offeringId: 'off1',
      purchaseUnitLabel: 'Pack',
      purchaseUnitYardsPerUnit: 3,
      purchaseUnitPricePerUnit: 20000,
      purchaseUnitCount: 2,
    };
    expect(getPricePerUnitDisplay(item)).toEqual({ amount: 20000, unitLabel: 'Pack' });
  });

  it('returns pricePerYard and "yard" for a plain Yard item', () => {
    const item = { pricePerYard: 8000, quantity: 3 };
    expect(getPricePerUnitDisplay(item)).toEqual({ amount: 8000, unitLabel: 'yard' });
  });

  it('derives the correct amount for a legacy fixed-enum item', () => {
    const item = { pricePerYard: 8000, purchaseUnitType: 'pack', purchaseUnitCount: 1 };
    expect(getPricePerUnitDisplay(item)).toEqual({ amount: 40000, unitLabel: 'Pack' });
  });
});

describe('resolveAddToCartPayload', () => {
  it('sends offeringId + unitCount when an offering is selected, and IGNORES any leaked quantity field', () => {
    const data = { offeringId: 'off1', unitCount: 2, quantity: 10 }; // quantity=10 simulates the leaked product.quantity (stock)
    expect(resolveAddToCartPayload(data)).toEqual({
      offeringId: 'off1',
      unitCount: 2,
    });
  });

  it('defaults unitCount to 1 when an offering is selected but unitCount is missing', () => {
    const data = { offeringId: 'off1', quantity: 10 };
    expect(resolveAddToCartPayload(data)).toEqual({
      offeringId: 'off1',
      unitCount: 1,
    });
  });

  it('sends a plain quantity when there is no offeringId (a Yard purchase)', () => {
    const data = { quantity: 3 };
    expect(resolveAddToCartPayload(data)).toEqual({ quantity: 3 });
  });

  it('defaults quantity to 1 when neither offeringId nor quantity is present', () => {
    expect(resolveAddToCartPayload({})).toEqual({ quantity: 1 });
  });

  it('never includes both offeringId and quantity together, even if both are present in the input', () => {
    const data = { offeringId: 'off1', unitCount: 5, quantity: 999 };
    const result = resolveAddToCartPayload(data);
    expect(result).not.toHaveProperty('quantity');
    expect(result.offeringId).toBe('off1');
  });
});

describe('getAvailableSellingUnits', () => {
  it("always includes Yard first, using the product's pricePerYard", () => {
    const product = { pricePerYard: 8000, sellingUnitOfferings: [] };
    expect(getAvailableSellingUnits(product)).toEqual([
      { offeringId: null, label: 'Yard', yardsPerUnit: 1, pricePerUnit: 8000 },
    ]);
  });

  it('includes active offerings after Yard', () => {
    const product = {
      pricePerYard: 8000,
      sellingUnitOfferings: [
        { _id: 'off1', label: 'Pack', yardsPerUnit: 5, pricePerUnit: 36000, status: 'active' },
      ],
    };
    expect(getAvailableSellingUnits(product)).toEqual([
      { offeringId: null, label: 'Yard', yardsPerUnit: 1, pricePerUnit: 8000 },
      { offeringId: 'off1', label: 'Pack', yardsPerUnit: 5, pricePerUnit: 36000 },
    ]);
  });

  it('excludes inactive offerings entirely', () => {
    const product = {
      pricePerYard: 8000,
      sellingUnitOfferings: [
        { _id: 'off1', label: 'Pack', yardsPerUnit: 5, pricePerUnit: 36000, status: 'inactive' },
      ],
    };
    expect(getAvailableSellingUnits(product)).toEqual([
      { offeringId: null, label: 'Yard', yardsPerUnit: 1, pricePerUnit: 8000 },
    ]);
  });

  it('handles a product with no sellingUnitOfferings field at all', () => {
    const product = { pricePerYard: 300 };
    expect(getAvailableSellingUnits(product)).toEqual([
      { offeringId: null, label: 'Yard', yardsPerUnit: 1, pricePerUnit: 300 },
    ]);
  });
});

describe('maxUnitsForYardsPerUnit', () => {
  it('divides available yards by the unit size, rounding down', () => {
    expect(maxUnitsForYardsPerUnit(22, 5)).toBe(4);
  });

  it('handles a fractional yardsPerUnit (e.g. a 2.5-yard Pack)', () => {
    expect(maxUnitsForYardsPerUnit(22, 2.5)).toBe(8);
  });

  it('treats a missing yardsPerUnit as 1 (plain yards)', () => {
    expect(maxUnitsForYardsPerUnit(22, undefined)).toBe(22);
  });

  it('treats missing available yards as 0', () => {
    expect(maxUnitsForYardsPerUnit(undefined, 5)).toBe(0);
  });
});

describe('hasActivePurchaseUnit', () => {
  it('is true for a complete non-yard unit', () => {
    expect(hasActivePurchaseUnit({ purchaseUnitType: 'pack', purchaseUnitCount: 2 })).toBe(true);
  });

  it('is false for an explicit "yard" type', () => {
    expect(hasActivePurchaseUnit({ purchaseUnitType: 'yard', purchaseUnitCount: 3 })).toBe(false);
  });

  it('is false when the count is missing', () => {
    expect(hasActivePurchaseUnit({ purchaseUnitType: 'pack', purchaseUnitCount: undefined })).toBe(false);
  });

  it('is false when there is no unit type at all', () => {
    expect(hasActivePurchaseUnit({ quantity: 5 })).toBe(false);
  });
});

// stepPurchaseUnit(item, direction) decides what a single tap of the cart's
// +/- button should actually change. This is the fix for the live bug: the
// stepper was incrementing item.quantity (raw yards) directly, completely
// ignoring purchaseUnitType/purchaseUnitCount, so a cart line labeled
// "1 Pack (5 yards)" would silently become "6 yards" (no longer describable
// as a whole number of packs at all) on the very first tap.
describe('stepPurchaseUnit', () => {
  it('steps the unit count up for a Pack item, not the yard quantity', () => {
    const item = { quantity: 5, purchaseUnitType: 'pack', purchaseUnitCount: 1 };
    expect(stepPurchaseUnit(item, +1)).toEqual({
      mode: 'unit',
      unitType: 'pack',
      unitCount: 2,
    });
  });

  it('steps the unit count down for a Bundle item, not the yard quantity', () => {
    const item = { quantity: 30, purchaseUnitType: 'bundle', purchaseUnitCount: 3 };
    expect(stepPurchaseUnit(item, -1)).toEqual({
      mode: 'unit',
      unitType: 'bundle',
      unitCount: 2,
    });
  });

  it('never steps a unit count below 1', () => {
    const item = { quantity: 5, purchaseUnitType: 'pack', purchaseUnitCount: 1 };
    expect(stepPurchaseUnit(item, -1)).toEqual({
      mode: 'unit',
      unitType: 'pack',
      unitCount: 1,
    });
  });

  it('steps the raw yard quantity for a plain yard item', () => {
    const item = { quantity: 3, purchaseUnitType: undefined, purchaseUnitCount: undefined };
    expect(stepPurchaseUnit(item, +1)).toEqual({
      mode: 'yard',
      quantity: 4,
    });
  });

  it('treats an explicit "yard" unit type the same as no unit at all', () => {
    const item = { quantity: 3, purchaseUnitType: 'yard', purchaseUnitCount: 3 };
    expect(stepPurchaseUnit(item, +1)).toEqual({
      mode: 'yard',
      quantity: 4,
    });
  });

  it('never steps a plain yard quantity below 1', () => {
    const item = { quantity: 1 };
    expect(stepPurchaseUnit(item, -1)).toEqual({
      mode: 'yard',
      quantity: 1,
    });
  });

  it('treats a mismatched item (unitType set but purchaseUnitCount missing) as plain yards, matching formatPurchaseQuantity\'s own fallback rule', () => {
    const item = { quantity: 7, purchaseUnitType: 'pack', purchaseUnitCount: undefined };
    expect(stepPurchaseUnit(item, +1)).toEqual({
      mode: 'yard',
      quantity: 8,
    });
  });
});
