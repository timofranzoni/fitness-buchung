import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { fetchStudioBySlug } from '../lib/studioService.js'
import { fetchSettings } from '../lib/settingsService.js'
import { applyTheme } from '../lib/theme.js'

const DEFAULT_SETTINGS = {
  name: 'FitBook',
  logo_emoji: '⚡',
  logo_url: null,
  primary_color: '#ff6b1a',
  description: 'Dein Fitnessstudio. Deine Kurse. Deine Zeit.',
}

const StudioContext = createContext({
  studio: null,
  settings: DEFAULT_SETTINGS,
  setSettings: () => {},
  refresh: () => {},
  loading: true,
  notFound: false,
})

export function StudioProvider({ slug, children }) {
  const [studio, setStudio]     = useState(null)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  const refresh = useCallback(async (studioId) => {
    const s = await fetchSettings(studioId)
    if (s) {
      setSettings(s)
      applyTheme(s.primary_color)
      document.title = `${s.name} – Kursbuchung`
    }
  }, [])

  useEffect(() => {
    if (!slug) { setLoading(false); return }

    fetchStudioBySlug(slug).then(async st => {
      if (!st) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setStudio(st)
      await refresh(st.id)
      setLoading(false)
    })
  }, [slug, refresh])

  return (
    <StudioContext.Provider value={{ studio, settings, setSettings, refresh: () => refresh(studio?.id), loading, notFound }}>
      {children}
    </StudioContext.Provider>
  )
}

export function useStudio() { return useContext(StudioContext) }
