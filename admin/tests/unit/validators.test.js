import { describe, it, expect } from 'vitest'
import { validators } from '../../src/utils/validators.js'

describe('validators', () => {
  describe('required', () => {
    it('rejects empty, whitespace, null, and undefined values', () => {
      expect(validators.required('')).toBe('This field is required.')
      expect(validators.required('   ')).toBe('This field is required.')
      expect(validators.required(null)).toBe('This field is required.')
      expect(validators.required(undefined)).toBe('This field is required.')
    })

    it('accepts non-empty values', () => {
      expect(validators.required('House')).toBeNull()
      expect(validators.required(0)).toBeNull()
    })
  })

  describe('email', () => {
    it('accepts a valid email and empty values', () => {
      expect(validators.email('admin@rental.com')).toBeNull()
      expect(validators.email('')).toBeNull()
      expect(validators.email(null)).toBeNull()
    })

    it('rejects malformed emails', () => {
      expect(validators.email('not-an-email')).toBe('Enter a valid email address.')
      expect(validators.email('a@b')).toBe('Enter a valid email address.')
      expect(validators.email('a b@c.com')).toBe('Enter a valid email address.')
    })
  })

  describe('numeric', () => {
    it('accepts numbers and empty values', () => {
      expect(validators.numeric('1200')).toBeNull()
      expect(validators.numeric(0)).toBeNull()
      expect(validators.numeric('')).toBeNull()
    })

    it('rejects non-numeric and negative values', () => {
      expect(validators.numeric('abc')).toBe('Enter a valid number (0 or greater).')
      expect(validators.numeric('-5')).toBe('Enter a valid number (0 or greater).')
    })
  })

  describe('integer', () => {
    it('accepts whole numbers and empty values', () => {
      expect(validators.integer('2')).toBeNull()
      expect(validators.integer(0)).toBeNull()
      expect(validators.integer('')).toBeNull()
    })

    it('rejects fractions and negatives', () => {
      expect(validators.integer('2.5')).toBe('Enter a valid whole number (0 or greater).')
      expect(validators.integer('-1')).toBe('Enter a valid whole number (0 or greater).')
    })
  })

  describe('url', () => {
    it('accepts a valid URL and empty values', () => {
      expect(validators.url('https://example.com/photo.jpg')).toBeNull()
      expect(validators.url('')).toBeNull()
    })

    it('rejects an invalid URL', () => {
      expect(validators.url('not-a-url')).toBe('Enter a valid URL.')
    })
  })

  describe('minLength', () => {
    it('rejects strings shorter than the minimum', () => {
      expect(validators.minLength(3)('ab')).toBe('Must be at least 3 characters.')
    })

    it('accepts strings at or above the minimum and empty values', () => {
      expect(validators.minLength(3)('abc')).toBeNull()
      expect(validators.minLength(3)('')).toBeNull()
    })
  })

  describe('maxLength', () => {
    it('rejects strings longer than the maximum', () => {
      expect(validators.maxLength(5)('abcdef')).toBe('Must be 5 characters or fewer.')
    })

    it('accepts strings at or below the maximum and empty values', () => {
      expect(validators.maxLength(5)('abcde')).toBeNull()
      expect(validators.maxLength(5)('')).toBeNull()
    })
  })

  describe('password', () => {
    it('rejects a password shorter than 8 characters', () => {
      expect(validators.password('short')).toBe('Password must be at least 8 characters.')
    })

    it('accepts a password of 8 characters or more and empty values', () => {
      expect(validators.password('password123')).toBeNull()
      expect(validators.password('')).toBeNull()
    })
  })

  describe('matches', () => {
    it('rejects values that do not match the target field', () => {
      const validator = validators.matches('confirm')
      expect(validator('abc', { confirm: 'xyz' })).toBe('Passwords do not match.')
    })

    it('accepts matching values and empty values', () => {
      const validator = validators.matches('confirm')
      expect(validator('abc', { confirm: 'abc' })).toBeNull()
      expect(validator('', { confirm: '' })).toBeNull()
    })
  })
})
