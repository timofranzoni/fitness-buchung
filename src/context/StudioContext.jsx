import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { fetchSettings } from '../lib/settingsService.js'
import { applyTheme } from '../lib/theme.js'

const DEFAULT = {
  name: 'FitBook',
  logo_emoji: '⚡',
  logo_url: null,
  primary_color: '#ff6b1a',
  description: 'Dein Fitnessstudio. Deine Kurse. Deine Zeit.',
}

const StudioContext = createContext({ settings: DEFAULT, refresh: () => {} })

export function StudioProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT)

  const refresh = useCallback(async () => {
    const s = await fetchSettings()
    if (s) {
      setSettings(s)
      applyTheme(s.primary_color)
      document.title = `${s.name} – Kursbuchung`
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return (
    <StudioContext.Provider value={{ settings, setSettings, refresh }}>
      {children}
    </StudioContext.Provider>
  )
}

export function useStudio() { return useContext(StudioContext) }
