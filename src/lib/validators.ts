const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');

  if (digits.length < MIN_PHONE_DIGITS || digits.length > MAX_PHONE_DIGITS) {
    return false;
  }

  // E.164 international format (country code, no leading zero)
  if (/^[1-9]/.test(digits)) {
    return true;
  }

  // National format with trunk prefix (e.g. UK 020…, AU 02…)
  return /^0[1-9]/.test(digits);
}
