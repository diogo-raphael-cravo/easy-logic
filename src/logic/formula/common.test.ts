import { describe, expect, it } from 'vitest'
import { extractVariables, tokenizeAndParse } from './common'
import { FormulaType, type Formula } from './types'

describe('common helpers', () => {
  it('tokenizeAndParse parses a simple variable formula', () => {
    const parsed = tokenizeAndParse('p')
    expect(parsed.type).toBe(FormulaType.VAR)
    expect(parsed.value).toBe('p')
  })

  it('extractVariables returns sorted unique variables from nested formulas', () => {
    const formula: Formula = {
      type: FormulaType.AND,
      left: {
        type: FormulaType.VAR,
        value: 'q',
      },
      right: {
        type: FormulaType.OR,
        left: {
          type: FormulaType.VAR,
          value: 'p',
        },
        right: {
          type: FormulaType.VAR,
          value: 'q',
        },
      },
    }

    expect(extractVariables(formula)).toEqual(['p', 'q'])
  })

  it('extractVariables ignores VAR nodes without a value', () => {
    const formula: Formula = {
      type: FormulaType.NOT,
      left: {
        type: FormulaType.VAR,
      },
    }

    expect(extractVariables(formula)).toEqual([])
  })
})
