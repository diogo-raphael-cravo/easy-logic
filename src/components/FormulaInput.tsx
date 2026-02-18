import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'

interface FormulaInputProps {
  onSubmit: (formula: string) => void
}

export function FormulaInput({ onSubmit }: FormulaInputProps) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        onSubmit(input)
        setInput('')
      }
    }
  }

  const handleClear = () => {
    setInput('')
  }

  return (
    <div className="formula-input-container">
      <label htmlFor="formula-input">{t('formulaInput')}:</label>
      <div className="formula-input-wrapper">
        <input
          id="formula-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('formulaPlaceholder')}
          className="formula-input"
        />
        {input && (
          <Button
            onClick={handleClear}
            size="small"
            aria-label="Clear formula input"
            sx={{
              minWidth: 'auto',
              padding: '4px 8px',
              marginLeft: '8px'
            }}
            startIcon={<ClearIcon />}
          >
            {t('clear') || 'Clear'}
          </Button>
        )}
      </div>
      <div className="syntax-help">
        <p><strong>{t('syntaxHelp')}</strong></p>
      </div>
    </div>
  )
}
