/**
 * Level 7 E2E tests — Very Complex Proofs (5-10 steps)
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
// Level 7 Tests
// ---------------------------------------------------------------------------

test.describe('Level 7 — Very Complex Proofs', () => {
  // -----------------------------------------------------------------------
  // Test 26: Peirce's Law (Long Chain with DN)
  //   KB: Long Chain (DN) (premises: p→q, q→r, r→s, ¬¬p)
  //   Goal: Derive s
  //   Proof:
  //     1. p -> q    (premise)
  //     2. q -> r    (premise)
  //     3. r -> s    (premise)
  //     4. ~~p       (premise)
  //     5. LEM(p)    → p | ~p
  //     6. DS(5,4)   → p
  //     7. MP(6,1)   → q
  //     8. MP(7,2)   → r
  //     9. MP(8,3)   → s
  // -----------------------------------------------------------------------
  test('26. Peirce\'s Law — derive S via LEM + DS + chained MP', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Long Chain (DN)')
    await selectGoal(page, 'Derive s')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 5: LEM (p) → p | ~p
    await applyRuleWithInput(page, 'Law of Excluded Middle', 'p')

    // Step 6: Disjunctive Syllogism on steps 5 (p | ~p) and 4 (~~p) → p
    await selectSteps(page, '5', '4')
    await applyRule(page, 'Disjunctive Syllogism')

    // Step 7: Modus Ponens on steps 6 (p) and 1 (p -> q) → q
    await selectSteps(page, '6', '1')
    await applyRule(page, 'Modus Ponens')

    // Step 8: Modus Ponens on steps 7 (q) and 2 (q -> r) → r
    await selectSteps(page, '7', '2')
    await applyRule(page, 'Modus Ponens')

    // Step 9: Modus Ponens on steps 8 (r) and 3 (r -> s) → s
    await selectSteps(page, '8', '3')
    await applyRule(page, 'Modus Ponens')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '26-peirce-law')
  })

  // -----------------------------------------------------------------------
  // Test 27: Double Negation of LEM
  //   KB: Complex DN (premises: ¬¬¬¬(p|¬p), ¬¬(p→q), ¬¬p)
  //   Goal: Derive q
  //   Proof:
  //     1. ~~~~(p | ~p)  (premise)
  //     2. ~~(p -> q)    (premise)
  //     3. ~~p           (premise)
  //     4. DN(1)         → ~~(p | ~p)
  //     5. DN(4)         → p | ~p
  //     6. DN(2)         → p -> q
  //     7. DS(5,3)       → p
  //     8. MP(7,6)       → q
  // -----------------------------------------------------------------------
  test('27. Double Negation of LEM — derive Q via triple DN + DS + MP', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Complex DN')
    await selectGoal(page, 'Derive q')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 4: Double Negation on step 1 → ~~(p | ~p)
    await selectSteps(page, '1')
    await applyRule(page, 'Double Negation')

    // Step 5: Double Negation on step 4 → p | ~p
    await selectSteps(page, '4')
    await applyRule(page, 'Double Negation')

    // Step 6: Double Negation on step 2 → p -> q
    await selectSteps(page, '2')
    await applyRule(page, 'Double Negation')

    // Step 7: Disjunctive Syllogism on steps 5 (p | ~p) and 3 (~~p) → p
    await selectSteps(page, '5', '3')
    await applyRule(page, 'Disjunctive Syllogism')

    // Step 8: Modus Ponens on steps 7 (p) and 6 (p -> q) → q
    await selectSteps(page, '7', '6')
    await applyRule(page, 'Modus Ponens')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '27-double-negation-lem')
  })

  // -----------------------------------------------------------------------
  // Test 28: Reverse Proof by Cases
  //   KB: Reverse Cases (premises: p→r, q→r, p|q, ¬q)
  //   Goal: Derive r
  //   Proof:
  //     1. p -> r    (premise)
  //     2. q -> r    (premise)
  //     3. p | q     (premise)
  //     4. ~q        (premise)
  //     5. DS(3,4)   → p
  //     6. MP(5,1)   → r
  // -----------------------------------------------------------------------
  test('28. Reverse Proof by Cases — derive R via DS + MP', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Reverse Cases')
    await selectGoal(page, 'Derive r')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 5: Disjunctive Syllogism on steps 3 (p | q) and 4 (~q) → p
    await selectSteps(page, '3', '4')
    await applyRule(page, 'Disjunctive Syllogism')

    // Step 6: Modus Ponens on steps 5 (p) and 1 (p -> r) → r
    await selectSteps(page, '5', '1')
    await applyRule(page, 'Modus Ponens')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '28-reverse-proof-by-cases')
  })

  // -----------------------------------------------------------------------
  // Test 29: Complex Nested Reasoning
  //   KB: Complex Nested (premises: p→(q|r), ¬q, ¬¬p, r→s)
  //   Goal: Derive s
  //   Proof:
  //     1. p -> (q | r)  (premise)
  //     2. ~q            (premise)
  //     3. ~~p           (premise)
  //     4. r -> s        (premise)
  //     5. DN(3)         → p
  //     6. MP(5,1)       → q | r
  //     7. DS(6,2)       → r
  //     8. MP(7,4)       → s
  // -----------------------------------------------------------------------
  test('29. Complex Nested Reasoning — derive S via DN + MP + DS + MP', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Complex Nested')
    await selectGoal(page, 'Derive s')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 5: Double Negation on step 3 (~~p) → p
    await selectSteps(page, '3')
    await applyRule(page, 'Double Negation')

    // Step 6: Modus Ponens on steps 5 (p) and 1 (p -> (q | r)) → q | r
    await selectSteps(page, '5', '1')
    await applyRule(page, 'Modus Ponens')

    // Step 7: Disjunctive Syllogism on steps 6 (q | r) and 2 (~q) → r
    await selectSteps(page, '6', '2')
    await applyRule(page, 'Disjunctive Syllogism')

    // Step 8: Modus Ponens on steps 7 (r) and 4 (r -> s) → s
    await selectSteps(page, '7', '4')
    await applyRule(page, 'Modus Ponens')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '29-complex-nested-reasoning')
  })

  // -----------------------------------------------------------------------
  // Test 30: Implication Transitivity
  //   KB: Long Chain (premises: p→q, q→r, r→s, p)
  //   Goal: Derive s
  //   Proof:
  //     1. p -> q    (premise)
  //     2. q -> r    (premise)
  //     3. r -> s    (premise)
  //     4. p         (premise)
  //     5. MP(4,1)   → q
  //     6. MP(5,2)   → r
  //     7. MP(6,3)   → s
  // -----------------------------------------------------------------------
  test('30. Implication Transitivity — derive S via triple chained MP', async ({
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
    await screenshotCompletedProof(page, '30-implication-transitivity')
  })
})
