/**
 * Knowledge base configurations for Natural Deduction
 * Contains pre-configured premise sets with suggested goals
 */

import { KnowledgeBase } from './types'

export const knowledgeBases: KnowledgeBase[] = [
  // ── Foundational ────────────────────────────────────────────────────
  {
    id: 'empty',
    nameKey: 'kbEmpty',
    descriptionKey: 'kbEmptyDesc',
    premises: [],
    suggestedGoals: [
      { labelKey: 'goalIdentity', formula: 'p -> p', descriptionKey: 'goalIdentityDesc' },
      { labelKey: 'goalLEM', formula: 'p | ~p', descriptionKey: 'goalLEMDesc' },
    ],
  },
  {
    id: 'modus-ponens',
    nameKey: 'kbModusPonens',
    descriptionKey: 'kbModusPonensDesc',
    premises: ['p', 'p -> q'],
    suggestedGoals: [
      { labelKey: 'goalDeriveQ', formula: 'q', descriptionKey: 'goalDeriveQDesc' },
    ],
  },
  {
    id: 'conjunction',
    nameKey: 'kbConjunction',
    descriptionKey: 'kbConjunctionDesc',
    premises: ['p', 'q'],
    suggestedGoals: [
      { labelKey: 'goalCombineAnd', formula: 'p ^ q', descriptionKey: 'goalCombineAndDesc' },
      { labelKey: 'goalCommutative', formula: 'q ^ p', descriptionKey: 'goalCommutativeDesc' },
    ],
  },
  {
    id: 'disjunction',
    nameKey: 'kbDisjunction',
    descriptionKey: 'kbDisjunctionDesc',
    premises: ['p'],
    suggestedGoals: [
      { labelKey: 'goalAddOr', formula: 'p | q', descriptionKey: 'goalAddOrDesc' },
    ],
  },
  {
    id: 'syllogism',
    nameKey: 'kbSyllogism',
    descriptionKey: 'kbSyllogismDesc',
    premises: ['p', 'p -> q', 'q -> r'],
    suggestedGoals: [
      { labelKey: 'goalDeriveR', formula: 'r', descriptionKey: 'goalDeriveRDesc' },
      { labelKey: 'goalDirectImpl', formula: 'p -> r', descriptionKey: 'goalDirectImplDesc' },
    ],
  },
  {
    id: 'elimination',
    nameKey: 'kbElimination',
    descriptionKey: 'kbEliminationDesc',
    premises: ['p ^ q'],
    suggestedGoals: [
      { labelKey: 'goalExtractLeft', formula: 'p', descriptionKey: 'goalExtractLeftDesc' },
      { labelKey: 'goalExtractRight', formula: 'q', descriptionKey: 'goalExtractRightDesc' },
      { labelKey: 'goalConjComm', formula: 'q ^ p', descriptionKey: 'goalConjCommDesc' },
    ],
  },
  {
    id: 'proof-by-cases',
    nameKey: 'kbProofByCases',
    descriptionKey: 'kbProofByCasesDesc',
    premises: ['p | q', 'p -> r', 'q -> r'],
    suggestedGoals: [
      { labelKey: 'goalDeriveByCases', formula: 'r', descriptionKey: 'goalDeriveByCasesDesc' },
    ],
  },

  // ── Basic rules ─────────────────────────────────────────────────────
  {
    id: 'modus-tollens',
    nameKey: 'kbModusTollens',
    descriptionKey: 'kbModusTollensDesc',
    premises: ['p -> q', '~q'],
    suggestedGoals: [
      { labelKey: 'goalDeriveNotP', formula: '~p', descriptionKey: 'goalDeriveNotPDesc' },
    ],
  },
  {
    id: 'disjunctive-syllogism',
    nameKey: 'kbDisjSyl',
    descriptionKey: 'kbDisjSylDesc',
    premises: ['p | q', '~p'],
    suggestedGoals: [
      { labelKey: 'goalDeriveDSQ', formula: 'q', descriptionKey: 'goalDeriveDSQDesc' },
    ],
  },
  {
    id: 'conjunction-mp',
    nameKey: 'kbConjMP',
    descriptionKey: 'kbConjMPDesc',
    premises: ['p ^ q', 'q -> r'],
    suggestedGoals: [
      { labelKey: 'goalConjMPR', formula: 'r', descriptionKey: 'goalConjMPRDesc' },
    ],
  },
  {
    id: 'absorption',
    nameKey: 'kbAbsorption',
    descriptionKey: 'kbAbsorptionDesc',
    premises: ['p -> q', 'p'],
    suggestedGoals: [
      { labelKey: 'goalAbsorption', formula: 'p ^ q', descriptionKey: 'goalAbsorptionDesc' },
    ],
  },

  // ── Negation & double negation ──────────────────────────────────────
  {
    id: 'double-negation',
    nameKey: 'kbDoubleNeg',
    descriptionKey: 'kbDoubleNegDesc',
    premises: ['~~p'],
    suggestedGoals: [
      { labelKey: 'goalDNElim', formula: 'p', descriptionKey: 'goalDNElimDesc' },
    ],
  },
  {
    id: 'deep-negation',
    nameKey: 'kbDeepNeg',
    descriptionKey: 'kbDeepNegDesc',
    premises: ['~~~~p'],
    suggestedGoals: [
      { labelKey: 'goalDeepNeg', formula: 'p', descriptionKey: 'goalDeepNegDesc' },
    ],
  },
  {
    id: 'negation-intro',
    nameKey: 'kbNegIntro',
    descriptionKey: 'kbNegIntroDesc',
    premises: ['p -> ~p', '~~p'],
    suggestedGoals: [
      { labelKey: 'goalNegIntro', formula: '~p', descriptionKey: 'goalNegIntroDesc' },
    ],
  },
  {
    id: 'explosion',
    nameKey: 'kbExplosion',
    descriptionKey: 'kbExplosionDesc',
    premises: ['p', '~p'],
    suggestedGoals: [
      { labelKey: 'goalExplosion', formula: 'q', descriptionKey: 'goalExplosionDesc' },
    ],
  },

  // ── Contrapositive & material implication ───────────────────────────
  {
    id: 'contrapositive-chain',
    nameKey: 'kbContraChain',
    descriptionKey: 'kbContraChainDesc',
    premises: ['p -> q', 'q -> r', '~r'],
    suggestedGoals: [
      { labelKey: 'goalContraChain', formula: '~p', descriptionKey: 'goalContraChainDesc' },
    ],
  },
  {
    id: 'reverse-contrapositive',
    nameKey: 'kbRevContra',
    descriptionKey: 'kbRevContraDesc',
    premises: ['~q -> ~p', '~~p'],
    suggestedGoals: [
      { labelKey: 'goalRevContra', formula: 'q', descriptionKey: 'goalRevContraDesc' },
    ],
  },
  {
    id: 'material-implication',
    nameKey: 'kbMaterialImpl',
    descriptionKey: 'kbMaterialImplDesc',
    premises: ['p -> q', '~~p'],
    suggestedGoals: [
      { labelKey: 'goalMaterialImpl', formula: '~p | q', descriptionKey: 'goalMaterialImplDesc' },
    ],
  },

  // ── Conjunction structure ───────────────────────────────────────────
  {
    id: 'weakening',
    nameKey: 'kbWeakening',
    descriptionKey: 'kbWeakeningDesc',
    premises: ['(p ^ q) ^ r'],
    suggestedGoals: [
      { labelKey: 'goalWeaken', formula: 'p ^ r', descriptionKey: 'goalWeakenDesc' },
      { labelKey: 'goalConjAssoc', formula: 'p ^ (q ^ r)', descriptionKey: 'goalConjAssocDesc' },
    ],
  },
  {
    id: 'conjunction-reorder',
    nameKey: 'kbConjReorder',
    descriptionKey: 'kbConjReorderDesc',
    premises: ['p ^ q ^ r'],
    suggestedGoals: [
      { labelKey: 'goalReorder', formula: 'r ^ q ^ p', descriptionKey: 'goalReorderDesc' },
    ],
  },

  // ── Implication chains ──────────────────────────────────────────────
  {
    id: 'uncurrying',
    nameKey: 'kbUncurrying',
    descriptionKey: 'kbUncurryingDesc',
    premises: ['p -> (q -> r)', 'p', 'q'],
    suggestedGoals: [
      { labelKey: 'goalUncurry', formula: 'r', descriptionKey: 'goalUncurryDesc' },
    ],
  },
  {
    id: 'exportation',
    nameKey: 'kbExportation',
    descriptionKey: 'kbExportationDesc',
    premises: ['(p ^ q) -> r', 'p', 'q'],
    suggestedGoals: [
      { labelKey: 'goalExport', formula: 'r', descriptionKey: 'goalExportDesc' },
    ],
  },
  {
    id: 'chain-direct',
    nameKey: 'kbChainDirect',
    descriptionKey: 'kbChainDirectDesc',
    premises: ['p -> q', 'q -> r', 'r -> s', 'p'],
    suggestedGoals: [
      { labelKey: 'goalChainS', formula: 's', descriptionKey: 'goalChainSDesc' },
    ],
  },
  {
    id: 'long-chain-dn',
    nameKey: 'kbLongChainDN',
    descriptionKey: 'kbLongChainDNDesc',
    premises: ['p -> q', 'q -> r', 'r -> s', '~~p'],
    suggestedGoals: [
      { labelKey: 'goalChainDNS', formula: 's', descriptionKey: 'goalChainDNSDesc' },
    ],
  },

  // ── Disjunction patterns ───────────────────────────────────────────
  {
    id: 'cases-ds',
    nameKey: 'kbCasesDS',
    descriptionKey: 'kbCasesDSDesc',
    premises: ['p | q', '~p', 'q -> r'],
    suggestedGoals: [
      { labelKey: 'goalCasesDS', formula: 'r', descriptionKey: 'goalCasesDSDesc' },
    ],
  },
  {
    id: 'disj-triple-neg',
    nameKey: 'kbDisjTripleNeg',
    descriptionKey: 'kbDisjTripleNegDesc',
    premises: ['p | q', '~~~q'],
    suggestedGoals: [
      { labelKey: 'goalDisjTripleNeg', formula: 'q | p', descriptionKey: 'goalDisjTripleNegDesc' },
    ],
  },
  {
    id: 'disj-neg',
    nameKey: 'kbDisjNeg',
    descriptionKey: 'kbDisjNegDesc',
    premises: ['p | q', '~q'],
    suggestedGoals: [
      { labelKey: 'goalDisjNeg', formula: 'q | p', descriptionKey: 'goalDisjNegDesc' },
    ],
  },
  {
    id: 'reverse-cases',
    nameKey: 'kbRevCases',
    descriptionKey: 'kbRevCasesDesc',
    premises: ['p -> r', 'q -> r', 'p | q', '~q'],
    suggestedGoals: [
      { labelKey: 'goalRevCases', formula: 'r', descriptionKey: 'goalRevCasesDesc' },
    ],
  },

  // ── Distribution ────────────────────────────────────────────────────
  {
    id: 'distribution-or',
    nameKey: 'kbDistOr',
    descriptionKey: 'kbDistOrDesc',
    premises: ['p | q', 'r', '~p'],
    suggestedGoals: [
      { labelKey: 'goalDistOr', formula: '(p ^ r) | (q ^ r)', descriptionKey: 'goalDistOrDesc' },
    ],
  },
  {
    id: 'dist-and-or',
    nameKey: 'kbDistAndOr',
    descriptionKey: 'kbDistAndOrDesc',
    premises: ['p ^ (q | r)', '~q'],
    suggestedGoals: [
      { labelKey: 'goalDistAndOr', formula: '(p ^ q) | (p ^ r)', descriptionKey: 'goalDistAndOrDesc' },
    ],
  },
  {
    id: 'dist-or-and',
    nameKey: 'kbDistOrAnd',
    descriptionKey: 'kbDistOrAndDesc',
    premises: ['p | (q ^ r)', '~p'],
    suggestedGoals: [
      { labelKey: 'goalDistOrAnd', formula: '(p | q) ^ (p | r)', descriptionKey: 'goalDistOrAndDesc' },
    ],
  },

  // ── Dilemmas ────────────────────────────────────────────────────────
  {
    id: 'double-implication',
    nameKey: 'kbDoubleImpl',
    descriptionKey: 'kbDoubleImplDesc',
    premises: ['p -> q', '~p -> q', '~~p'],
    suggestedGoals: [
      { labelKey: 'goalDoubleImpl', formula: 'q', descriptionKey: 'goalDoubleImplDesc' },
    ],
  },
  {
    id: 'constructive-dilemma',
    nameKey: 'kbConstrDilemma',
    descriptionKey: 'kbConstrDilemmaDesc',
    premises: ['p -> q', 'r -> s', 'p | r', '~p'],
    suggestedGoals: [
      { labelKey: 'goalConstrDilemma', formula: 'q | s', descriptionKey: 'goalConstrDilemmaDesc' },
    ],
  },
  {
    id: 'destructive-dilemma',
    nameKey: 'kbDestrDilemma',
    descriptionKey: 'kbDestrDilemmaDesc',
    premises: ['p -> q', 'r -> s', '~q | ~s', '~~q'],
    suggestedGoals: [
      { labelKey: 'goalDestrDilemma', formula: '~p | ~r', descriptionKey: 'goalDestrDilemmaDesc' },
    ],
  },

  // ── Complex ─────────────────────────────────────────────────────────
  {
    id: 'complex-dn',
    nameKey: 'kbComplexDN',
    descriptionKey: 'kbComplexDNDesc',
    premises: ['~~~~(p | ~p)', '~~(p -> q)', '~~p'],
    suggestedGoals: [
      { labelKey: 'goalComplexDN', formula: 'q', descriptionKey: 'goalComplexDNDesc' },
    ],
  },
  {
    id: 'complex-nested',
    nameKey: 'kbComplexNested',
    descriptionKey: 'kbComplexNestedDesc',
    premises: ['p -> (q | r)', '~q', '~~p', 'r -> s'],
    suggestedGoals: [
      { labelKey: 'goalComplexNested', formula: 's', descriptionKey: 'goalComplexNestedDesc' },
    ],
  },
]
