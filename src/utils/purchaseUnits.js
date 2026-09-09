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

// Whether an item currently has a real, displayable purchase unit — either
// a CURRENT vendor-configurable offering (offeringId + a matching label and
// count — see Product.sellingUnitOfferings), or a LEGACY fixed-enum unit
// (purchaseUnitType set to something other than "yard", AND a matching
// count). Both conditions must hold in whichever form is present; a
// mismatched pair (e.g. a label left over with no count) is treated as a
// plain yard item everywhere, matching formatPurchaseQuantity's own
// fallback rule. Shared by stepPurchaseUnit below and by the cart pages'
// display logic, so the definition of "has a unit" only lives in one place.
export const hasActivePurchaseUnit = (item) => {
  if (item?.offeringId && item?.purchaseUnitLabel && item?.purchaseUnitCount) {
    return true;
  }
  return Boolean(item?.purchaseUnitType && item.purchaseUnitType !== 'yard' && item?.purchaseUnitCount);
};

// Decides what a single tap of the cart's +/- stepper should actually
// change, given the item's current state. Returns a plain description of
// the intended change — callers translate this into the actual server
// request and local display update; this function makes no network calls
// and touches no component state, so it's fully unit-testable on its own.
//
// A "unit" item steps its unit count — returning offeringId for a current
// vendor-configurable offering, or unitType for a legacy fixed-enum item
// (the backend no longer understands unitType at all, so this branch is
// effectively vestigial for any item created after vendor-configurable
// units shipped, but harmless to keep for display/step-shape consistency
// on any pre-existing legacy item). Anything else — no unit info, an
// explicit "yard" type, or a unit with no matching count — steps the raw
// yard quantity, unchanged from today's behavior.
export const stepPurchaseUnit = (item, direction) => {
  if (hasActivePurchaseUnit(item)) {
    const nextCount = Math.max(1, (item.purchaseUnitCount || 1) + direction);
    if (item.offeringId) {
      return {
        mode: 'unit',
        offeringId: item.offeringId,
        unitCount: nextCount,
      };
    }
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

// Decides what fields should actually be sent to the addToCart API for a
// given add-to-cart request. This exists specifically because the object
// ProductCard/ProductDetailPage build for addToCart() spreads ...product
// first (to carry name/vendorId/image/etc.) — which means it also carries
// the PRODUCT'S OWN stock `quantity` field, completely unrelated to what
// the shopper actually selected. If offeringId is present, that leaked
// stock quantity must be ignored entirely — the backend recomputes the
// real yard quantity from the offering itself, and must never receive a
// stray `quantity` claiming to be the shopper's intended purchase amount.
export const resolveAddToCartPayload = (data) => {
  if (data?.offeringId) {
    return { offeringId: data.offeringId, unitCount: data.unitCount || 1 };
  }
  return { quantity: data?.quantity || 1 };
};

// Decides what price-per-unit to actually show for a cart/checkout line —
// "₦20,000 per Pack" for an offering-based item, "₦8,000 per yard" for a
// plain Yard item, instead of always dividing back down to a per-yard
// number that means nothing to a shopper who thinks in packs. Legacy
// fixed-enum items (old v1 Pack/Bundle) are handled too, for symmetry with
// hasActivePurchaseUnit/stepPurchaseUnit, even though no current add-to-cart
// path can produce one anymore.
export const getPricePerUnitDisplay = (item) => {
  if (item?.offeringId && item?.purchaseUnitLabel && item?.purchaseUnitCount) {
    return { amount: item.purchaseUnitPricePerUnit || 0, unitLabel: item.purchaseUnitLabel };
  }
  if (item?.purchaseUnitType && item.purchaseUnitType !== 'yard' && item?.purchaseUnitCount) {
    const size = PURCHASE_UNIT_YARDS[item.purchaseUnitType] || 1;
    const label = PURCHASE_UNIT_LABELS[item.purchaseUnitType]?.singular || 'unit';
    return { amount: (item.pricePerYard || 0) * size, unitLabel: label };
  }
  return { amount: item?.pricePerYard || 0, unitLabel: 'yard' };
};

// Formats a cart/order item for display. Falls back to a plain yard count
// whenever purchaseUnitType/purchaseUnitCount aren't set (legacy items,
// items whose quantity was manually adjusted via the cart's +/- stepper, or
// merges that mixed unit types — see cartController.ts for when these get
// cleared).
export const formatPurchaseQuantity = (item) => {
  const quantity = item?.quantity || 0;

  // Current vendor-configurable offering — checked first, since this is
  // the live system; falls through to the legacy fixed-enum path below for
  // any item that predates it.
  if (item?.offeringId && item?.purchaseUnitLabel && item?.purchaseUnitCount) {
    const count = item.purchaseUnitCount;
    const unitWord = count === 1 ? item.purchaseUnitLabel : `${item.purchaseUnitLabel}s`;
    return `${count} ${unitWord} (${quantity} yards)`;
  }

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
