/**
 * Classic Proofs Part 1 — Level 2-4 tests from PROOF_TEST_PLAN.md
 *
 * Each test selects a dedicated knowledge base whose premises match the
 * proof scenario, then applies inference rules to derive the goal.
 * All steps are at depth 0 — no Assume / subproofs needed.
 */

import { test, expect, Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function openProofAssistant(page: Page) {
  await page.goto('/proof-assistant')
  await expect(page.getByRole('dialog')).toBeVisible()
}

async function selectKB(page: Page, name: string) {
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name, exact: true }).click()
}

async function selectGoal(page: Page, goalLabel: string) {
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: new RegExp(goalLabel, 'i') }).click()
}

async function selectSteps(page: Page, ...lineNumbers: string[]) {
  for (const ln of lineNumbers) {
    const escaped = ln.replace(/\./g, '\\.')
    const stepRow = page
      .locator('.MuiPaper-root')
      .filter({ hasText: new RegExp(`^\\s*${escaped}\\.`) })
      .first()
    await stepRow.click()
  }
}

async function applyRule(page: Page, ruleName: string) {
  await page.getByRole('button', { name: ruleName, exact: true }).click()
}

async function applyRuleWithInput(
  page: Page,
  ruleName: string,
  formula: string,
) {
  await applyRule(page, ruleName)
  const inputDialog = page.getByRole('dialog')
  await expect(inputDialog).toBeVisible()
  await inputDialog.getByRole('textbox', { name: /formula/i }).fill(formula)
  await inputDialog.getByRole('button', { name: /apply/i }).click()
}

async function expectProofComplete(page: Page) {
  await expect(
    page.getByText(/proof complete/i).first(),
  ).toBeVisible({ timeout: 5000 })
}

async function screenshotCompletedProof(page: Page, name: string) {
  const backdrop = page.locator('.MuiBackdrop-root:not(.MuiModal-backdrop)')
  if (await backdrop.isVisible()) {
    await backdrop.click({ position: { x: 10, y: 10 } })
    await expect(backdrop).not.toBeVisible()
  }
  await page.screenshot({
    path: `e2e/screenshots/${name}.png`,
    fullPage: true,
  })
}

// ---------------------------------------------------------------------------
// Classic Proofs — Part 1 (Level 2-4)
// ---------------------------------------------------------------------------

