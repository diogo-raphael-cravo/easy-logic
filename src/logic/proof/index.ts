/**
 * Proof module - pure business logic for proof systems
 */

// Types
export type { 
  ProofStep, 
  ProofState, 
  Rule, 
  ApplicableRule, 
  SuggestedGoal, 
  KnowledgeBase, 
  ProofSystem 
} from './types'

// Natural Deduction proof system
export { NaturalDeduction } from './NaturalDeduction'
