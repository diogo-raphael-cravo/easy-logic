import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { behavior, RULE_KEYS } = vi.hoisted(() => ({
  behavior: {
    applyRuleThrows: false,
    applyRuleResult: null as {
      id: number
      lineNumber: string
      formula: string
      ruleKey: string
      dependencies: number[]
      justificationKey: string
      depth: number
    } | null,
    validateProofResult: false,
  },
  RULE_KEYS: {
    PREMISE: 'premise',
    ASSUME: 'assume',
  },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('../logic/proof', () => {
  class NaturalDeduction {
    getRules() {
      return [
        { id: 'assume' },
        { id: 'impl_intro' },
        { id: 'mp' },
      ]
    }

    getKnowledgeBases() {
      return [
        { id: 'empty', premises: [] },
        { id: 'kb1', premises: ['p', 'p -> q'] },
      ]
    }

    checkApplicability(rule: { id: string }) {
      return {
        id: rule.id,
        isApplicable: true,
      }
    }

    applyRule() {
      if (behavior.applyRuleThrows) {
        throw new Error('apply failed')
      }
      return behavior.applyRuleResult
    }

    validateProof() {
      return behavior.validateProofResult
    }
  }

  return {
    NaturalDeduction,
    RULE_KEYS,
    ProofState: {},
    ApplicableRule: {},
    ProofStep: {},
  }
})

import { useProofState } from './useProofState'

describe('useProofState', () => {
  beforeEach(() => {
    behavior.applyRuleThrows = false
    behavior.applyRuleResult = null
    behavior.validateProofResult = false
  })

  it('initializes with goal dialog open when no initial formula', () => {
    const { result } = renderHook(() => useProofState(''))

    expect(result.current.goalDialogOpen).toBe(true)
    expect(result.current.proofState.goal).toBe('')
  })

  it('initializes with goal dialog closed when initial formula exists', () => {
    const { result } = renderHook(() => useProofState('p'))

    expect(result.current.goalDialogOpen).toBe(false)
    expect(result.current.proofState.goal).toBe('p')
  })

  it('computes applicable rules when a goal exists', async () => {
    const { result } = renderHook(() => useProofState('p'))

    await waitFor(() => {
      expect(result.current.applicableRules.length).toBeGreaterThan(0)
    })
  })

  it('selects goal using selected KB premises', () => {
    const { result } = renderHook(() => useProofState(''))

    act(() => {
      result.current.setSelectedKB('kb1')
    })

    act(() => {
      result.current.handleGoalSelect('q')
    })

    expect(result.current.proofState.goal).toBe('q')
    expect(result.current.proofState.premises).toEqual(['p', 'p -> q'])
    expect(result.current.goalDialogOpen).toBe(false)
  })

  it('selects goal using explicit kbId override', () => {
    const { result } = renderHook(() => useProofState(''))

    act(() => {
      result.current.setSelectedKB('kb1')
      result.current.handleGoalSelect('q', 'empty')
    })

    expect(result.current.proofState.premises).toEqual([])
  })

  it('submits custom goal only when non-empty after trim', () => {
    const { result } = renderHook(() => useProofState(''))

    act(() => {
      result.current.setCustomGoal('   ')
      result.current.handleCustomGoalSubmit()
    })

    expect(result.current.proofState.goal).toBe('')

    act(() => {
      result.current.setCustomGoal('  r  ')
    })

    act(() => {
      result.current.handleCustomGoalSubmit()
    })

    expect(result.current.proofState.goal).toBe('r')
  })

  it('returns early when selected rule id does not exist', () => {
    const { result } = renderHook(() => useProofState('p'))

    act(() => {
      result.current.handleRuleSelect('unknown')
    })

    expect(result.current.errorMessage).toBeNull()
  })

  it('sets couldNotApplyRule when applyRule returns null', () => {
    const { result } = renderHook(() => useProofState('p'))

    behavior.applyRuleResult = null

    act(() => {
      result.current.handleRuleSelect('mp')
    })

    expect(result.current.errorMessage).toBe('couldNotApplyRule')
  })

  it('handles thrown errors while applying a rule', () => {
    const { result } = renderHook(() => useProofState('p'))

    behavior.applyRuleThrows = true

    act(() => {
      result.current.handleRuleSelect('mp')
    })

    expect(result.current.errorMessage).toBe('errorApplyingRule')
  })

  it('marks proof complete and calls onProofComplete callback', () => {
    const onProofComplete = vi.fn()
    const { result } = renderHook(() => useProofState('p', onProofComplete))

    behavior.applyRuleResult = {
      id: 1,
      lineNumber: '1',
      formula: 'p',
      ruleKey: 'assume',
      dependencies: [],
      justificationKey: 'justificationAssume',
      depth: 1,
    }
    behavior.validateProofResult = true

    act(() => {
      result.current.handleRuleSelect('assume')
    })

    expect(result.current.successMessage).toBe('proofCompleteMessage')
    expect(onProofComplete).toHaveBeenCalledTimes(1)
    expect(result.current.proofState.isComplete).toBe(true)
  })

  it('updates current depth when impl_intro rule is applied', () => {
    const { result } = renderHook(() => useProofState('p'))

    behavior.applyRuleResult = {
      id: 2,
      lineNumber: '2',
      formula: 'p -> p',
      ruleKey: 'impl_intro',
      dependencies: [],
      justificationKey: 'justificationImplIntro',
      depth: 2,
    }

    act(() => {
      result.current.handleRuleSelect('impl_intro')
    })

    expect(result.current.proofState.currentDepth).toBe(2)
  })

  it('toggles selected steps on and off', () => {
    const { result } = renderHook(() => useProofState('p'))

    act(() => {
      result.current.handleToggleStepSelection(1)
    })
    expect(result.current.selectedSteps).toEqual([1])

    act(() => {
      result.current.handleToggleStepSelection(1)
    })
    expect(result.current.selectedSteps).toEqual([])
  })

  it('prevents deleting premise steps', () => {
    const { result } = renderHook(() => useProofState(''))

    act(() => {
      result.current.handleGoalSelect('q', 'kb1')
    })

    act(() => {
      result.current.handleDeleteStep(1)
    })

    expect(result.current.errorMessage).toBe('cannotDeletePremise')
  })

  it('prevents deleting steps with dependents', () => {
    const { result } = renderHook(() => useProofState(''))

    act(() => {
      result.current.handleGoalSelect('q', 'kb1')
    })

    behavior.applyRuleResult = {
      id: 3,
      lineNumber: '3',
      formula: 'q',
      ruleKey: 'mp',
      dependencies: [],
      justificationKey: 'justificationMp',
      depth: 0,
    }

    act(() => {
      result.current.handleRuleSelect('mp')
    })

    behavior.applyRuleResult = {
      id: 4,
      lineNumber: '4',
      formula: 'r',
      ruleKey: 'mp',
      dependencies: [3],
      justificationKey: 'justificationMp',
      depth: 0,
    }

    act(() => {
      result.current.handleRuleSelect('mp')
    })

    act(() => {
      result.current.handleDeleteStep(3)
    })

    expect(result.current.errorMessage).toBe('cannotDeleteDependency')
  })

  it('deletes a derived step and sets success message', () => {
    const { result } = renderHook(() => useProofState(''))

    act(() => {
      result.current.handleGoalSelect('q', 'kb1')
    })

    behavior.applyRuleResult = {
      id: 3,
      lineNumber: '3',
      formula: 'q',
      ruleKey: 'mp',
      dependencies: [],
      justificationKey: 'justificationMp',
      depth: 0,
    }

    act(() => {
      result.current.handleRuleSelect('mp')
    })
    expect(result.current.proofState.steps.length).toBe(3)

    act(() => {
      result.current.handleDeleteStep(3)
    })

    expect(result.current.successMessage).toBe('stepDeleted')
    expect(result.current.proofState.steps.length).toBe(2)
  })

  it('recalculates depth from assume step when deleting later step', () => {
    const { result } = renderHook(() => useProofState(''))

    act(() => {
      result.current.handleGoalSelect('q', 'kb1')
    })

    behavior.applyRuleResult = {
      id: 3,
      lineNumber: '3',
      formula: 'r',
      ruleKey: RULE_KEYS.ASSUME,
      dependencies: [],
      justificationKey: 'justificationAssume',
      depth: 2,
    }

    act(() => {
      result.current.handleRuleSelect('assume')
    })

    behavior.applyRuleResult = {
      id: 4,
      lineNumber: '4',
      formula: 'r',
      ruleKey: 'mp',
      dependencies: [],
      justificationKey: 'justificationMp',
      depth: 0,
    }

    act(() => {
      result.current.handleRuleSelect('mp')
    })

    act(() => {
      result.current.handleDeleteStep(4)
    })

    expect(result.current.proofState.currentDepth).toBe(2)
  })

  it('resets all state to defaults', () => {
    const { result } = renderHook(() => useProofState('p'))

    act(() => {
      result.current.setCustomGoal('q')
      result.current.setSelectedKB('kb1')
      result.current.handleReset()
    })

    expect(result.current.goalDialogOpen).toBe(true)
    expect(result.current.customGoal).toBe('')
    expect(result.current.selectedKB).toBe('empty')
    expect(result.current.proofState.goal).toBe('')
    expect(result.current.selectedSteps).toEqual([])
  })
})
