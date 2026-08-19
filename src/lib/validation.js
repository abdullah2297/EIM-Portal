/**
 * Tiny shared validation helpers used by both the public forms and the
 * admin panel, so a rule is written once and enforced on both sides.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const rules = {
  required: (message = 'This field is required.') => (value) => {
    if (value === null || value === undefined) return message;
    if (Array.isArray(value)) return value.length ? null : message;
    return String(value).trim().length ? null : message;
  },
  email: (message = 'Enter a valid email address.') => (value) =>
    !value || EMAIL_RE.test(String(value).trim()) ? null : message,
  minLength: (min, message) => (value) =>
    !value || String(value).trim().length >= min
      ? null
      : message ?? `Must be at least ${min} characters.`,
  maxLength: (max, message) => (value) =>
    !value || String(value).length <= max ? null : message ?? `Must be ${max} characters or fewer.`,
  number: (message = 'Enter a valid number.') => (value) =>
    value === '' || value === null || value === undefined || !Number.isNaN(Number(value))
      ? null
      : message,
  date: (message = 'Enter a valid date.') => (value) =>
    !value || !Number.isNaN(new Date(value).getTime()) ? null : message,
  oneOf: (options, message) => (value) =>
    !value || options.includes(value) ? null : message ?? 'Select a valid option.',
};

/**
 * Runs a rule map against a values object.
 * @param {Record<string, any>} values
 * @param {Record<string, Array<(value: any, values: any) => string | null>>} schema
 * @returns {Record<string, string>} field -> first error message
 */
export function validate(values, schema) {
  /** @type {Record<string, string>} */
  const errors = {};
  Object.entries(schema).forEach(([field, fieldRules]) => {
    for (const rule of fieldRules) {
      const message = rule(values[field], values);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  });
  return errors;
}

export function isValid(errors) {
  return Object.keys(errors).length === 0;
}

/** Strips tags and trims - defensive cleanup for free-text form fields. */
export function sanitizeText(value, maxLength = 5000) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/<\/?[^>]+(>|$)/g, '').trim().slice(0, maxLength);
}
