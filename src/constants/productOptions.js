// Central source of truth for product pattern options.
// Unlike Material, there's no backend entity for patterns yet — so this stays
// a hardcoded list. But it's the ONLY place it's hardcoded now: Add Product,
// Edit Product, Filters, and Bulk Upload all import PATTERNS from here.
//
// To add or remove a pattern in the future: edit RAW_PATTERNS below. You
// don't need to worry about alphabetical placement — PATTERNS is always
// re-sorted at import time, so insertion order here never matters.

const RAW_PATTERNS = [
  'Solid',
  'Plain',
  'None',
  'Striped',
  'Floral',
  'Geometric',
  'Polka Dot',
  'Abstract',
  'Paisley',
  'Plaid',
];

export const PATTERNS = [...RAW_PATTERNS].sort((a, b) => a.localeCompare(b));
