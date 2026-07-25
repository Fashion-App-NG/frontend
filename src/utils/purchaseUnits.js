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
