import { beforeEach, describe, expect, it, vi } from 'vitest'

const setNavigatorLanguage = (language: string, languages?: string[]) => {
  Object.defineProperty(window.navigator, 'language', {
    configurable: true,
    value: language,
  })

  Object.defineProperty(window.navigator, 'languages', {
    configurable: true,
    value: languages,
  })
}

describe('i18n config language detection', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('uses pt-BR when navigator.language starts with pt', async () => {
    setNavigatorLanguage('pt-PT', ['pt-PT'])

    const i18n = (await import('./config')).default
    expect(i18n.language).toBe('pt-BR')
  })

  it('uses en when navigator.language does not start with pt', async () => {
    setNavigatorLanguage('en-US', ['en-US'])

    const i18n = (await import('./config')).default
    expect(i18n.language).toBe('en')
  })

  it('uses navigator.languages first entry when navigator.language is empty', async () => {
    setNavigatorLanguage('', ['pt-BR'])

    const i18n = (await import('./config')).default
    expect(i18n.language).toBe('pt-BR')
  })
})
