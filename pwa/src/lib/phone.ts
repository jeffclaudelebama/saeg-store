export function normalizeGabonPhone(value: string): string | null {
  const digits = value.replace(/\D+/g, '');
  if (!digits) {
    return null;
  }

  let local = '';
  if (digits.startsWith('241') && digits.length >= 11) {
    local = digits.slice(3, 11);
  } else if (digits.startsWith('0') && digits.length >= 9) {
    local = digits.slice(1, 9);
  } else if (digits.length === 8) {
    local = digits;
  }

  if (!/^\d{8}$/.test(local)) {
    return null;
  }

  return `241${local}`;
}

export function isValidGabonPhone(value: string): boolean {
  return Boolean(normalizeGabonPhone(value));
}
