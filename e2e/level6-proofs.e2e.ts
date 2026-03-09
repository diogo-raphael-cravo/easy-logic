/**
 * Level 6 E2E tests — Law of Excluded Middle + Complex Logic (3-6 steps)
 *
 * Each test selects a dedicated knowledge base whose premises match the
 * proof scenario, then applies inference rules to derive the goal.
 * Test 24 is a pure tautology (p | ~p) proven with a single LEM step.
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
// Level 6 Tests
// ---------------------------------------------------------------------------

test.describe('Level 6 — LEM + Complex Logic', () => {
  // -----------------------------------------------------------------------
  // Test 22: Constructive Dilemma
  //   KB: Double Implication (premises: p→q, ¬p→q, ¬¬p)
  //   Goal: Derive q
  //   Proof:
  //     1. p -> q     (premise)
  //     2. ~p -> q    (premise)
  //     3. ~~p        (premise)
  //     4. LEM(p)     → p | ~p
  //     5. DS(4,3)    → p
  //     6. MP(5,1)    → q
  // -----------------------------------------------------------------------
  test('22. Constructive Dilemma — derive Q via LEM + DS + MP', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Double Implication')
    await selectGoal(page, 'Derive q')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 4: LEM (p) → p | ~p
    await applyRuleWithInput(page, 'Law of Excluded Middle', 'p')

    // Step 5: Disjunctive Syllogism on steps 4 (p | ~p) and 3 (~~p) → p
    await selectSteps(page, '4', '3')
    await applyRule(page, 'Disjunctive Syllogism')

    // Step 6: Modus Ponens on steps 5 (p) and 1 (p -> q) → q
    await selectSteps(page, '5', '1')
    await applyRule(page, 'Modus Ponens')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '22-constructive-dilemma')
  })

  // -----------------------------------------------------------------------
  // Test 23: Double Negation (deep)
  //   KB: Deep Negation (premise: ¬¬¬¬p)
  //   Goal: Derive p
  //   Proof:
  //     1. ~~~~p     (premise)
  //     2. DN(1)     → ~~p
  //     3. DN(2)     → p
  // -----------------------------------------------------------------------
  test('23. Double Negation — derive P from ¬¬¬¬P via two DN steps', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Deep Negation')
    await selectGoal(page, 'Derive p')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 2: Double Negation on step 1 (~~~~p) → ~~p
    await selectSteps(page, '1')
    await applyRule(page, 'Double Negation')

    // Step 3: Double Negation on step 2 (~~p) → p
    await selectSteps(page, '2')
    await applyRule(page, 'Double Negation')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '23-double-negation')
  })

  // -----------------------------------------------------------------------
  // Test 24: LEM Introduction
  //   KB: Empty (no premises)
  //   Goal: Excluded middle (p | ~p)
  //   Proof:
  //     1. LEM(p)   → p | ~p
  // -----------------------------------------------------------------------
  test('24. LEM Introduction — prove P|~P with a single LEM application', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectGoal(page, 'Excluded middle')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 1: LEM (p) → p | ~p
    await applyRuleWithInput(page, 'Law of Excluded Middle', 'p')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '24-lem-introduction')
  })

  // -----------------------------------------------------------------------
  // Test 25: Material Implication Equivalence
  //   KB: Material Implication (premises: p→q, ¬¬p)
  //   Goal: Derive ¬p∨q
  //   Proof:
  //     1. p -> q     (premise)
  //     2. ~~p        (premise)
  //     3. LEM(p)     → p | ~p
  //     4. DS(3,2)    → p
  //     5. MP(4,1)    → q
  //     6. ∨IR(5, ~p) → ~p | q
  // -----------------------------------------------------------------------
  test('25. Material Implication — prove ¬P∨Q via LEM + DS + MP + ∨I', async ({
    page,
  }) => {
    await openProofAssistant(page)
    await selectKB(page, 'Material Implication')
    await selectGoal(page, 'Derive')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Step 3: LEM (p) → p | ~p
    await applyRuleWithInput(page, 'Law of Excluded Middle', 'p')

    // Step 4: Disjunctive Syllogism on steps 3 (p | ~p) and 2 (~~p) → p
    await selectSteps(page, '3', '2')
    await applyRule(page, 'Disjunctive Syllogism')

    // Step 5: Modus Ponens on steps 4 (p) and 1 (p -> q) → q
    await selectSteps(page, '4', '1')
    await applyRule(page, 'Modus Ponens')

    // Step 6: ∨ Introduction (Right) on step 5 (q), input "~p" → ~p | q
    await selectSteps(page, '5')
    await applyRuleWithInput(page, '∨ Introduction (Right)', '~p')

    await expectProofComplete(page)
    await screenshotCompletedProof(page, '25-material-implication')
  })
})
