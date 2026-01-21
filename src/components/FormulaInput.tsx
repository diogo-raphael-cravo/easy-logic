import { useState } from 'react'

interface FormulaInputProps {
  onSubmit: (formula: string) => void
}

export function FormulaInput({ onSubmit }: FormulaInputProps) {
  const [input, setInput] = useState('')

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        onSubmit(input)
        setInput('')
      }
    }
  }

  return (
    <div className="formula-input-container">
      <label htmlFor="formula-input">Enter a propositional logic formula:</label>
      <input
        id="formula-input"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Example: (p ^ q) -> r"
        className="formula-input"
      />
      <div className="syntax-help">
        <p><strong>Syntax:</strong> ^ (and) | (or) → ({'->'}) ↔ ({`<->`}) ¬ (~) T F variables</p>
      </div>
    </div>
  )
}
