import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/** Exact E.164 values people commonly type as placeholders / jokes. */
const FAKE_E164 = new Set([
  '+10000000000',
  '+11111111111',
  '+12222222222',
  '+13333333333',
  '+14444444444',
  '+15555555555',
  '+16666666666',
  '+17777777777',
  '+18888888888',
  '+19999999999',
  '+11234567890',
  '+12345678900',
  '+12345678901',
  '+15551234567',
  '+15555551212',
  '+12125551212',
  '+18005550199',
  '+18885551212',
]);

/** National-number patterns (no country code) that are almost never real leads. */
const FAKE_NATIONAL_EXACT = new Set([
  '0000000000',
  '1111111111',
  '2222222222',
  '3333333333',
  '4444444444',
  '5555555555',
  '6666666666',
  '7777777777',
  '8888888888',
  '9999999999',
  '1234567890',
  '0123456789',
  '9876543210',
  '1231231234',
  '3213213213',
  '000000000',
  '123456789',
  '12345678',
  '1234567',
]);

function isRepeatingDigit(value: string): boolean {
  return value.length >= 7 && /^(\d)\1+$/.test(value);
}

function isMostlySequential(value: string): boolean {
  if (value.length < 8) return false;
  const ascending = '01234567890123456789';
  const descending = '98765432109876543210';
  return ascending.includes(value) || descending.includes(value);
}

/**
 * Catches reserved / fictional ranges:
 * - US/CA 555 exchange (movies, ads, forms)
 * - UK Ofcom drama numbers 07700 900 xxx
 * - AU fictional 0491 570 xxx
 */
function isReservedFictionalRange(country: string | undefined, national: string): boolean {
  if ((country === 'US' || country === 'CA') && national.length === 10) {
    const area = national.slice(0, 3);
    const exchange = national.slice(3, 6);
    if (area === '555' || exchange === '555') return true;
  }

  if (country === 'GB' && /^7700900/.test(national)) return true;
  if (country === 'AU' && /^491570/.test(national)) return true;

  return false;
}

export function isFakePhoneNumber(value: string): boolean {
  const parsed = parsePhoneNumberFromString(value.trim());
  if (!parsed) return false;

  const e164 = parsed.number;
  const national = parsed.nationalNumber;

  if (FAKE_E164.has(e164) || FAKE_NATIONAL_EXACT.has(national)) return true;
  if (isRepeatingDigit(national) || isMostlySequential(national)) return true;
  if (isReservedFictionalRange(parsed.country, national)) return true;

  return false;
}

export function getPhoneValidationError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Please enter your phone number.';
  }

  if (!trimmed.startsWith('+')) {
    return 'Select a country code and enter your number.';
  }

  if (!isValidPhoneNumber(trimmed)) {
    return 'Enter a valid phone number for the selected country.';
  }

  if (isFakePhoneNumber(trimmed)) {
    return 'Please enter a real phone number — test numbers are not accepted.';
  }

  return null;
}

export function isValidPhone(value: string): boolean {
  return getPhoneValidationError(value) === null;
}
