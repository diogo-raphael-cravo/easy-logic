/**
 * Generate truth table for a propositional logic formula
 * 
 * This is pure business logic - no React or UI dependencies.
 */

import { tokenizeAndParse, Formula } from '../formula/common'

function getVariables(formula: Formula): Set<string> {
  const vars = new Set<string>()

  function traverse(f: Formula) {
    if (f.type === 'var') {
      vars.add(f.value!)
    } else if (f.type === 'not' && f.left) {
      traverse(f.left)
    } else if ((f.type === 'and' || f.type === 'or' || f.type === 'implies' || f.type === 'iff') && f.left && f.right) {
      traverse(f.left)
      traverse(f.right)
    }
  }

  traverse(formula)
  return vars
}

export function evaluateFormula(formula: Formula, assignment: Record<string, boolean>): boolean {
  switch (formula.type) {
    case 'var':
      return assignment[formula.value!] ?? false

    case 'true':
      return true

    case 'false':
      return false

    case 'not':
      return !evaluateFormula(formula.left!, assignment)

    case 'and':
      return evaluateFormula(formula.left!, assignment) && evaluateFormula(formula.right!, assignment)

    case 'or':
      return evaluateFormula(formula.left!, assignment) || evaluateFormula(formula.right!, assignment)

    case 'implies':
      return !evaluateFormula(formula.left!, assignment) || evaluateFormula(formula.right!, assignment)

    case 'iff':
      return evaluateFormula(formula.left!, assignment) === evaluateFormula(formula.right!, assignment)

    default:
      throw new Error(`Unknown formula type`)
  }
}

export interface TruthTableRow {
  assignment: Record<string, boolean>
  result: boolean
}

export function generateTruthTable(formulaString: string): TruthTableRow[] {
  const formula = tokenizeAndParse(formulaString)
  const variables = Array.from(getVariables(formula)).sort()
  const rows: TruthTableRow[] = []

  const numRows = Math.pow(2, variables.length)
  for (let i = 0; i < numRows; i++) {
    const assignment: Record<string, boolean> = {}
    for (let j = 0; j < variables.length; j++) {
      assignment[variables[j]] = Boolean((i >> (variables.length - 1 - j)) & 1)
    }

    const result = evaluateFormula(formula, assignment)
    rows.push({ assignment, result })
  }

  return rows
}

/**
 * Get the variables from a formula string
 */
export function getFormulaVariables(formulaString: string): string[] {
  const formula = tokenizeAndParse(formulaString)
  return Array.from(getVariables(formula)).sort()
}
