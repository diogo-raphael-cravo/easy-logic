/**
 * Type definitions for the proof assistant
 */

export interface ProofStep {
  id: number
  formula: string
  rule: string
  dependencies: number[] // IDs of steps this depends on
  justification: string // For display - can be translation key or formatted string
  justificationKey?: string // Translation key (if provided, justification is used as fallback)
  justificationParams?: Record<string, string | number> // Parameters for translation interpolation
  depth: number // For nested assumptions
  branchId?: string // For tree-like proofs (e.g., "main", "left", "right")
  parentBranchId?: string // Branch this was derived from
}

export interface ProofState {
  goal: string
  premises: string[] // Initial assumptions/axioms
  steps: ProofStep[]
  currentDepth: number
  isComplete: boolean
  activeBranches?: string[] // Currently open branches (e.g., for ∨E)
  currentBranch?: string // Which branch we're working in
}

export interface Rule {
  id: string
  nameKey: string // Translation key for name
  descriptionKey: string // Translation key for description
  category: 'basic' | 'introduction' | 'elimination' | 'assumption'
  requiredSteps: number // How many previous steps needed
  pattern?: string // Pattern to match
}

export interface ApplicableRule extends Rule {
  applicable: boolean
  reason?: string // Why it's not applicable
}

export interface SuggestedGoal {
  labelKey: string // Translation key for label
  formula: string
  descriptionKey: string // Translation key for description
}

export interface KnowledgeBase {
  id: string
  nameKey: string // Translation key for name
  descriptionKey: string // Translation key for description
  premises: string[]
  suggestedGoals: SuggestedGoal[]
}

/**
 * Abstract interface for proof systems
 * Uses Strategy pattern to allow different proof systems (Natural Deduction, Sequent Calculus, etc.)
 */
export interface ProofSystem {
  name: string
  getRules(): Rule[]
  getKnowledgeBases(): KnowledgeBase[]
  checkApplicability(rule: Rule, state: ProofState): ApplicableRule
  applyRule(rule: Rule, state: ProofState, selectedSteps: number[], userInput?: string): ProofStep | null
  validateProof(state: ProofState): boolean
  getSuggestedGoals(): SuggestedGoal[]
}
