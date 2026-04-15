import { useState, useEffect } from 'react'
import { fetchCourses, createCourse, updateCourse, deleteCourse } from '../../lib/courseService.js'
import s from './admin.module.css'

const PRESET_COLORS = ['#ff6b1a','#a78bfa','#f87171','#34d399','#fbbf24','#fb923c','#e879f9','#60a5fa']
const PRESET_ICONS  = ['🧘','🏋️','🚴','🤸','🥊','💃','🏃','⚡','🎯','🔥']
const INTENSITIES   = ['Leicht','Mittel','Intensiv']
const INTENSITY_COLORS = { Leicht:'#34d399', Mittel:'#fbbf24', Intensiv:'#f87171' }

function CourseModal({ course, onSave, onClose }) {
  const isEdit = Boolean(course?.id)
  const [form, setForm] = useState({
    name: course?.name ?? '', icon: course?.icon ?? '🏋️',
    description: course?.description ?? '', intensity: course?.intensity ?? 'Mittel',
    duration: course?.duration ?? 60, color: course?.color ?? '#ff6b1a',
    slots: course?.slots ?? [],
  })
  const [newSlot, setNewSlot] = useState('')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function addSlot() {
    const t = newSlot.trim()
    if (!t) return
    if (!/^\d{2}:\d{2}$/.test(t)) { setError('Format: HH:MM — z.B. 09:00'); return }
    if (form.slots.includes(t)) { setError('Diese Uhrzeit existiert bereits.'); return }
    setError('')
    set('slots', [...form.slots, t].sort())
    setNewSlot('')
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Name ist Pflichtfeld.'); return }
    if (!form.slots.length) { setError('Mindestens eine Uhrzeit angeben.'); return }
    setSaving(true); setError('')
    try {
      isEdit ? await updateCourse(course.id, form) : await createCourse(form)
      onSave()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className={s.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <div className={s.modalHeader}>
          <h2 className={s.modalTitle}>{isEdit ? 'Kurs bearbeiten' : 'Neuen Kurs erstellen'}</h2>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={s.modalBody}>
          <div className={s.field}>
            <label className={s.label}>Icon</label>
            <div className={s.iconPicker}>
              {PRESET_ICONS.map(ic => (
                <button key={ic} type="button"
                  className={`${s.iconBtn} ${form.icon === ic ? s.iconBtnActive : ''}`}
                  onClick={() => set('icon', ic)}>{ic}</button>
              ))}
              <input className={`${s.input} ${s.iconInput}`} value={form.icon}
                onChange={e => set('icon', e.target.value)} maxLength={4} placeholder="…" />
            </div>
          </div>
          <div className={s.fieldRow}>
            <div className={s.field}>
              <label className={s.label}>Name *</label>
              <input className={s.input} value={form.name}
                onChange={e => set('name', e.target.value)} placeholder="z.B. Yoga Flow" />
            </div>
            <div className={s.field}>
              <label className={s.label}>Dauer (Min.)</label>
              <input type="number" className={s.input} value={form.duration}
                min={15} max={180} step={5} onChange={e => set('duration', Number(e.target.value))} />
            </div>
          </div>
          <div className={s.field}>
            <label className={s.label}>Beschreibung</label>
            <input className={s.input} value={form.description}
              onChange={e => set('description', e.target.value)} placeholder="Kurze Beschreibung" />
          </div>
          <div className={s.field}>
            <label className={s.label}>Intensität</label>
            <div className={s.intensityBtns}>
              {INTENSITIES.map(l => (
                <button key={l} type="button"
                  className={`${s.intensityBtn} ${form.intensity === l ? s.intensityBtnActive : ''}`}
                  onClick={() => set('intensity', l)}>{l}</button>
              ))}
            </div>
          </div>
          <div className={s.field}>
            <label className={s.label}>Farbe</label>
            <div className={s.colorPicker}>
              {PRESET_COLORS.map(c => (
                <button key={c} type="button"
                  className={`${s.colorSwatch} ${form.color === c ? s.colorSwatchActive : ''}`}
                  style={{ background: c }} onClick={() => set('color', c)} />
              ))}
              <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                style={{ width:32, height:32, border:'none', background:'none', cursor:'pointer', borderRadius:'50%' }} />
            </div>
          </div>
          <div className={s.field}>
            <label className={s.label}>Zeitslots *</label>
            <div className={s.tagList}>
              {form.slots.map(sl => (
                <span key={sl} className={s.tag}>
                  {sl} Uhr
                  <button className={s.tagRemove} onClick={() => set('slots', form.slots.filter(x => x !== sl))}>✕</button>
                </span>
              ))}
            </div>
            <div className={s.tagAdd}>
              <input className={s.input} style={{ width:100 }} placeholder="09:00"
                value={newSlot} maxLength={5}
                onChange={e => setNewSlot(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSlot())} />
              <button type="button" className={s.addTagBtn} onClick={addSlot}>+ Hinzufügen</button>
            </div>
          </div>
          {error && <div className={s.errorMsg}>{error}</div>}
        </div>
        <div className={s.modalFooter}>
          <button className={s.cancelBtn} onClick={onClose}>Abbrechen</button>
          <button className={s.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Wird gespeichert…' : isEdit ? 'Speichern' : 'Kurs erstellen'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CoursesTab({ onCountChange }) {
  const [courses, setCourses]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [modal, setModal]             = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  async function load() {
    setLoading(true)
    const c = await fetchCourses().catch(() => [])
    setCourses(c); onCountChange?.(c.length)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    await deleteCourse(id).catch(console.error)
    const next = courses.filter(c => c.id !== id)
    setCourses(next); onCountChange?.(next.length)
    setDeleteConfirm(null)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div className={s.toolbar}>
        <span className={s.resultCount}>{courses.length} Kurse</span>
        <button className={s.addBtn} onClick={() => setModal('new')}>+ Kurs hinzufügen</button>
      </div>

      {loading ? (
        <div className={s.loadingRow}><div className={s.spinner} /> Kurse werden geladen…</div>
      ) : courses.length === 0 ? (
        <div className={s.emptyState}>
          <div className={s.emptyIcon}>🏋️</div>
          <div>Noch keine Kurse angelegt.</div>
          <button className={s.addBtn} onClick={() => setModal('new')}>+ Ersten Kurs erstellen</button>
        </div>
      ) : (
        <div className={s.cardGrid}>
          {courses.map(c => (
            <div key={c.id} className={s.card} style={{ '--card-accent': c.color }}>
              <div className={s.cardTopRow}>
                <span style={{ fontSize:'2rem' }}>{c.icon}</span>
                <div className={s.cardActions}>
                  <button className={s.cardEditBtn} onClick={() => setModal(c)} title="Bearbeiten">✏️</button>
                  <button className={s.cardDeleteBtn} onClick={() => setDeleteConfirm(c)} title="Löschen">🗑</button>
                </div>
              </div>
              <div className={s.cardName}>{c.name}</div>
              <div className={s.cardSub}>{c.description}</div>
              <div className={s.cardMeta}>
                <span style={{ color: INTENSITY_COLORS[c.intensity] }}>● {c.intensity}</span>
                <span>{c.duration} Min.</span>
                <span>{c.slots?.length ?? 0} Zeiten</span>
              </div>
              <div className={s.chipRow}>
                {(c.slots ?? []).map(sl => <span key={sl} className={s.chipSmall}>{sl}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <CourseModal
          course={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load() }}
        />
      )}

      {deleteConfirm && (
        <div className={s.modalOverlay}>
          <div className={s.confirmModal}>
            <div className={s.confirmIcon}>⚠️</div>
            <h3 className={s.confirmTitle}>Kurs löschen?</h3>
            <p className={s.confirmText}><strong>{deleteConfirm.icon} {deleteConfirm.name}</strong> wird unwiderruflich gelöscht.</p>
            <div className={s.confirmActions}>
              <button className={s.cancelBtn} onClick={() => setDeleteConfirm(null)}>Abbrechen</button>
              <button className={s.confirmDeleteBtn} onClick={() => handleDelete(deleteConfirm.id)}>Löschen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
