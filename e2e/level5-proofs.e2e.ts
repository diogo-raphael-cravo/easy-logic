/**
 * Level 5 E2E tests — Nested Subproofs (5-7 steps)
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
// Level 5 Tests
// ---------------------------------------------------------------------------

test.describe('Level 5 — Nested Subproofs', () => {
  // -----------------------------------------------------------------------
  // Test 19: Conjunction Reorder
  //   KB: Conjunction Reorder (premise: p∧q∧r, parsed as (p∧q)∧r)
  //   Goal: Derive r∧q∧p
  //   Proof:
  //     1. (p ^ q) ^ r   (premise)
  //     2. ∧EL(1)         → p ^ q
  //     3. ∧ER(1)         → r
  //     4. ∧EL(2)         → p
  //     5. ∧ER(2)         → q
  //     6. ∧I(3,5)        → r ^ q
  //     7. ∧I(6,4)        → (r ^ q) ^ p
  // -----------------------------------------------------------------------
  test('19. Conjunction Reorder — derive R∧Q∧P from P∧Q∧R', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Conjunction Reorder')
    await selectGoal(page, 'Derive r')
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

    // Step 6: ∧ Introduction on steps 3 (r) and 5 (q) → r ^ q
    await selectSteps(page, '3', '5')
    await applyRule(page, '∧ Introduction')

    // Step 7: ∧ Introduction on steps 6 (r ^ q) and 4 (p) → (r ^ q) ^ p
    await selectSteps(page, '6', '4')
    await applyRule(page, '∧ Introduction')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '19-conjunction-reorder')
  })

  // -----------------------------------------------------------------------
  // Test 20: Uncurrying
  //   KB: Uncurrying (premises: p→(q→r), p, q)
  //   Goal: Derive r
  //   Proof:
  //     1. p -> (q -> r)   (premise)
  //     2. p               (premise)
  //     3. q               (premise)
  //     4. MP(2,1)          → q -> r
  //     5. MP(3,4)          → r
  // -----------------------------------------------------------------------
  test('20. Uncurrying — derive R from P→(Q→R), P, Q via chained MP', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Uncurrying')
    await selectGoal(page, 'Derive r')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 4: Modus Ponens on steps 2 (p) and 1 (p -> (q -> r)) → q -> r
    await selectSteps(page, '2', '1')
    await applyRule(page, 'Modus Ponens')

    // Step 5: Modus Ponens on steps 3 (q) and 4 (q -> r) → r
    await selectSteps(page, '3', '4')
    await applyRule(page, 'Modus Ponens')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '20-uncurrying')
  })

  // -----------------------------------------------------------------------
  // Test 21: Contrapositive Chain
  //   KB: Contrapositive Chain (premises: p→q, q→r, ¬r)
  //   Goal: Derive ¬p
  //   Proof:
  //     1. p -> q   (premise)
  //     2. q -> r   (premise)
  //     3. ~r       (premise)
  //     4. MT(2,3)  → ~q
  //     5. MT(1,4)  → ~p
  // -----------------------------------------------------------------------
  test('21. Contrapositive Chain — derive ¬P via chained Modus Tollens', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Contrapositive Chain')
    await selectGoal(page, 'Derive')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 4: Modus Tollens on steps 2 (q -> r) and 3 (~r) → ~q
    await selectSteps(page, '2', '3')
    await applyRule(page, 'Modus Tollens')

    // Step 5: Modus Tollens on steps 1 (p -> q) and 4 (~q) → ~p
    await selectSteps(page, '1', '4')
    await applyRule(page, 'Modus Tollens')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '21-contrapositive-chain')
  })
})
