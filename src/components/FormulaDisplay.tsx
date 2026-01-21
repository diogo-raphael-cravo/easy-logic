import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface FormulaDisplayProps {
  latex: string
  error?: string
}

export function FormulaDisplay({ latex, error }: FormulaDisplayProps) {
  if (error) {
    return (
      <div className="formula-display error">
        <p className="error-message">Error: {error}</p>
      </div>
    )
  }

  if (!latex) {
    return null
  }

  return (
    <div className="formula-display">
      <InlineMath math={latex} />
    </div>
  )
}
