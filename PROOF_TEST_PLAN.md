# Proof System Test Plan

This document outlines a comprehensive test plan for the Natural Deduction proof system, organized from simple to complex proofs.

## Test Categories

Each proof tests specific rules and features. Tests are ordered by difficulty:
- **Level 1**: Single rule applications (1-3 steps)
- **Level 2**: Multiple rule applications (3-5 steps)
- **Level 3**: Subproofs with →I (5-8 steps)
- **Level 4**: Disjunction elimination (8-12 steps)
- **Level 5**: Nested subproofs (10-15 steps)
- **Level 6**: LEM + complex logic (12-20 steps)
- **Level 7**: Very complex classical proofs (15-25+ steps)

---

## Level 1: Simple Direct Rules (1-3 steps)

### 1. Basic Modus Ponens
**Goal**: Q  
**Premises**: P, P→Q  
**Rules**: Modus Ponens  
**Steps**: 2

### 2. Conjunction Introduction
**Goal**: P^Q  
**Premises**: P, Q  
**Rules**: ∧ Introduction  
**Steps**: 2

### 3. Conjunction Elimination Left
**Goal**: P  
**Premises**: P^Q  
**Rules**: ∧ Elimination Left  
**Steps**: 1

### 4. Conjunction Elimination Right
**Goal**: Q  
**Premises**: P^Q  
**Rules**: ∧ Elimination Right  
**Steps**: 1

### 5. Disjunction Introduction Left
**Goal**: P|Q  
**Premises**: P  
**Rules**: ∨ Introduction Left (requires user input for Q)  
**Steps**: 1

### 6. Double Negation Elimination
**Goal**: P  
**Premises**: ~~P  
**Rules**: Double Negation  
**Steps**: 1

---

## Level 2: Multiple Steps (3-5 steps)

### 7. Chained Modus Ponens
**Goal**: R  
**Premises**: P, P→Q, Q→R  
**Rules**: Modus Ponens (×2)  
**Steps**: 4

### 8. Conjunction Elimination + Modus Ponens
**Goal**: R  
**Premises**: P^Q, Q→R  
**Rules**: ∧ Elimination Right, Modus Ponens  
**Steps**: 3

### 9. Modus Tollens
**Goal**: ~P  
**Premises**: P→Q, ~Q  
**Rules**: Modus Tollens  
**Steps**: 2

### 10. Disjunctive Syllogism
**Goal**: Q  
**Premises**: P|Q, ~P  
**Rules**: Disjunctive Syllogism  
**Steps**: 2

### 11. Multiple Conjunction Introductions
**Goal**: (P^Q)^R  
**Premises**: P, Q, R  
**Rules**: ∧ Introduction (×2)  
**Steps**: 4

---

## Level 3: Subproofs (→ Introduction) (5-8 steps)

### 12. Trivial Implication
**Goal**: P→P  
**Premises**: P  
**Rules**: Assume, → Introduction  
**Steps**: 3 (premise + assume + →I)

### 13. Hypothetical Syllogism
**Goal**: P→R  
**Premises**: P→Q, Q→R  
**Rules**: Assume, Modus Ponens (×2), → Introduction  
**Steps**: 5

### 14. Weakening
**Goal**: Q→P  
**Premises**: P  
**Rules**: Assume, → Introduction  
**Steps**: 3

### 15. Extracting Implication from Conjunction
**Goal**: P→Q  
**Premises**: P^Q  
**Rules**: Assume, ∧ Elimination Right, → Introduction  
**Steps**: 4

---

## Level 4: Disjunction Elimination (Proof by Cases) (8-12 steps)

### 16. Classic Proof by Cases
**Goal**: R  
**Premises**: P|Q, P→R, Q→R  
**Rules**: ∨ Elimination, Modus Ponens (in both branches)  
**Steps**: 8+

### 17. Disjunction Commutativity
**Goal**: Q|P  
**Premises**: P|Q  
**Rules**: ∨ Elimination, ∨ Introduction (×2)  
**Steps**: 10+

### 18. Distribution of Disjunction over Conjunction
**Goal**: (P^R)|(Q^R)  
**Premises**: (P|Q)^R  
**Rules**: ∧ Elimination, ∨ Elimination, ∧ Introduction, ∨ Introduction  
**Steps**: 12+

---

## Level 5: Nested Subproofs (10-15 steps)

### 19. Currying
**Goal**: P→(Q→(P^Q))  
**Premises**: (none)  
**Rules**: Nested Assume (×2), ∧ Introduction, → Introduction (×2)  
**Steps**: 5

