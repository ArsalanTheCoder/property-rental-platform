export const validators = {
  required(value) {
    if (value == null || String(value).trim() === '') {
      return 'This field is required.'
    }
    return null
  },

  email(value) {
    if (value == null || String(value).trim() === '') return null
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())) {
      return 'Enter a valid email address.'
    }
    return null
  },

  numeric(value) {
    if (value == null || String(value).trim() === '') return null
    if (Number.isNaN(Number(value)) || Number(value) < 0) {
      return 'Enter a valid number (0 or greater).'
    }
    return null
  },

  integer(value) {
    if (value == null || String(value).trim() === '') return null
    const n = Number(value)
    if (!Number.isInteger(n) || n < 0) {
      return 'Enter a valid whole number (0 or greater).'
    }
    return null
  },

  url(value) {
    if (value == null || String(value).trim() === '') return null
    try {
      new URL(String(value).trim())
      return null
    } catch {
      return 'Enter a valid URL.'
    }
  },

  minLength(min) {
    return (value) => {
      if (value == null || String(value).trim() === '') return null
      if (String(value).trim().length < min) {
        return `Must be at least ${min} characters.`
      }
      return null
    }
  },

  maxLength(max) {
    return (value) => {
      if (value == null || String(value).trim() === '') return null
      if (String(value).trim().length > max) {
        return `Must be ${max} characters or fewer.`
      }
      return null
    }
  },

  // PENDING backend auth contract (owner: Mohammad Arsalan). The Admin Panel
  // uses this development rule until the real password policy is confirmed.
  password(value) {
    if (value == null || String(value) === '') return null
    if (String(value).length < 8) {
      return 'Password must be at least 8 characters.'
    }
    return null
  },

  matches(field) {
    return (value, values) => {
      if (value == null || String(value) === '') return null
      if (String(value) !== String(values?.[field] ?? '')) {
        return 'Passwords do not match.'
      }
      return null
    }
  },
}
