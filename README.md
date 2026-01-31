# Easy Logic

An interactive propositional logic tool for learning and practicing formal proofs. Render formulas with proper mathematical notation, generate truth tables, and build step-by-step proofs using Natural Deduction.

## Features

- **Formula Rendering** — Enter logic formulas and see them rendered with proper mathematical symbols (∧, ∨, →, ↔, ¬)
- **Truth Tables** — Auto-generate truth tables for any propositional formula
- **Proof Assistant** — Build formal proofs interactively using Natural Deduction rules
- **Bilingual** — Full English and Portuguese (pt-BR) support

## Formula Syntax

| Operator | Symbol | Example |
|----------|--------|---------|
| AND | `^` | `p ^ q` |
| OR | `\|` | `p \| q` |
| NOT | `~` | `~p` |
| IMPLIES | `->` | `p -> q` |
| IFF | `<->` | `p <-> q` |
| Constants | `T`, `F` | `T ^ p` |

## Proof Rules

The Natural Deduction system includes:

- **Assume** — Start a subproof with an assumption
- **Modus Ponens** — From P and P→Q, derive Q
- **Modus Tollens** — From P→Q and ¬Q, derive ¬P
- **∧ Introduction/Elimination** — Combine or extract conjuncts
- **∨ Introduction/Elimination** — Add disjuncts or proof by cases
- **→ Introduction** — Close an assumption to derive an implication
- **Double Negation** — From ¬¬P, derive P

## Development

```bash
npm install      # Install dependencies
npm run dev      # Start dev server (localhost:5173/easy-logic/)
npm test         # Run tests
npm run build    # Production build
```

### Quality Gates

Pre-commit hooks enforce:
- ✅ Tests pass with ≥80% coverage
- ✅ ≤1% code duplication
- ✅ No hardcoded strings (i18n required)
- ✅ Build succeeds

Run manually: `node .husky/pre-commit.cjs`

## Tech Stack

React 18 • TypeScript • Vite • MUI v7 • KaTeX • i18next • Vitest