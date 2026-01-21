import { EXAMPLES } from '../constants/examples'

interface ExamplesSidebarProps {
  onExampleClick: (formula: string) => void
  isOpen?: boolean
}

export function ExamplesSidebar({ onExampleClick, isOpen = true }: ExamplesSidebarProps) {
  return (
    <div className={`examples-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <h2>Examples</h2>
      <div className="examples-list">
        {EXAMPLES.map((example, index) => (
          <button
            key={index}
            className="example-item"
            onClick={() => onExampleClick(example.formula)}
            title={example.description}
          >
            <div className="example-label">{example.label}</div>
            <div className="example-formula">{example.formula}</div>
            <div className="example-description">{example.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ExamplesSidebar
