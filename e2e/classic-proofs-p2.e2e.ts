/**
 * Classic Proofs Part 2 — Level 5-6 tests from PROOF_TEST_PLAN.md
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
// Classic Proofs — Part 2 (Level 5-6)
// ---------------------------------------------------------------------------

test.describe('Classic Proofs Part 2 — Level 5-6', () => {
  // -----------------------------------------------------------------------
  // Test 48: Reverse Contrapositive
  //   KB: Reverse Contrapositive (premises: ¬q→¬p, ¬¬p)
  //   Goal: Derive q
  //   Proof:
  //     1. ~q -> ~p   (premise)
  //     2. ~~p        (premise)
  //     3. MT(1,2)    → ~~q
  //     4. DN(3)      → q
  // -----------------------------------------------------------------------
  test('48. Reverse Contrapositive — derive Q via MT + DN', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Reverse Contrapositive')
    await selectGoal(page, 'Derive q')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 3: Modus Tollens on steps 1 (~q -> ~p) and 2 (~~p) → ~~q
    await selectSteps(page, '1', '2')
    await applyRule(page, 'Modus Tollens')

    // Step 4: Double Negation on step 3 (~~q) → q
    await selectSteps(page, '3')
    await applyRule(page, 'Double Negation')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '48-reverse-contrapositive')
  })

  // -----------------------------------------------------------------------
  // Test 49: Exportation
  //   KB: Exportation (premises: (p∧q)→r, p, q)
  //   Goal: Derive r
  //   Proof:
  //     1. (p ^ q) -> r   (premise)
  //     2. p              (premise)
  //     3. q              (premise)
  //     4. ∧I(2,3)        → p ^ q
  //     5. MP(4,1)        → r
  // -----------------------------------------------------------------------
  test('49. Exportation — derive R from (P∧Q)→R, P, Q', async ({ page }) => {
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
    await screenshotCompletedProof(page, '49-exportation')
  })

  // -----------------------------------------------------------------------
  // Test 59: Distribution ∧ over ∨
  //   KB: Distribution (∧ over ∨) (premises: p∧(q|r), ¬q)
  //   Goal: Derive (p∧q)∨(p∧r)
  //   Proof:
  //     1. p ^ (q | r)   (premise)
  //     2. ~q             (premise)
  //     3. ∧EL(1)         → p
  //     4. ∧ER(1)         → q | r
  //     5. DS(4,2)        → r
  //     6. ∧I(3,5)        → p ^ r
  //     7. ∨IR(6, p^q)    → (p ^ q) | (p ^ r)
  // -----------------------------------------------------------------------
  test('59. Distribution ∧ over ∨ — derive (P∧Q)∨(P∧R)', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Distribution (∧ over ∨)')
    await selectGoal(page, 'Derive')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 3: ∧ Elimination (Left) on step 1 → p
    await selectSteps(page, '1')
    await applyRule(page, '∧ Elimination (Left)')

    // Step 4: ∧ Elimination (Right) on step 1 → q | r
    await selectSteps(page, '1')
    await applyRule(page, '∧ Elimination (Right)')

    // Step 5: Disjunctive Syllogism on steps 4 (q | r) and 2 (~q) → r
    await selectSteps(page, '4', '2')
    await applyRule(page, 'Disjunctive Syllogism')

    // Step 6: ∧ Introduction on steps 3 (p) and 5 (r) → p ^ r
    await selectSteps(page, '3', '5')
    await applyRule(page, '∧ Introduction')

    // Step 7: ∨ Introduction (Right) on step 6 (p ^ r), input "p ^ q" → (p ^ q) | (p ^ r)
    await selectSteps(page, '6')
    await applyRuleWithInput(page, '∨ Introduction (Right)', 'p ^ q')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '59-distribution-and-over-or')
  })

  // -----------------------------------------------------------------------
  // Test 65: Constructive Dilemma
  //   KB: Constructive Dilemma (premises: p→q, r→s, p|r, ¬p)
  //   Goal: Derive q∨s
  //   Proof:
  //     1. p -> q   (premise)
  //     2. r -> s   (premise)
  //     3. p | r    (premise)
  //     4. ~p       (premise)
  //     5. DS(3,4)  → r
  //     6. MP(5,2)  → s
  //     7. ∨IR(6,q) → q | s
  // -----------------------------------------------------------------------
  test('65. Constructive Dilemma — derive Q∨S', async ({ page }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Constructive Dilemma')
    await selectGoal(page, 'Derive q')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 5: Disjunctive Syllogism on steps 3 (p | r) and 4 (~p) → r
    await selectSteps(page, '3', '4')
    await applyRule(page, 'Disjunctive Syllogism')

    // Step 6: Modus Ponens on steps 5 (r) and 2 (r -> s) → s
    await selectSteps(page, '5', '2')
    await applyRule(page, 'Modus Ponens')

    // Step 7: ∨ Introduction (Right) on step 6 (s), input "q" → q | s
    await selectSteps(page, '6')
    await applyRuleWithInput(page, '∨ Introduction (Right)', 'q')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '65-constructive-dilemma')
  })

  // -----------------------------------------------------------------------
  // Test 71: Negation Introduction
  //   KB: Negation Introduction (premises: p→¬p, ¬¬p)
  //   Goal: Derive ¬p
  //   Proof:
  //     1. p -> ~p   (premise)
  //     2. ~~p       (premise)
  //     3. DN(2)     → p
  //     4. MP(3,1)   → ~p
  // -----------------------------------------------------------------------
  test('71. Negation Introduction — derive ¬P via DN + MP', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Negation Introduction')
    await selectGoal(page, 'Derive')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 3: Double Negation on step 2 (~~p) → p
    await selectSteps(page, '2')
    await applyRule(page, 'Double Negation')

    // Step 4: Modus Ponens on steps 3 (p) and 1 (p -> ~p) → ~p
    await selectSteps(page, '3', '1')
    await applyRule(page, 'Modus Ponens')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '71-negation-introduction')
  })

  // -----------------------------------------------------------------------
  // Test 72: Triple Chain
  //   KB: Long Chain (premises: p→q, q→r, r→s, p)
  //   Goal: Derive s
  //   Proof:
  //     1. p -> q   (premise)
  //     2. q -> r   (premise)
  //     3. r -> s   (premise)
  //     4. p        (premise)
  //     5. MP(4,1)  → q
  //     6. MP(5,2)  → r
  //     7. MP(6,3)  → s
  // -----------------------------------------------------------------------
  test('72. Triple Chain — derive S via three Modus Ponens', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Long Chain')
    await selectGoal(page, 'Derive s')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 5: Modus Ponens on steps 4 (p) and 1 (p -> q) → q
    await selectSteps(page, '4', '1')
    await applyRule(page, 'Modus Ponens')

    // Step 6: Modus Ponens on steps 5 (q) and 2 (q -> r) → r
    await selectSteps(page, '5', '2')
    await applyRule(page, 'Modus Ponens')

    // Step 7: Modus Ponens on steps 6 (r) and 3 (r -> s) → s
    await selectSteps(page, '6', '3')
    await applyRule(page, 'Modus Ponens')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '72-triple-chain')
  })

  // -----------------------------------------------------------------------
  // Test 46: Explosion
  //   KB: Explosion (premises: p, ¬p)
  //   Goal: Derive q
  //   Proof:
  //     1. p         (premise)
  //     2. ~p        (premise)
  //     3. ∨IL(1,q)  → p | q
  //     4. DS(3,2)   → q
  // -----------------------------------------------------------------------
  test('46. Explosion — derive Q from P, ¬P', async ({ page }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Explosion')
    await selectGoal(page, 'Derive q')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 3: ∨ Introduction (Left) on step 1 (p), input "q" → p | q
    await selectSteps(page, '1')
    await applyRuleWithInput(page, '∨ Introduction (Left)', 'q')

    // Step 4: Disjunctive Syllogism on steps 3 (p | q) and 2 (~p) → q
    await selectSteps(page, '3', '2')
    await applyRule(page, 'Disjunctive Syllogism')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '46-explosion')
  })

  // -----------------------------------------------------------------------
  // Test 66: Destructive Dilemma
  //   KB: Destructive Dilemma (premises: p→q, r→s, ¬q|¬s, ¬¬q)
  //   Goal: Derive ¬p∨¬r
  //   Proof:
  //     1. p -> q     (premise)
  //     2. r -> s     (premise)
  //     3. ~q | ~s    (premise)
  //     4. ~~q        (premise)
  //     5. DS(3,4)    → ~s
  //     6. MT(2,5)    → ~r
  //     7. ∨IR(6,~p)  → ~p | ~r
  // -----------------------------------------------------------------------
  test('66. Destructive Dilemma — derive ¬P∨¬R', async ({ page }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Destructive Dilemma')
    await selectGoal(page, 'Derive')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 5: Disjunctive Syllogism on steps 3 (~q | ~s) and 4 (~~q) → ~s
    await selectSteps(page, '3', '4')
    await applyRule(page, 'Disjunctive Syllogism')

    // Step 6: Modus Tollens on steps 2 (r -> s) and 5 (~s) → ~r
    await selectSteps(page, '2', '5')
    await applyRule(page, 'Modus Tollens')

    // Step 7: ∨ Introduction (Right) on step 6 (~r), input "~p" → ~p | ~r
    await selectSteps(page, '6')
    await applyRuleWithInput(page, '∨ Introduction (Right)', '~p')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '66-destructive-dilemma')
  })
})
