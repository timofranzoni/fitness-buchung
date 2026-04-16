import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { fetchContent, saveContent } from '../lib/contentService.js'

// ── Default-Inhalte (Fallback wenn noch nichts in DB) ────────────────────────

export const DEFAULT_CONTENT = {
  hero_badge:    '🔥 Jetzt bis zu 30% Rabatt im April',
  hero_headline: 'Dein Fitness-',
  hero_accent:   'Ziel erreichen.',
  hero_subtext:  'Erstklassige Kurse, motivierte Trainer und eine Community, die dich antreibt. Buch jetzt deinen ersten Kurs — kostenlos.',
  stats: [
    { value: '2.400+', label: 'Aktive Mitglieder'     },
    { value: '18',     label: 'Kurse pro Woche'        },
    { value: '6',      label: 'Zertifizierte Trainer'  },
    { value: '98%',    label: 'Zufriedenheitsrate'     },
  ],
  courses_eyebrow: 'Was wir bieten',
  courses_title:   'Unsere Kurse',
  trainers_eyebrow:'Dein Team',
  trainers_title:  'Unsere Trainer',
  cta_headline:    'Bereit loszulegen?',
  cta_subtext:     'Buch deinen ersten Kurs heute – ganz ohne Mitgliedschaft.',
  plans: [
    { id: 'starter', name: 'Starter', tagline: 'Perfekt zum Einsteigen',       price: 29 },
    { id: 'pro',     name: 'Pro',     tagline: 'Unser beliebtestes Angebot',   price: 59 },
    { id: 'elite',   name: 'Elite',   tagline: 'Das komplette Paket',          price: 99 },
  ],
}

// ── Path-Utilities ────────────────────────────────────────────────────────────

export function getByPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)
}

function setByPath(obj, path, value) {
  const keys  = path.split('.')
  const clone = JSON.parse(JSON.stringify(obj))
  let cur     = clone
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] == null) cur[keys[i]] = {}
    cur = cur[keys[i]]
  }
  cur[keys[keys.length - 1]] = value
  return clone
}

// ── Context ───────────────────────────────────────────────────────────────────

const ContentContext = createContext({
  content:     DEFAULT_CONTENT,
  editMode:    false,
  setEditMode: () => {},
  isAdmin:     false,
  updateField: () => {},
  save:        async () => {},
  saving:      false,
  dirty:       false,
})

export function ContentProvider({ studioId, children }) {
  const [content,  setContent]  = useState(DEFAULT_CONTENT)
  const [editMode, setEditMode] = useState(false)
  const [isAdmin,  setIsAdmin]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [dirty,    setDirty]    = useState(false)

  // Content aus DB laden
  useEffect(() => {
    if (!studioId) return
    fetchContent(studioId).then(c => {
      if (c && Object.keys(c).length > 0) {
        setContent(prev => deepMerge(prev, c))
      }
    })
  }, [studioId])

  // Admin-Status prüfen + live halten
  const checkAdmin = useCallback(async (session) => {
    if (!session || !studioId) { setIsAdmin(false); return }
    const { data } = await supabase
      .from('studio_users')
      .select('role, studio_id')
      .eq('user_id', session.user.id)
    if (!data) return
    const superadmin   = data.some(r => r.role === 'superadmin')
    const studioAdmin  = data.some(r => r.studio_id === studioId)
    setIsAdmin(superadmin || studioAdmin)
  }, [studioId])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => checkAdmin(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      checkAdmin(session)
      if (!session) setEditMode(false)
    })
    return () => subscription.unsubscribe()
  }, [checkAdmin])

  // Edit-Modus: body-Klasse + padding für Toolbar
  useEffect(() => {
    document.body.classList.toggle('live-editor-active', editMode)
    return () => document.body.classList.remove('live-editor-active')
  }, [editMode])

  function updateField(path, value) {
    setContent(prev => setByPath(prev, path, value))
    setDirty(true)
  }

  async function save() {
    if (!studioId) return
    setSaving(true)
    try {
      await saveContent(studioId, content)
      setDirty(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <ContentContext.Provider value={{ content, editMode, setEditMode, isAdmin, updateField, save, saving, dirty }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() { return useContext(ContentContext) }

// ── Deep-Merge Utility ────────────────────────────────────────────────────────
function deepMerge(base, override) {
  const result = { ...base }
  for (const key of Object.keys(override)) {
    if (Array.isArray(override[key]) && Array.isArray(base[key])) {
      result[key] = base[key].map((item, i) =>
        override[key][i] != null && typeof override[key][i] === 'object'
          ? { ...item, ...override[key][i] }
          : override[key][i] ?? item
      )
    } else if (typeof override[key] === 'object' && override[key] !== null && !Array.isArray(override[key])) {
      result[key] = deepMerge(base[key] ?? {}, override[key])
    } else {
      result[key] = override[key]
    }
  }
  return result
}
