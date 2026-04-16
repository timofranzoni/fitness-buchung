import { useState, useRef, useEffect } from 'react'
import { useContent, getByPath } from '../context/ContentContext.jsx'
import { applyTheme } from '../lib/theme.js'
import { useStudio } from '../context/StudioContext.jsx'
import { saveSettings } from '../lib/settingsService.js'
import s from './LiveEditor.module.css'

const PRESET_COLORS = [
  { hex: '#ff6b1a', name: 'Orange'  },
  { hex: '#3b82f6', name: 'Blau'    },
  { hex: '#8b5cf6', name: 'Violett' },
  { hex: '#10b981', name: 'Grün'    },
  { hex: '#ef4444', name: 'Rot'     },
  { hex: '#f59e0b', name: 'Gelb'    },
  { hex: '#ec4899', name: 'Pink'    },
  { hex: '#06b6d4', name: 'Cyan'    },
]

// ── Color Panel ──────────────────────────────────────────────────────────────

function ColorPanel({ onClose }) {
  const { settings, refresh } = useStudio()
  const { save }              = useContent()
  const { saveSettings }      = useStudioSettings()
  const [color, setColor]     = useState(settings.primary_color ?? '#ff6b1a')
  const ref = useRef()

  // Klick außerhalb → schließen
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  function apply(hex) {
    setColor(hex)
    applyTheme(hex)
  }

  async function handleSave() {
    await saveSettings(color)
    await refresh()
    onClose()
  }

  return (
    <div className={s.colorPanel} ref={ref}>
      <div className={s.colorPanelTitle}>Akzentfarbe</div>
      <div className={s.colorSwatches}>
        {PRESET_COLORS.map(p => (
          <button
            key={p.hex}
            className={`${s.colorSwatch} ${color === p.hex ? s.colorSwatchActive : ''}`}
            style={{ background: p.hex }}
            title={p.name}
            onClick={() => apply(p.hex)}
          />
        ))}
      </div>
      <div className={s.colorCustomRow}>
        <input
          type="color"
          value={color}
          onChange={e => apply(e.target.value)}
          style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
        />
        <input
          className={s.colorCustomInput}
          value={color}
          maxLength={7}
          onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) apply(e.target.value) }}
        />
        <button
          className={s.saveBtn}
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          onClick={handleSave}
        >
          OK
        </button>
      </div>
    </div>
  )
}

function useStudioSettings() {
  const { studio } = useStudio()
  return {
    saveSettings: (color) => saveSettings(studio?.id, { primary_color: color }),
  }
}

// ── Floating Toolbar ─────────────────────────────────────────────────────────

export function LiveToolbar() {
  const { editMode, setEditMode, isAdmin, save, saving, dirty } = useContent()
  const [showColor, setShowColor] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  if (!isAdmin) return null

  async function handleSave() {
    await save()
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2000)
  }

  if (!editMode) {
    return (
      <button className={s.floatBtn} onClick={() => setEditMode(true)}>
        <span className={s.floatBtnDot} />
        Seite bearbeiten
      </button>
    )
  }

  return (
    <>
      <div className={s.toolbar}>
        <div className={s.toolbarLeft}>
          <span className={s.toolbarBadge}>
            <span className={s.toolbarBadgeDot} />
            Bearbeitungsmodus
          </span>
          <span className={s.toolbarHint}>Klicke auf einen Text um ihn zu bearbeiten</span>
        </div>

        <div className={s.toolbarRight}>
          {/* Farbe */}
          <div className={s.colorPickerWrap}>
            <button className={s.toolbarBtn} onClick={() => setShowColor(v => !v)}>
              <span style={{ width:14, height:14, borderRadius:'50%', background:'var(--accent)', display:'inline-block' }} />
              Farbe
            </button>
            {showColor && <ColorPanel onClose={() => setShowColor(false)} />}
          </div>

          {/* Vorschau */}
          <button className={s.toolbarBtn} onClick={() => setEditMode(false)}>
            👁 Vorschau
          </button>

          {/* Speichern */}
          <button
            className={savedFlash ? s.saveBtnSaved : s.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              'Speichert…'
            ) : savedFlash ? (
              '✓ Gespeichert'
            ) : (
              <>{dirty && <span className={s.dirtyDot} />} Speichern</>
            )}
          </button>
        </div>
      </div>
      <div className={s.toolbarSpacer} />
    </>
  )
}

// ── EditableText ─────────────────────────────────────────────────────────────
// Universelle Komponente: field = dot-path ins content-Objekt
// tag     = HTML-Tag (default 'span')
// block   = true → textarea statt contentEditable
// number  = true → number input (für Preise)

export function ET({ field, tag: Tag = 'span', className, style, block, number, children }) {
  const { editMode, content, updateField } = useContent()
  const [editing, setEditing]  = useState(false)
  const editRef  = useRef()
  const value    = getByPath(content, field) ?? children ?? ''

  // Focus beim Aktivieren
  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus()
      if (editRef.current.select) editRef.current.select()
    }
  }, [editing])

  // Nicht im Edit-Modus → normal rendern
  if (!editMode) {
    return <Tag className={className} style={style}>{value}</Tag>
  }

  // Aktives Bearbeiten – Textarea (mehrzeilig)
  if (editing && block) {
    return (
      <textarea
        ref={editRef}
        className={s.editTextarea}
        style={style}
        defaultValue={value}
        rows={Math.max(2, String(value).split('\n').length + 1)}
        onBlur={e => { updateField(field, e.target.value); setEditing(false) }}
      />
    )
  }

  // Aktives Bearbeiten – Number Input
  if (editing && number) {
    return (
      <input
        ref={editRef}
        type="number"
        className={s.editInput}
        style={style}
        defaultValue={value}
        onBlur={e => { updateField(field, Number(e.target.value)); setEditing(false) }}
        onKeyDown={e => e.key === 'Enter' && setEditing(false)}
      />
    )
  }

  // Aktives Bearbeiten – ContentEditable (inline)
  if (editing) {
    return (
      <Tag
        ref={editRef}
        className={`${className ?? ''} ${s.editingActive}`}
        style={style}
        contentEditable
        suppressContentEditableWarning
        onBlur={e => { updateField(field, e.currentTarget.textContent); setEditing(false) }}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); editRef.current?.blur() } }}
      >
        {value}
      </Tag>
    )
  }

  // Edit-Modus, aber noch nicht aktiv bearbeitet → hover-Rahmen
  return (
    <Tag
      className={`${className ?? ''} ${block ? s.editableBlock : s.editable}`}
      style={style}
      onClick={() => setEditing(true)}
      title="Klicken zum Bearbeiten"
    >
      {value}
    </Tag>
  )
}
