// Shared pack/bundle purchase-unit helpers.
//
// IMPORTANT: this is a display/UI-input concept only. The actual quantity
// stored and calculated everywhere downstream (cart, reservation, platform
// fees, tax, shipping weight, vendor stock) is always plain yards — these
// helpers exist only to convert a shopper's unit selection into a yard count
// before it's sent to the server, and to format a stored item back into a
// human-readable "2 Packs (10 yards)" label wherever it's displayed.

export const PURCHASE_UNIT_YARDS = {
  yard: 1,
  pack: 5,
  bundle: 10,
};

export const PURCHASE_UNIT_LABELS = {
  yard: { singular: 'Yard', plural: 'Yards' },
  pack: { singular: 'Pack', plural: 'Packs' },
  bundle: { singular: 'Bundle', plural: 'Bundles' },
};

// How many of a given unit are available for a product with `availableYards`
// in stock. Used to hide/disable Pack or Bundle options when there isn't
// enough stock for even one.
export const maxUnitsAvailable = (availableYards, unitType) => {
  const size = PURCHASE_UNIT_YARDS[unitType] || 1;
  return Math.floor((availableYards || 0) / size);
};

// Converts a unit selection into the actual yard quantity to purchase.
export const unitsToYards = (unitType, unitCount) => {
  const size = PURCHASE_UNIT_YARDS[unitType] || 1;
  return (unitCount || 1) * size;
};

// Whether an item currently has a real, displayable purchase unit — i.e. a
// non-"yard" type AND a matching count. Both conditions must hold; a
// mismatched pair (e.g. a unit type left over with no count, from an old
// merge that cleared one but not the other) is treated as a plain yard item
// everywhere, matching formatPurchaseQuantity's own existing fallback rule.
// Shared by stepPurchaseUnit below and by the cart pages' display logic, so
// the definition of "has a unit" only lives in one place.
export const hasActivePurchaseUnit = (item) =>
  Boolean(item?.purchaseUnitType && item.purchaseUnitType !== 'yard' && item?.purchaseUnitCount);

// Decides what a single tap of the cart's +/- stepper should actually
// change, given the item's current state. Returns a plain description of
// the intended change — callers translate this into the actual server
// request and local display update; this function makes no network calls
// and touches no component state, so it's fully unit-testable on its own.
//
// A "unit" item steps its unit count. Anything else — no unit type, an
// explicit "yard" type, or a unit type with no matching count — steps the
// raw yard quantity, unchanged from today's behavior.
export const stepPurchaseUnit = (item, direction) => {
  if (hasActivePurchaseUnit(item)) {
    const nextCount = Math.max(1, (item.purchaseUnitCount || 1) + direction);
    return {
      mode: 'unit',
      unitType: item.purchaseUnitType,
      unitCount: nextCount,
    };
  }

  const nextQuantity = Math.max(1, (item?.quantity || 1) + direction);
  return {
    mode: 'yard',
    quantity: nextQuantity,
  };
};

// Returns the list of units a shopper can currently buy this product in:
// Yard (always first, always available, using the product's own
// pricePerYard) followed by any of the vendor's ACTIVE custom offerings
// (Pack, Bundle, Roll, etc. — see Product.sellingUnitOfferings). Inactive
// offerings are never included — a deactivated unit simply disappears from
// what a shopper can select, by design.
export const getAvailableSellingUnits = (product) => {
  const activeOfferings = (product?.sellingUnitOfferings || []).filter(
    (o) => o.status === 'active'
  );

  return [
    {
      offeringId: null,
      label: 'Yard',
      yardsPerUnit: 1,
      pricePerUnit: product?.pricePerYard || 0,
    },
    ...activeOfferings.map((o) => ({
      offeringId: o._id,
      label: o.label,
      yardsPerUnit: o.yardsPerUnit,
      pricePerUnit: o.pricePerUnit,
    })),
  ];
};

// How many of a given unit (identified by its yardsPerUnit, not a fixed
// enum) are available for a product with `availableYards` in stock. This
// is the offering-based generalization of maxUnitsAvailable above — that
// one stays as-is for any code still working with the legacy fixed
// yard/pack/bundle enum; this one works for any yardsPerUnit, vendor-
// defined or not.
export const maxUnitsForYardsPerUnit = (availableYards, yardsPerUnit) => {
  const size = yardsPerUnit || 1;
  return Math.floor((availableYards || 0) / size);
};

// Formats a cart/order item for display. Falls back to a plain yard count
// whenever purchaseUnitType/purchaseUnitCount aren't set (legacy items,
// items whose quantity was manually adjusted via the cart's +/- stepper, or
// merges that mixed unit types — see cartController.ts for when these get
// cleared).
export const formatPurchaseQuantity = (item) => {
  const quantity = item?.quantity || 0;

  if (!item?.purchaseUnitType || !item?.purchaseUnitCount) {
    return `${quantity} yard${quantity === 1 ? '' : 's'}`;
  }

  const label = PURCHASE_UNIT_LABELS[item.purchaseUnitType];
  if (!label) {
    return `${quantity} yard${quantity === 1 ? '' : 's'}`;
  }

  const count = item.purchaseUnitCount;
  const unitWord = count === 1 ? label.singular : label.plural;

  // Yard purchases don't need the "(N yards)" clarification since the unit
  // word already says "yards".
  if (item.purchaseUnitType === 'yard') {
    return `${count} ${unitWord}`;
  }

  return `${count} ${unitWord} (${quantity} yards)`;
};