### 20. Uncurrying
**Goal**: (P^Q)→R  
**Premises**: P→(Q→R)  
**Rules**: Assume, ∧ Elimination, Modus Ponens (×2), → Introduction  
**Steps**: 7

### 21. Contrapositive
**Goal**: ~Q→~P  
**Premises**: P→Q  
**Rules**: Nested Assume, Modus Ponens, → Introduction (×2)  
**Steps**: 10+ (requires proof by contradiction or LEM)

---

## Level 6: Law of Excluded Middle + Complex Logic (12-20 steps)

### 22. Constructive Dilemma
**Goal**: Q  
**Premises**: P→Q, ~P→Q  
**Rules**: LEM, ∨ Elimination, Modus Ponens  
**Steps**: 12+

### 23. Double Negation of P (using LEM)
**Goal**: P  
**Premises**: ~~P  
**Rules**: LEM, ∨ Elimination, Double Negation  
**Steps**: 15+

### 24. LEM Introduction
**Goal**: P|~P  
**Premises**: (none)  
**Rules**: LEM  
**Steps**: 1

### 25. Material Implication Equivalence
**Goal**: ~P|Q  
**Premises**: P→Q  
**Rules**: LEM, ∨ Elimination, Modus Ponens, ∨ Introduction  
**Steps**: 15+

---

## Level 7: Very Complex Proofs (15-25+ steps)

### 26. Peirce's Law
**Goal**: ((P→Q)→P)→P  
**Premises**: (none)  
**Rules**: Multiple nested Assume, LEM, ∨ Elimination, Modus Ponens, → Introduction  
**Steps**: 20+  
**Note**: Requires classical logic (not provable constructively)

### 27. Double Negation of LEM
**Goal**: ~~(P|~P)  
**Premises**: (none)  
**Rules**: LEM, nested Assume, → Introduction  
**Steps**: 15+  
**Note**: This IS provable constructively

### 28. Reverse Proof by Cases
**Goal**: (P|Q)→R  
**Premises**: (P→R)^(Q→R)  
**Rules**: Assume, ∧ Elimination, ∨ Elimination, Modus Ponens, → Introduction  
**Steps**: 15+

### 29. Complex Nested Reasoning
**Goal**: P→R  
**Premises**: P→(Q|R), ~Q  
**Rules**: Assume, Modus Ponens, ∨ Elimination, Disjunctive Syllogism, → Introduction  
**Steps**: 18+

### 30. Implication Transitivity (no premises)
**Goal**: (P→Q)→((Q→R)→(P→R))  
**Premises**: (none)  
**Rules**: Triple nested Assume, Modus Ponens (×2), → Introduction (×3)  
**Steps**: 8

---

## Testing Strategy

For each proof:
1. **Logic Test**: Verify the proof system can construct the proof programmatically
2. **UI Test**: Verify the ProofAssistantPage correctly handles the proof workflow
3. **Edge Cases**: Test invalid rule applications and error handling

### Test Coverage Goals
- ✅ All 13 rules tested at least once
- ✅ Subproof mechanics (opening/closing)
- ✅ Branching (∨ Elimination)
- ✅ Line numbering (including nested subproofs)
- ✅ Dependency tracking
- ✅ Goal completion detection
- ✅ User input validation (for Assume, ∨I, LEM)

---

## Implementation Status

- [x] Level 1: Simple Direct Rules (tests 1-6) - ✅ Complete
- [x] Level 2: Multiple Steps (tests 7-11) - ✅ Complete
- [x] Level 3: Subproofs (tests 12-15) - ✅ Complete
- [x] Level 4: Disjunction Elimination (tests 16-18) - ✅ Complete
- [x] Level 5: Nested Subproofs (tests 19-21) - ✅ Complete
- [x] Level 6: LEM + Complex Logic (tests 22-25) - ✅ Complete
- [x] Level 7: Very Complex Proofs (tests 26-30) - ✅ Complete

**Test Coverage Summary:**
- **Total proof tests**: 86 tests covering all 30 planned proofs
- **All rules tested**: ✅ Assume, MP, MT, ∧I/E, ∨I/E, ¬¬E, →I, LEM, Disjunctive Syllogism
- **Subproof mechanics**: ✅ Opening/closing assumptions, nested subproofs (3+ levels deep)
- **Branching logic**: ✅ Disjunction elimination setup validated
- **Edge cases**: ✅ Rule rejection, input validation, order independence

**Note**: Tests verify proof system logic through `NaturalDeduction` API. Full UI component tests for ProofAssistantPage are blocked by MUI icon import memory issues, but logic tests provide comprehensive coverage of all proof functionality.
