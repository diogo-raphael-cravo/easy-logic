import { useState } from 'react'
import { FormulaInput } from './components/FormulaInput'
import { FormulaDisplay } from './components/FormulaDisplay'
import { ExamplesSidebar } from './components/ExamplesSidebar'
import { parseFormula } from './utils/formulaParser'
import './App.css'

interface FormulaResult {
  original: string
  latex: string
  error?: string
}

function App() {
  const [formulas, setFormulas] = useState<FormulaResult[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleFormulaSubmit = (formula: string) => {
    const result = parseFormula(formula)
    setFormulas([
      {
        original: formula,
        latex: result.latex,
        error: result.error,
      },
      ...formulas,
    ])
  }

  const handleExampleClick = (formula: string) => {
    handleFormulaSubmit(formula)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="app-layout">
      <button 
        className="sidebar-toggle" 
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <span className="hamburger"></span>
      </button>
      <ExamplesSidebar onExampleClick={handleExampleClick} isOpen={sidebarOpen} />
      
      <div className="app-container">
        <div className="header">
          <h1>Easy Logic</h1>
          <p>Propositional Logic Formula Renderer</p>
        </div>

        <FormulaInput onSubmit={handleFormulaSubmit} />

        <div className="formulas-history">
          {formulas.map((formula, index) => (
            <div key={index} className="formula-item">
              <div className="formula-original">
                <code>{formula.original}</code>
              </div>
              <FormulaDisplay latex={formula.latex} error={formula.error} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
