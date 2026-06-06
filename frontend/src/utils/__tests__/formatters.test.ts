import { describe, it, expect } from 'vitest'
import { formatCLP, formatDate } from '@/utils/formatters'

describe('formatCLP', () => {
  it('formats integer price', () => {
    expect(formatCLP(15990)).toBe('$15.990')
  })
  it('formats zero', () => {
    expect(formatCLP(0)).toBe('$0')
  })
  it('formats large number', () => {
    expect(formatCLP(1000000)).toBe('$1.000.000')
  })
})

describe('formatDate', () => {
  it('formats date string', () => {
    const result = formatDate('2026-01-15T00:00:00.000Z')
    expect(result).toContain('2026')
  })
})