test.describe('Classic Proofs Part 1 — Level 2-4', () => {
  // -----------------------------------------------------------------------
  // Test 55: Conjunction Commutativity
  //   KB: Conjunction Elimination (premise: p∧q)
  //   Goal: Commute conjunction (q∧p)
  //   Proof:
  //     1. p ^ q     (premise)
  //     2. ∧EL(1)    → p
  //     3. ∧ER(1)    → q
  //     4. ∧I(3,2)   → q ^ p
  // -----------------------------------------------------------------------
  test('55. Conjunction Commutativity — (P∧Q) → (Q∧P)', async ({ page }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Conjunction Elimination')
    await selectGoal(page, 'Commute conjunction')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 2: ∧ Elimination (Left) on step 1 → p
    await selectSteps(page, '1')
    await applyRule(page, '∧ Elimination (Left)')

    // Step 3: ∧ Elimination (Right) on step 1 → q
    await selectSteps(page, '1')
    await applyRule(page, '∧ Elimination (Right)')

    // Step 4: ∧ Introduction on steps 3 (q) and 2 (p) → q ^ p
    await selectSteps(page, '3', '2')
    await applyRule(page, '∧ Introduction')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '55-conjunction-commutativity')
  })

  // -----------------------------------------------------------------------
  // Test 47: Contrapositive
  //   KB: Modus Tollens (premises: p→q, ¬q)
  //   Goal: Derive ¬p
  //   Proof:
  //     1. p -> q   (premise)
  //     2. ~q       (premise)
  //     3. MT(1,2)  → ~p
  // -----------------------------------------------------------------------
  test('47. Contrapositive — derive ¬P via Modus Tollens', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Modus Tollens')
    await selectGoal(page, 'Derive')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 3: Modus Tollens on steps 1 (p -> q) and 2 (~q) → ~p
    await selectSteps(page, '1', '2')
    await applyRule(page, 'Modus Tollens')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '47-contrapositive')
  })

  // -----------------------------------------------------------------------
  // Test 57: Conjunction Associativity
  //   KB: Weakening (premise: (p∧q)∧r)
  //   Goal: Associativity (p∧(q∧r))
  //   Proof:
  //     1. (p ^ q) ^ r   (premise)
  //     2. ∧EL(1)         → p ^ q
  //     3. ∧ER(1)         → r
  //     4. ∧EL(2)         → p
  //     5. ∧ER(2)         → q
  //     6. ∧I(5,3)        → q ^ r
  //     7. ∧I(4,6)        → p ^ (q ^ r)
  // -----------------------------------------------------------------------
  test('57. Conjunction Associativity — ((P∧Q)∧R) → (P∧(Q∧R))', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Weakening')
    await selectGoal(page, 'Associativity')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 2: ∧ Elimination (Left) on step 1 → p ^ q
    await selectSteps(page, '1')
    await applyRule(page, '∧ Elimination (Left)')

    // Step 3: ∧ Elimination (Right) on step 1 → r
    await selectSteps(page, '1')
    await applyRule(page, '∧ Elimination (Right)')

    // Step 4: ∧ Elimination (Left) on step 2 → p
    await selectSteps(page, '2')
    await applyRule(page, '∧ Elimination (Left)')

    // Step 5: ∧ Elimination (Right) on step 2 → q
    await selectSteps(page, '2')
    await applyRule(page, '∧ Elimination (Right)')

    // Step 6: ∧ Introduction on steps 5 (q) and 3 (r) → q ^ r
    await selectSteps(page, '5', '3')
    await applyRule(page, '∧ Introduction')

    // Step 7: ∧ Introduction on steps 4 (p) and 6 (q ^ r) → p ^ (q ^ r)
    await selectSteps(page, '4', '6')
    await applyRule(page, '∧ Introduction')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '57-conjunction-associativity')
  })

  // -----------------------------------------------------------------------
  // Test 61: Absorption
  //   KB: Absorption (premises: p→q, p)
  //   Goal: Derive p∧q
  //   Proof:
  //     1. p -> q   (premise)
  //     2. p        (premise)
  //     3. MP(2,1)  → q
  //     4. ∧I(2,3)  → p ^ q
  // -----------------------------------------------------------------------
  test('61. Absorption — derive P∧Q via MP + ∧I', async ({ page }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Absorption')
    await selectGoal(page, 'Derive p')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 3: Modus Ponens on steps 2 (p) and 1 (p -> q) → q
    await selectSteps(page, '2', '1')
    await applyRule(page, 'Modus Ponens')

    // Step 4: ∧ Introduction on steps 2 (p) and 3 (q) → p ^ q
    await selectSteps(page, '2', '3')
    await applyRule(page, '∧ Introduction')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '61-absorption')
  })

  // -----------------------------------------------------------------------
  // Test 50: Importation
  //   KB: Exportation (premises: (p∧q)→r, p, q)
  //   Goal: Derive r
  //   Proof:
  //     1. (p ^ q) -> r   (premise)
  //     2. p              (premise)
  //     3. q              (premise)
  //     4. ∧I(2,3)        → p ^ q
  //     5. MP(4,1)        → r
  // -----------------------------------------------------------------------
  test('50. Importation — derive R from (P∧Q)→R, P, Q via ∧I + MP', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Exportation')
    await selectGoal(page, 'Derive r')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 4: ∧ Introduction on steps 2 (p) and 3 (q) → p ^ q
    await selectSteps(page, '2', '3')
    await applyRule(page, '∧ Introduction')

    // Step 5: Modus Ponens on steps 4 (p ^ q) and 1 ((p ^ q) -> r) → r
    await selectSteps(page, '4', '1')
    await applyRule(page, 'Modus Ponens')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '50-importation')
  })

  // -----------------------------------------------------------------------
  // Test 64: Hypothetical Syllogism
  //   KB: Hypothetical Syllogism (premises: p, p→q, q→r)
  //   Goal: Derive r
  //   Proof:
  //     1. p        (premise)
  //     2. p -> q   (premise)
  //     3. q -> r   (premise)
  //     4. MP(1,2)  → q
  //     5. MP(4,3)  → r
  // -----------------------------------------------------------------------
  test('64. Hypothetical Syllogism — derive R via chained MP', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Hypothetical Syllogism')
    await selectGoal(page, 'Derive r')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 4: Modus Ponens on steps 1 (p) and 2 (p -> q) → q
    await selectSteps(page, '1', '2')
    await applyRule(page, 'Modus Ponens')

    // Step 5: Modus Ponens on steps 4 (q) and 3 (q -> r) → r
    await selectSteps(page, '4', '3')
    await applyRule(page, 'Modus Ponens')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '64-hypothetical-syllogism')
  })

  // -----------------------------------------------------------------------
  // Test 56: Disjunction Commutativity
  //   KB: Disjunction + Negation (premises: p|q, ¬q)
  //   Goal: Derive q∨p
  //   Proof:
  //     1. p | q     (premise)
  //     2. ~q        (premise)
  //     3. DS(1,2)   → p
  //     4. ∨IR(3,q)  → q | p
  // -----------------------------------------------------------------------
  test('56. Disjunction Commutativity — derive Q∨P via DS + ∨IR', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Disjunction + Negation')
    await selectGoal(page, 'Derive q')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 3: Disjunctive Syllogism on steps 1 (p | q) and 2 (~q) → p
    await selectSteps(page, '1', '2')
    await applyRule(page, 'Disjunctive Syllogism')

    // Step 4: ∨ Introduction (Right) on step 3 (p), input "q" → q | p
    await selectSteps(page, '3')
    await applyRuleWithInput(page, '∨ Introduction (Right)', 'q')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '56-disjunction-commutativity')
  })

  // -----------------------------------------------------------------------
  // Test 60: Distribution of ∨ over ∧
  //   KB: Distribution (∨ over ∧) #2 (premises: p|(q∧r), ¬p)
  //   Goal: Derive (p∨q)∧(p∨r)
  //   Proof:
  //     1. p | (q ^ r)    (premise)
  //     2. ~p             (premise)
  //     3. DS(1,2)        → q ^ r
  //     4. ∧EL(3)         → q
  //     5. ∧ER(3)         → r
  //     6. ∨IR(4,p)       → p | q
  //     7. ∨IR(5,p)       → p | r
  //     8. ∧I(6,7)        → (p | q) ^ (p | r)
  // -----------------------------------------------------------------------
  test('60. Distribution ∨ over ∧ — derive (P∨Q)∧(P∨R)', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Distribution (∨ over ∧) #2')
    await selectGoal(page, 'Derive')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 3: Disjunctive Syllogism on steps 1 and 2 → q ^ r
    await selectSteps(page, '1', '2')
    await applyRule(page, 'Disjunctive Syllogism')

    // Step 4: ∧ Elimination (Left) on step 3 → q
    await selectSteps(page, '3')
    await applyRule(page, '∧ Elimination (Left)')

    // Step 5: ∧ Elimination (Right) on step 3 → r
    await selectSteps(page, '3')
    await applyRule(page, '∧ Elimination (Right)')

    // Step 6: ∨ Introduction (Right) on step 4 (q), input "p" → p | q
    await selectSteps(page, '4')
    await applyRuleWithInput(page, '∨ Introduction (Right)', 'p')

    // Step 7: ∨ Introduction (Right) on step 5 (r), input "p" → p | r
    await selectSteps(page, '5')
    await applyRuleWithInput(page, '∨ Introduction (Right)', 'p')

    // Step 8: ∧ Introduction on steps 6 (p | q) and 7 (p | r)
    await selectSteps(page, '6', '7')
    await applyRule(page, '∧ Introduction')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '60-distribution-or-over-and')
  })
})
