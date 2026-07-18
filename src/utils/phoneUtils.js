/**
 * Nigerian phone number validation and normalization utilities (frontend).
 *
 * Mirrors src/utils/phoneUtils.ts on the backend exactly, so client-side
 * validation never disagrees with what the server will accept. Canonical
 * format: "234XXXXXXXXXX" (13 digits, no leading "+"), matching what the
 * backend's registerUser expects as `identifier`.
 */

const NIGERIA_COUNTRY_CODE = '234';

// Same pragmatic check as the backend: Nigerian mobile numbers start with
// 7, 8, or 9, followed by 0 or 1 - catches obviously malformed input
// without maintaining an exhaustive, ever-changing prefix whitelist.
const NIGERIA_LOCAL_NUMBER_REGEX = /^[789][01]\d{8}$/;

/**
 * Normalizes a Nigerian phone number, in any common input format, to the
 * canonical "234XXXXXXXXXX" format. Returns null if it cannot be normalized
 * into a valid Nigerian mobile number.
 *
 * Accepts: "08012345678", "8012345678", "2348012345678", "+2348012345678",
 * and any of those with spaces/dashes/parens.
 */
export function normalizeNigerianPhone(input) {
  if (!input) {
    return null;
  }

  const digitsOnly = input.replace(/\D/g, '');

  let localNumber;

  if (digitsOnly.startsWith(NIGERIA_COUNTRY_CODE) && digitsOnly.length === 13) {
    localNumber = digitsOnly.slice(3);
  } else if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
    localNumber = digitsOnly.slice(1);
  } else if (digitsOnly.length === 10) {
    localNumber = digitsOnly;
  } else {
    return null;
  }

  if (!NIGERIA_LOCAL_NUMBER_REGEX.test(localNumber)) {
    return null;
  }

  return `${NIGERIA_COUNTRY_CODE}${localNumber}`;
}

/**
 * Returns true if the input is a valid Nigerian mobile number in any
 * accepted input format. Thin wrapper - use normalizeNigerianPhone()
 * directly when you also need the normalized value.
 */
export function isValidNigerianPhone(input) {
  return normalizeNigerianPhone(input) !== null;
}

/**
 * Formats a canonical "234XXXXXXXXXX" number back to a human-readable local
 * display format, e.g. "0801 234 5678". For UI display only.
 */
export function formatNigerianPhoneForDisplay(canonicalPhone) {
  if (!canonicalPhone || !canonicalPhone.startsWith(NIGERIA_COUNTRY_CODE) || canonicalPhone.length !== 13) {
    return canonicalPhone;
  }

  const local = '0' + canonicalPhone.slice(3);
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}
