/**
 * Shared tokenizer and parser for propositional logic formulas
 * 
 * This is pure business logic - no React or UI dependencies.
 */

export type Token = {
  type: 'LPAREN' | 'RPAREN' | 'AND' | 'OR' | 'IMPLIES' | 'IFF' | 'NOT' | 'VAR' | 'TRUE' | 'FALSE' | 'EOF'
  value: string
}

export type Formula = {
  type: 'var' | 'true' | 'false' | 'not' | 'and' | 'or' | 'implies' | 'iff'
  value?: string
  left?: Formula
  right?: Formula
}

export class Tokenizer {
  private input: string
  private pos: number

  constructor(input: string) {
    this.input = input.trim()
    this.pos = 0
  }

  private peek(): string | null {
    if (this.pos >= this.input.length) return null
    return this.input[this.pos]
  }

  private peekTwo(): string | null {
    if (this.pos + 1 >= this.input.length) return null
    return this.input.substring(this.pos, this.pos + 2)
  }

  private peekThree(): string | null {
    if (this.pos + 2 >= this.input.length) return null
    return this.input.substring(this.pos, this.pos + 3)
  }

  private advance(): void {
    this.pos++
  }

  private skipWhitespace(): void {
    while (this.peek() && /\s/.test(this.peek()!)) {
      this.advance()
    }
  }

  nextToken(): Token {
    this.skipWhitespace()

    if (this.pos >= this.input.length) {
      return { type: 'EOF', value: '' }
    }

    const ch = this.peek()!
    const two = this.peekTwo()
    const three = this.peekThree()

    // Check for three-character operators first
    if (three === '<->') {
      this.pos += 3
      return { type: 'IFF', value: '<->' }
    }

    // Check for two-character operators
    if (two === '->') {
      this.pos += 2
      return { type: 'IMPLIES', value: '->' }
    }

    // Alternative symbols for operators
    if (two === '/\\' || two === '&&') {
      this.pos += 2
      return { type: 'AND', value: two }
    }

    if (two === '\\/' || two === '||') {
      this.pos += 2
      return { type: 'OR', value: two }
    }

    // Single character tokens
    switch (ch) {
      case '(':
        this.advance()
        return { type: 'LPAREN', value: '(' }
      case ')':
        this.advance()
        return { type: 'RPAREN', value: ')' }
      case '^':
      case '∧':
        this.advance()
        return { type: 'AND', value: ch }
      case '|':
      case '∨':
        this.advance()
        return { type: 'OR', value: ch }
      case '~':
      case '¬':
      case '!':
        this.advance()
        return { type: 'NOT', value: ch }
      case '→':
        this.advance()
        return { type: 'IMPLIES', value: '→' }
      case '↔':
        this.advance()
        return { type: 'IFF', value: '↔' }
    }

    // Check for TRUE/FALSE constants
    if (ch === 'T' || ch === '⊤') {
      this.advance()
      return { type: 'TRUE', value: ch }
    }

    if (ch === 'F' || ch === '⊥') {
      this.advance()
      return { type: 'FALSE', value: ch }
    }

    // Variables (single letters or multi-character identifiers)
    if (/[a-zA-Z_]/.test(ch)) {
      let value = ''
      while (this.peek() && /[a-zA-Z0-9_]/.test(this.peek()!)) {
        value += this.peek()
        this.advance()
      }
      return { type: 'VAR', value }
    }

    throw new Error(`Unexpected character: ${ch}`)
  }

  tokenize(): Token[] {
    const tokens: Token[] = []
    let token = this.nextToken()
    while (token.type !== 'EOF') {
      tokens.push(token)
      token = this.nextToken()
    }
    tokens.push(token) // Include EOF
    return tokens
  }
}

/**
 * Recursive descent parser for propositional logic
 * 
 * Grammar (precedence from lowest to highest):
 * 1. IFF (<->)
 * 2. IMPLIES (->)
 * 3. OR (|)
 * 4. AND (^)
 * 5. NOT (~)
 * 6. Atoms (variables, constants, parenthesized expressions)
 */
export class Parser {
  private tokens: Token[]
  private pos: number

  constructor(tokens: Token[]) {
    this.tokens = tokens
    this.pos = 0
  }

  private peek(): Token {
    return this.tokens[this.pos]
  }

  private advance(): Token {
    return this.tokens[this.pos++]
  }

  private match(type: Token['type']): boolean {
    if (this.peek().type === type) {
      this.advance()
      return true
    }
    return false
  }

  parse(): Formula {
    const result = this.parseIff()
    if (this.peek().type !== 'EOF') {
      throw new Error(`Unexpected token: ${this.peek().value}`)
    }
    return result
  }

  private parseIff(): Formula {
    let left = this.parseImplies()
    while (this.peek().type === 'IFF') {
      this.advance()
      const right = this.parseImplies()
      left = { type: 'iff', left, right }
    }
    return left
  }

  private parseImplies(): Formula {
    let left = this.parseOr()
    // Right-associative
    if (this.peek().type === 'IMPLIES') {
      this.advance()
      const right = this.parseImplies()
      return { type: 'implies', left, right }
    }
    return left
  }

  private parseOr(): Formula {
    let left = this.parseAnd()
    while (this.peek().type === 'OR') {
      this.advance()
      const right = this.parseAnd()
      left = { type: 'or', left, right }
    }
    return left
  }

  private parseAnd(): Formula {
    let left = this.parseNot()
    while (this.peek().type === 'AND') {
      this.advance()
      const right = this.parseNot()
      left = { type: 'and', left, right }
    }
    return left
  }

  private parseNot(): Formula {
    if (this.peek().type === 'NOT') {
      this.advance()
      const operand = this.parseNot()
      return { type: 'not', left: operand }
    }
    return this.parseAtom()
  }

  private parseAtom(): Formula {
    const token = this.peek()

    if (token.type === 'VAR') {
      this.advance()
      return { type: 'var', value: token.value }
    }

    if (token.type === 'TRUE') {
      this.advance()
      return { type: 'true' }
    }

    if (token.type === 'FALSE') {
      this.advance()
      return { type: 'false' }
    }

    if (token.type === 'LPAREN') {
      this.advance()
      const expr = this.parseIff()
      if (!this.match('RPAREN')) {
        throw new Error('Expected closing parenthesis')
      }
      return expr
    }

    throw new Error(`Unexpected token: ${token.value || token.type}`)
  }
}

/**
 * Convenience function to tokenize and parse a formula string
 */
export function tokenizeAndParse(input: string): Formula {
  const tokenizer = new Tokenizer(input)
  const tokens = tokenizer.tokenize()
  const parser = new Parser(tokens)
  return parser.parse()
}

/**
 * Extract all unique variable names from a formula
 */
export function extractVariables(formula: Formula): string[] {
  const vars = new Set<string>()

  function traverse(f: Formula) {
    if (f.type === 'var' && f.value) {
      vars.add(f.value)
    }
    if (f.left) traverse(f.left)
    if (f.right) traverse(f.right)
  }

  traverse(formula)
  return Array.from(vars).sort()
}
