import { useState, useEffect } from 'react'
import { fetchSettings, saveSettings } from '../../lib/settingsService.js'
import { applyTheme } from '../../lib/theme.js'
import { useStudio } from '../../context/StudioContext.jsx'
import s from './admin.module.css'
import ts from './SettingsTab.module.css'

const PRESET_COLORS = [
  { hex:'#ff6b1a', name:'Orange'    },
  { hex:'#3b82f6', name:'Blau'      },
  { hex:'#8b5cf6', name:'Violett'   },
  { hex:'#10b981', name:'Grün'      },
  { hex:'#ef4444', name:'Rot'       },
  { hex:'#f59e0b', name:'Gelb'      },
  { hex:'#ec4899', name:'Pink'      },
  { hex:'#06b6d4', name:'Cyan'      },
]

export default function SettingsTab() {
  const { refresh } = useStudio()
  const [form, setForm] = useState({
    name: 'FitBook', logo_emoji: '⚡', logo_url: '', primary_color: '#ff6b1a', description: '',
  })
  const [previewColor, setPreviewColor] = useState('#ff6b1a')
  const [saving, setSaving]             = useState(false)
  const [saved, setSaved]               = useState(false)
  const [error, setError]               = useState('')

  useEffect(() => {
    fetchSettings().then(s => {
      if (s) { setForm({ name: s.name, logo_emoji: s.logo_emoji ?? '⚡', logo_url: s.logo_url ?? '', primary_color: s.primary_color, description: s.description ?? '' }); setPreviewColor(s.primary_color) }
    })
  }, [])

  function handleColorChange(hex) {
    setForm(f => ({ ...f, primary_color: hex }))
    setPreviewColor(hex)
    applyTheme(hex) // Live-Vorschau sofort anwenden
  }

  async function handleSave() {
    setSaving(true); setError(''); setSaved(false)
    try {
      await saveSettings({ ...form, logo_url: form.logo_url || null })
      await refresh()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className={ts.page}>

      {/* Studio-Profil */}
      <div className={ts.section}>
        <div className={ts.sectionTitle}>Studio-Profil</div>
        <div className={ts.sectionBody}>
          <div className={s.fieldRow}>
            <div className={s.field}>
              <label className={s.label}>Studio-Name</label>
              <input className={s.input} value={form.name}
                onChange={e => set('name', e.target.value)} placeholder="FitBook" />
            </div>
            <div className={s.field}>
              <label className={s.label}>Logo-Emoji</label>
              <input className={s.input} value={form.logo_emoji}
                onChange={e => set('logo_emoji', e.target.value)}
                placeholder="⚡" maxLength={4} style={{ fontSize:'1.3rem' }} />
            </div>
          </div>
          <div className={s.field}>
            <label className={s.label}>Logo-URL (optional – überschreibt Emoji)</label>
            <input className={s.input} value={form.logo_url}
              onChange={e => set('logo_url', e.target.value)}
              placeholder="https://…/logo.png" />
            {form.logo_url && (
              <img src={form.logo_url} alt="Logo-Vorschau"
                style={{ height:48, marginTop:'0.5rem', borderRadius:8, objectFit:'contain' }}
                onError={e => e.currentTarget.style.display = 'none'} />
            )}
          </div>
          <div className={s.field}>
            <label className={s.label}>Beschreibung (wird im Footer angezeigt)</label>
            <textarea className={s.textarea} value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Dein Fitnessstudio. Deine Kurse. Deine Zeit."
              rows={2} />
          </div>
        </div>
      </div>

      {/* Primärfarbe */}
      <div className={ts.section}>
        <div className={ts.sectionTitle}>Design & Farben</div>
        <div className={ts.sectionBody}>
          <div className={ts.colorSection}>
            <div className={ts.colorLeft}>
              <label className={s.label}>Primärfarbe</label>
              <p className={ts.colorHint}>Wird sofort als Live-Vorschau in der gesamten App angezeigt.</p>
              <div className={ts.presetColors}>
                {PRESET_COLORS.map(p => (
                  <button key={p.hex} type="button" className={ts.presetBtn}
                    style={{ '--pc': p.hex, outline: previewColor === p.hex ? `2px solid ${p.hex}` : 'none' }}
                    onClick={() => handleColorChange(p.hex)}
                    title={p.name}>
                    <span className={ts.presetSwatch} style={{ background: p.hex }} />
                    <span className={ts.presetName}>{p.name}</span>
                  </button>
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginTop:'0.75rem' }}>
                <input type="color" value={previewColor}
                  onChange={e => handleColorChange(e.target.value)}
                  style={{ width:44, height:44, border:'2px solid var(--border)', borderRadius:10, cursor:'pointer', background:'none', padding:2 }} />
                <input className={s.input} style={{ width:120, fontFamily:'monospace' }}
                  value={previewColor}
                  onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) handleColorChange(e.target.value) }} />
              </div>
            </div>

            {/* Live-Vorschau */}
            <div className={ts.previewPanel}>
              <div className={ts.previewLabel}>Live-Vorschau</div>
              <div className={ts.previewHeader}>
                <span className={ts.previewLogo}>
                  {form.logo_url
                    ? <img src={form.logo_url} alt="" style={{ height:22, borderRadius:4 }}
                        onError={e => e.currentTarget.style.display='none'} />
                    : form.logo_emoji}
                  {' '}{form.name}
                </span>
                <a className={ts.previewCta} style={{ background: previewColor }}>Kurs buchen</a>
              </div>
              <div className={ts.previewElements}>
                <button className={ts.previewPrimaryBtn} style={{ background: previewColor }}>
                  Jetzt buchen →
                </button>
                <button className={ts.previewOutlineBtn} style={{ borderColor: previewColor, color: previewColor }}>
                  Mehr erfahren
                </button>
                <div className={ts.previewBadge} style={{ background: `${previewColor}22`, border: `1px solid ${previewColor}55`, color: previewColor }}>
                  🔥 Neuer Kurs
                </div>
                <div className={ts.previewAccentBar} style={{ background: previewColor }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className={s.errorMsg}>{error}</div>}

      <div className={ts.saveRow}>
        {saved && <span className={ts.savedMsg}>✓ Einstellungen gespeichert</span>}
        <button className={s.saveBtn} style={{ padding:'0.875rem 2rem', fontSize:'0.95rem' }}
          onClick={handleSave} disabled={saving}>
          {saving ? 'Wird gespeichert…' : 'Einstellungen speichern'}
        </button>
      </div>
    </div>
  )
}
