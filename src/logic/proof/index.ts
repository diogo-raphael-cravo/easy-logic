/**
 * Proof module - pure business logic for proof systems
 */

// Types
export type { 
  ProofStep, 
  ProofState, 
  ApplicableRule, 
} from './types'

// Constants
export { RULE_KEYS } from './types'

// Natural Deduction proof system
export { NaturalDeduction } from './NaturalDeduction'

// Subproof range helpers (Fitch-style boxing)
export { computeSubproofRanges, getContainingSubproofDepths } from './subproofRanges'
export type { SubproofRange } from './subproofRanges'
