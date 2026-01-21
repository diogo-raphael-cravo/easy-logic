/**
 * Parse propositional logic formula and convert to LaTeX
 * 
 * Syntax:
 * ^ : AND
 * | : OR
 * -> : IMPLIES
 * <-> : IFF
 * ~ : NOT
 * T : TRUE
 * F : FALSE
 * p, proposition, etc : variables
 */

type Token = {
  type: 'LPAREN' | 'RPAREN' | 'AND' | 'OR' | 'IMPLIES' | 'IFF' | 'NOT' | 'VAR' | 'TRUE' | 'FALSE' | 'EOF'
  value: string
}

type Formula = {
  type: 'var' | 'true' | 'false' | 'not' | 'and' | 'or' | 'implies' | 'iff'
  value?: string
  left?: Formula
  right?: Formula
}

class Tokenizer {
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

    const ch = this.peek()

    if (ch === null) {
      return { type: 'EOF', value: '' }
    }

    if (ch === '(') {
      this.advance()
      return { type: 'LPAREN', value: '(' }
    }

    if (ch === ')') {
      this.advance()
      return { type: 'RPAREN', value: ')' }
    }

    if (ch === '^') {
      this.advance()
      return { type: 'AND', value: '^' }
    }

    if (ch === '|') {
      this.advance()
      return { type: 'OR', value: '|' }
    }

    if (ch === '~') {
      this.advance()
      return { type: 'NOT', value: '~' }
    }

    if (ch === '-' && this.peekTwo() === '->') {
      this.advance()
      this.advance()
      return { type: 'IMPLIES', value: '->' }
    }

    if (ch === '<' && this.peekTwo() === '<-') {
      // Check for <->
      if (this.pos + 2 < this.input.length && this.input[this.pos + 2] === '>') {
        this.advance()
        this.advance()
        this.advance()
        return { type: 'IFF', value: '<->' }
      }
    }

    if (ch === 'T') {
      this.advance()
      return { type: 'TRUE', value: 'T' }
    }

    if (ch === 'F') {
      this.advance()
      return { type: 'FALSE', value: 'F' }
    }

    // Variable: letters and numbers
    if (/[a-zA-Z_]/.test(ch)) {
      let var_name = ''
      while (this.peek() && /[a-zA-Z0-9_]/.test(this.peek()!)) {
        var_name += this.peek()
        this.advance()
      }
      return { type: 'VAR', value: var_name }
    }

    throw new Error(`Unexpected character: ${ch}`)
  }
}

class Parser {
  private tokens: Token[]
  private pos: number

  constructor(tokens: Token[]) {
    this.tokens = tokens
    this.pos = 0
  }

  private current(): Token {
    if (this.pos >= this.tokens.length) {
      return { type: 'EOF', value: '' }
    }
    return this.tokens[this.pos]
  }

  private advance(): void {
    this.pos++
  }

  private expect(type: Token['type']): Token {
    const token = this.current()
    if (token.type !== type) {
      throw new Error(`Expected ${type}, got ${token.type}`)
    }
    this.advance()
    return token
  }

  parse(): Formula {
    const formula = this.parseIff()
    if (this.current().type !== 'EOF') {
      throw new Error('Unexpected token at end of input')
    }
    return formula
  }

  private parseIff(): Formula {
    let left = this.parseImplies()

    while (this.current().type === 'IFF') {
      this.advance()
      const right = this.parseImplies()
      left = {
        type: 'iff',
        left,
        right,
      }
    }

    return left
  }

  private parseImplies(): Formula {
    let left = this.parseOr()

    while (this.current().type === 'IMPLIES') {
      this.advance()
      const right = this.parseOr()
      left = {
        type: 'implies',
        left,
        right,
      }
    }

    return left
  }

  private parseOr(): Formula {
    let left = this.parseAnd()

    while (this.current().type === 'OR') {
      this.advance()
      const right = this.parseAnd()
      left = {
        type: 'or',
        left,
        right,
      }
    }

    return left
  }

  private parseAnd(): Formula {
    let left = this.parseNot()

    while (this.current().type === 'AND') {
      this.advance()
      const right = this.parseNot()
      left = {
        type: 'and',
        left,
        right,
      }
    }

    return left
  }

  private parseNot(): Formula {
    if (this.current().type === 'NOT') {
      this.advance()
      const operand = this.parseNot()
      return {
        type: 'not',
        left: operand,
      }
    }

    return this.parsePrimary()
  }

  private parsePrimary(): Formula {
    const token = this.current()

    if (token.type === 'TRUE') {
      this.advance()
      return { type: 'true' }
    }

    if (token.type === 'FALSE') {
      this.advance()
      return { type: 'false' }
    }

    if (token.type === 'VAR') {
      this.advance()
      return { type: 'var', value: token.value }
    }

    if (token.type === 'LPAREN') {
      this.advance()
      const formula = this.parseIff()
      this.expect('RPAREN')
      return formula
    }

    throw new Error(`Unexpected token: ${token.type}`)
  }
}

function formulaToLatex(formula: Formula): string {
  switch (formula.type) {
    case 'var':
      return formula.value!

    case 'true':
      return '\\top'

    case 'false':
      return '\\bot'

    case 'not':
      return `\\neg ${formulaToLatex(formula.left!)}`

    case 'and':
      return `${formulaToLatex(formula.left!)} \\land ${formulaToLatex(formula.right!)}`

    case 'or':
      return `${formulaToLatex(formula.left!)} \\lor ${formulaToLatex(formula.right!)}`

    case 'implies':
      return `${formulaToLatex(formula.left!)} \\to ${formulaToLatex(formula.right!)}`

    case 'iff':
      return `${formulaToLatex(formula.left!)} \\leftrightarrow ${formulaToLatex(formula.right!)}`

    default:
      throw new Error(`Unknown formula type`)
  }
}

export function parseFormula(input: string): { latex: string; error?: string } {
  try {
    const tokenizer = new Tokenizer(input)
    const tokens: Token[] = []

    let token: Token
    do {
      token = tokenizer.nextToken()
      tokens.push(token)
    } while (token.type !== 'EOF')

    const parser = new Parser(tokens)
    const formula = parser.parse()
    const latex = formulaToLatex(formula)

    return { latex }
  } catch (error) {
    return {
      latex: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
