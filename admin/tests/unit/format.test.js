import { describe, it, expect } from 'vitest'
import { formatPrice, formatDate, formatDateTime } from '../../src/utils/format.js'

describe('formatPrice', () => {
  it('formats a numeric value as USD without cents', () => {
    expect(formatPrice(1200)).toBe('$1,200')
    expect(formatPrice(700)).toBe('$700')
  })

  it('handles string numbers', () => {
    expect(formatPrice('2500')).toBe('$2,500')
  })

  it('returns an em dash for missing or invalid values', () => {
    expect(formatPrice(null)).toBe('—')
    expect(formatPrice(undefined)).toBe('—')
    expect(formatPrice('abc')).toBe('—')
  })
})

describe('formatDate', () => {
  it('formats a valid ISO date', () => {
    expect(formatDate('2026-08-20')).toBe('Aug 20, 2026')
  })

  it('returns an em dash for missing or invalid values', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })
})

describe('formatDateTime', () => {
  it('formats a valid ISO datetime', () => {
    const rendered = formatDateTime('2026-08-12T09:30:00Z')
    expect(rendered).toMatch(/Aug 12, 2026/)
    expect(rendered).toMatch(/\d{1,2}:\d{2} [AP]M/)
  })

  it('returns an em dash for missing or invalid values', () => {
    expect(formatDateTime(undefined)).toBe('—')
    expect(formatDateTime('garbage')).toBe('garbage')
  })
})
