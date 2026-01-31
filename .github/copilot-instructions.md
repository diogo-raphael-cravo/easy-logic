# Easy Logic - AI Coding Instructions

## Project Overview
A propositional logic formula renderer and proof assistant with i18n support (English/Portuguese). Built with React 18, TypeScript, MUI v7, and Vite.

## Architecture

### Core Components
- **Formula Parser** (`src/utils/formulaParser.ts`, `formulaCommon.ts`): Tokenizes logic formulas → AST → LaTeX (rendered via KaTeX)
- **Proof Systems** (`src/proofSystems/`): Strategy pattern for Natural Deduction rules. Add new proof systems by implementing `ProofSystem` interface in `src/types/proof.ts`
- **Pages**: `HomePage` (formula input), `TruthTablePage`, `ProofAssistantPage`

### i18n Pattern (CRITICAL)
**All user-visible strings must use translation keys** - the pre-commit hook will block commits with hardcoded strings.

```tsx
// ✅ Correct
const { t } = useTranslation()
<Button>{t('apply')}</Button>
title={t('backToHome')}

// ❌ Wrong - will fail pre-commit
<Button>Apply</Button>
title="Back to home"
```

For non-React code (like `NaturalDeduction.ts`), use `nameKey`/`descriptionKey` properties that are resolved via `t()` in UI components:
```typescript
// In NaturalDeduction.ts
{ id: 'mp', nameKey: 'ruleModusPonens', descriptionKey: 'ruleModusPonensDesc' }

// In component
{t(rule.nameKey)}
```

Translation files: `src/i18n/locales/en.json` and `pt-BR.json` - **must have identical keys**.

## Pre-Commit Quality Gates
The hook (`.husky/pre-commit.cjs`) runs 5 checks - all must pass:

1. **Tests** - `npm test` must pass
2. **Coverage** - ≥80% statement coverage
3. **Duplication** - ≤1% code duplication (jscpd)
4. **Hardcoded Strings** - No untranslated text in JSX (Step 4 + 4b checks key sync)
5. **Build** - `npm run build` must succeed

Run manually: `node .husky/pre-commit.cjs`

## Key Commands
```bash
npm run dev          # Start dev server (localhost:5173/easy-logic/)
npm test             # Run tests once
npm run test:ui      # Vitest UI for debugging
npm run test:coverage # Coverage report
```

## Testing Patterns
- Tests colocated with source: `Component.tsx` → `Component.test.tsx`
- Use `@testing-library/react` with `vitest`
- Mock i18n is configured in `src/test.setup.ts`

## Formula Syntax
Operators: `^` (AND), `|` (OR), `~` (NOT), `->` (IMPLIES), `<->` (IFF), `T`/`F` (constants)

## Adding New Features

### New Translation Key
1. Add to both `en.json` and `pt-BR.json` (same key, translated value)
2. Use via `t('keyName')` in component

### New Proof Rule
1. Add rule object to `NaturalDeduction.ts` with `nameKey`/`descriptionKey`
2. Add translation keys to both locale files
3. Implement logic in `applyRule()` switch statement

### New Knowledge Base
Add to `knowledgeBases` array in `NaturalDeduction.ts` with `nameKey`, `descriptionKey`, premises, and `suggestedGoals` (each goal needs `labelKey`/`descriptionKey`).
