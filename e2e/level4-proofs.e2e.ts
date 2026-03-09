/**
 * Level 4 E2E tests — Disjunction Elimination / Proof by Cases (4-6 steps)
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
// Level 4 Tests
// ---------------------------------------------------------------------------

test.describe('Level 4 — Disjunction Elimination (Proof by Cases)', () => {
  // -----------------------------------------------------------------------
  // Test 16: Classic Proof by Cases
  //   KB: Cases + DS (premises: p|q, ¬p, q→r)
  //   Goal: Derive r
  //   Proof:
  //     1. p | q      (premise)
  //     2. ~p         (premise)
  //     3. q -> r     (premise)
  //     4. DS(1,2)    → q
  //     5. MP(4,3)    → r
  // -----------------------------------------------------------------------
  test('16. Classic Proof by Cases — derive R via DS + MP', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Cases + DS')
    await selectGoal(page, 'Derive r')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 4: Disjunctive Syllogism on steps 1 (p | q) and 2 (~p) → q
    await selectSteps(page, '1', '2')
    await applyRule(page, 'Disjunctive Syllogism')

    // Step 5: Modus Ponens on steps 4 (q) and 3 (q -> r) → r
    await selectSteps(page, '4', '3')
    await applyRule(page, 'Modus Ponens')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '16-classic-proof-by-cases')
  })

  // -----------------------------------------------------------------------
  // Test 17: Disjunction Commutativity
  //   KB: Disjunction + Triple Neg (premises: p|q, ¬¬¬q)
  //   Goal: Derive q∨p
  //   Proof:
  //     1. p | q      (premise)
  //     2. ~~~q       (premise)
  //     3. DN(2)      → ~q
  //     4. DS(1,3)    → p
  //     5. ∨IR(4, q)  → q | p
  // -----------------------------------------------------------------------
  test('17. Disjunction Commutativity — derive Q∨P via DN + DS + ∨IR', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Disjunction + Triple Neg')
    await selectGoal(page, 'Derive q')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 3: Double Negation on step 2 (~~~q) → ~q
    await selectSteps(page, '2')
    await applyRule(page, 'Double Negation')

    // Step 4: Disjunctive Syllogism on steps 1 (p | q) and 3 (~q) → p
    await selectSteps(page, '1', '3')
    await applyRule(page, 'Disjunctive Syllogism')

    // Step 5: ∨ Introduction (Right) on step 4 (p), input "q" → q | p
    await selectSteps(page, '4')
    await applyRuleWithInput(page, '∨ Introduction (Right)', 'q')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '17-disjunction-commutativity')
  })

  // -----------------------------------------------------------------------
  // Test 18: Distribution
  //   KB: Distribution (∨ over ∧) (premises: p|q, r, ¬p)
  //   Goal: Derive (p∧r)∨(q∧r)
  //   Proof:
  //     1. p | q          (premise)
  //     2. r              (premise)
  //     3. ~p             (premise)
  //     4. DS(1,3)        → q
  //     5. ∧I(4,2)        → q ^ r
  //     6. ∨IR(5, p ^ r)  → (p ^ r) | (q ^ r)
  // -----------------------------------------------------------------------
  test('18. Distribution — derive (P∧R)∨(Q∧R) via DS + ∧I + ∨IR', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Distribution (∨ over ∧)')
    await selectGoal(page, 'Derive')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 4: Disjunctive Syllogism on steps 1 (p | q) and 3 (~p) → q
    await selectSteps(page, '1', '3')
    await applyRule(page, 'Disjunctive Syllogism')

    // Step 5: ∧ Introduction on steps 4 (q) and 2 (r) → q ^ r
    await selectSteps(page, '4', '2')
    await applyRule(page, '∧ Introduction')

    // Step 6: ∨ Introduction (Right) on step 5 (q ^ r), input "p ^ r" → (p ^ r) | (q ^ r)
    await selectSteps(page, '5')
    await applyRuleWithInput(page, '∨ Introduction (Right)', 'p ^ r')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '18-distribution')
  })
})
