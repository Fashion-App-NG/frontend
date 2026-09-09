import { stepPurchaseUnit, hasActivePurchaseUnit } from '../../utils/purchaseUnits';

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
