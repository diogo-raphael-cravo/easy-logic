/**
 * Pure logic for computing subproof visual ranges from proof steps.
 * Used by UI to render Fitch-style boxing/indentation.
 *
 * No React or UI dependencies — fully testable with plain vitest.
 */

import type { ProofStep } from './types'

/** Describes where a subproof lives within the step list */
interface SubproofRange {
  /** Index (into the flat steps array) of the first step in this subproof */
  startIndex: number
  /** Index of the last step in this subproof */
  endIndex: number
  /** Depth level of this subproof (1 = first nesting, 2 = second, …) */
  depth: number
}

/**
 * Scan a flat list of proof steps and return every subproof range.
 *
 * A subproof starts when depth increases and ends when depth drops
 * back. Nested subproofs produce multiple ranges at increasing depths.
 */
export function computeSubproofRanges(steps: readonly ProofStep[]): SubproofRange[] {
  const ranges: SubproofRange[] = []
  // Stack of open subproof start indices, one per depth level
  const stack: { startIndex: number; depth: number }[] = []

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]

    // Close any subproofs that have ended (depth dropped)
    while (stack.length > 0 && step.depth < stack[stack.length - 1].depth) {
      const open = stack.pop()
      if (open) {
        ranges.push({
          startIndex: open.startIndex,
          endIndex: i - 1,
          depth: open.depth,
        })
      }
    }

    // Open a new subproof when depth increases beyond the current stack top
    const currentTopDepth = stack.length > 0 ? stack[stack.length - 1].depth : 0
    if (step.depth > currentTopDepth) {
      stack.push({ startIndex: i, depth: step.depth })
    }
  }

  // Close any subproofs still open at end-of-list
  while (stack.length > 0) {
    const open = stack.pop()
    if (open) {
      ranges.push({
        startIndex: open.startIndex,
        endIndex: steps.length - 1,
        depth: open.depth,
      })
    }
  }

  return ranges
}

/**
 * For a given step index, return how many subproofs contain it.
 * This equals the number of Fitch-style vertical bars to render.
 */
export function getContainingSubproofDepths(
  stepIndex: number,
  ranges: readonly SubproofRange[]
): number[] {
  return ranges
    .filter((r) => stepIndex >= r.startIndex && stepIndex <= r.endIndex)
    .map((r) => r.depth)
    .sort((a, b) => a - b)
}
