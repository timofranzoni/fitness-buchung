import { useState, useEffect } from 'react'
import { fetchTrainers, createTrainer, updateTrainer, deleteTrainer } from '../../lib/trainerService.js'
import s from './admin.module.css'

const PRESET_COLORS = ['#ff6b1a','#a78bfa','#f87171','#34d399','#fbbf24','#fb923c','#e879f9','#60a5fa']

function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0,2)
}

function TrainerModal({ trainer, onSave, onClose }) {
  const isEdit = Boolean(trainer?.id)
  const [form, setForm] = useState({
    name:           trainer?.name           ?? '',
    role:           trainer?.role           ?? '',
    photo_url:      trainer?.photo_url      ?? '',
    bio:            trainer?.bio            ?? '',
    experience:     trainer?.experience     ?? '',
    rating:         trainer?.rating         ?? 5.0,
    reviews:        trainer?.reviews        ?? 0,
    color:          trainer?.color          ?? '#ff6b1a',
    certifications: trainer?.certifications ?? [],
    courses:        trainer?.courses        ?? [],
    schedule:       trainer?.schedule       ?? [],
  })
  const [inputs, setInputs] = useState({ cert:'', course:'', slot:'' })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function addTag(field, key) {
    const val = inputs[key].trim()
    if (!val || form[field].includes(val)) return
    set(field, [...form[field], val])
    setInputs(i => ({ ...i, [key]: '' }))
  }
  function removeTag(field, val) { set(field, form[field].filter(x => x !== val)) }

  async function handleSave() {
    if (!form.name.trim()) { setError('Name ist Pflichtfeld.'); return }
    setSaving(true); setError('')
    try {
      isEdit ? await updateTrainer(trainer.id, form) : await createTrainer(form)
      onSave()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className={s.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <div className={s.modalHeader}>
          <h2 className={s.modalTitle}>{isEdit ? 'Trainer bearbeiten' : 'Trainer hinzufügen'}</h2>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={s.modalBody}>

          {/* Avatar Preview */}
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{
              width:64, height:64, borderRadius:'50%',
              background: `linear-gradient(135deg, ${form.color}, rgba(0,0,0,0.3))`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize: form.photo_url ? 0 : '1.2rem', fontWeight:800, color:'#fff',
              overflow:'hidden', flexShrink:0,
            }}>
              {form.photo_url
                ? <img src={form.photo_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={e => { e.currentTarget.style.display = 'none' }} />
                : initials(form.name || '?')}
            </div>
            <div className={s.field} style={{ flex:1 }}>
              <label className={s.label}>Foto-URL (optional)</label>
              <input className={s.input} value={form.photo_url}
                onChange={e => set('photo_url', e.target.value)}
                placeholder="https://…/foto.jpg" />
            </div>
          </div>

          <div className={s.fieldRow}>
            <div className={s.field}>
              <label className={s.label}>Name *</label>
              <input className={s.input} value={form.name}
                onChange={e => set('name', e.target.value)} placeholder="Max Mustermann" />
            </div>
            <div className={s.field}>
              <label className={s.label}>Spezialgebiet / Rolle</label>
              <input className={s.input} value={form.role}
                onChange={e => set('role', e.target.value)} placeholder="Yoga & Pilates" />
            </div>
          </div>

          <div className={s.field}>
            <label className={s.label}>Bio</label>
            <textarea className={s.textarea} value={form.bio}
              onChange={e => set('bio', e.target.value)}
              placeholder="Kurze Beschreibung des Trainers…" rows={3} />
          </div>

          <div className={s.fieldRow}>
            <div className={s.field}>
              <label className={s.label}>Erfahrung</label>
              <input className={s.input} value={form.experience}
                onChange={e => set('experience', e.target.value)} placeholder="z.B. 5 Jahre" />
            </div>
            <div className={s.field}>
              <label className={s.label}>Farbe</label>
              <div className={s.colorPicker}>
                {PRESET_COLORS.map(c => (
                  <button key={c} type="button"
                    className={`${s.colorSwatch} ${form.color === c ? s.colorSwatchActive : ''}`}
                    style={{ background:c }} onClick={() => set('color', c)} />
                ))}
                <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                  style={{ width:28, height:28, border:'none', background:'none', cursor:'pointer', borderRadius:'50%' }} />
              </div>
            </div>
          </div>

          <div className={s.fieldRow}>
            <div className={s.field}>
              <label className={s.label}>Bewertung (0–5)</label>
              <input type="number" className={s.input} value={form.rating}
                min={0} max={5} step={0.1} onChange={e => set('rating', parseFloat(e.target.value))} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Anzahl Bewertungen</label>
              <input type="number" className={s.input} value={form.reviews}
                min={0} step={1} onChange={e => set('reviews', parseInt(e.target.value))} />
            </div>
          </div>

          {/* Zertifikate */}
          <div className={s.field}>
            <label className={s.label}>Zertifikate</label>
            <div className={s.tagList}>
              {form.certifications.map(c => (
                <span key={c} className={s.tag}>{c}
                  <button className={s.tagRemove} onClick={() => removeTag('certifications', c)}>✕</button>
                </span>
              ))}
            </div>
            <div className={s.tagAdd}>
              <input className={s.input} style={{ flex:1 }} placeholder="z.B. CrossFit L2"
                value={inputs.cert}
                onChange={e => setInputs(i => ({ ...i, cert: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('certifications','cert'))} />
              <button type="button" className={s.addTagBtn} onClick={() => addTag('certifications','cert')}>+ Hinzufügen</button>
            </div>
          </div>

          {/* Kurse */}
          <div className={s.field}>
            <label className={s.label}>Kurse (Zuordnung)</label>
            <div className={s.tagList}>
              {form.courses.map(c => (
                <span key={c} className={s.tag}>{c}
                  <button className={s.tagRemove} onClick={() => removeTag('courses', c)}>✕</button>
                </span>
              ))}
            </div>
            <div className={s.tagAdd}>
              <input className={s.input} style={{ flex:1 }} placeholder="z.B. Yoga Flow"
                value={inputs.course}
                onChange={e => setInputs(i => ({ ...i, course: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('courses','course'))} />
              <button type="button" className={s.addTagBtn} onClick={() => addTag('courses','course')}>+ Hinzufügen</button>
            </div>
          </div>

          {/* Stundenplan */}
          <div className={s.field}>
            <label className={s.label}>Stundenplan (z.B. Mo 08:00)</label>
            <div className={s.tagList}>
              {form.schedule.map(sl => (
                <span key={sl} className={s.tag}>{sl}
                  <button className={s.tagRemove} onClick={() => removeTag('schedule', sl)}>✕</button>
                </span>
              ))}
            </div>
            <div className={s.tagAdd}>
              <input className={s.input} style={{ flex:1 }} placeholder="Mo 08:00"
                value={inputs.slot}
                onChange={e => setInputs(i => ({ ...i, slot: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('schedule','slot'))} />
              <button type="button" className={s.addTagBtn} onClick={() => addTag('schedule','slot')}>+ Hinzufügen</button>
            </div>
          </div>

          {error && <div className={s.errorMsg}>{error}</div>}
        </div>
        <div className={s.modalFooter}>
          <button className={s.cancelBtn} onClick={onClose}>Abbrechen</button>
          <button className={s.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Wird gespeichert…' : isEdit ? 'Speichern' : 'Trainer hinzufügen'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TrainersTab({ onCountChange }) {
  const [trainers, setTrainers]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [modal, setModal]               = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  async function load() {
    setLoading(true)
    const t = await fetchTrainers().catch(() => [])
    setTrainers(t); onCountChange?.(t.length)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    await deleteTrainer(id).catch(console.error)
    const next = trainers.filter(t => t.id !== id)
    setTrainers(next); onCountChange?.(next.length)
    setDeleteConfirm(null)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div className={s.toolbar}>
        <span className={s.resultCount}>{trainers.length} Trainer</span>
        <button className={s.addBtn} onClick={() => setModal('new')}>+ Trainer hinzufügen</button>
      </div>

      {loading ? (
        <div className={s.loadingRow}><div className={s.spinner} /> Trainer werden geladen…</div>
      ) : trainers.length === 0 ? (
        <div className={s.emptyState}>
          <div className={s.emptyIcon}>👥</div>
          <div>Noch keine Trainer angelegt.</div>
          <button className={s.addBtn} onClick={() => setModal('new')}>+ Ersten Trainer hinzufügen</button>
        </div>
      ) : (
        <div className={s.cardGrid}>
          {trainers.map(t => (
            <div key={t.id} className={s.card} style={{ '--card-accent': t.color }}>
              <div className={s.cardTopRow}>
                <div style={{
                  width:52, height:52, borderRadius:'50%',
                  background: `linear-gradient(135deg, ${t.color}, rgba(0,0,0,0.3))`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  overflow:'hidden', flexShrink:0,
                }}>
                  {t.photo_url
                    ? <img src={t.photo_url} alt={t.name}
                        style={{ width:'100%', height:'100%', objectFit:'cover' }}
                        onError={e => { e.currentTarget.style.display='none'; e.currentTarget.parentElement.innerHTML = `<span style="font-size:1rem;font-weight:800;color:#fff">${initials(t.name)}</span>` }} />
                    : <span style={{ fontSize:'1rem', fontWeight:800, color:'#fff' }}>{initials(t.name)}</span>
                  }
                </div>
                <div className={s.cardActions}>
                  <button className={s.cardEditBtn} onClick={() => setModal(t)} title="Bearbeiten">✏️</button>
                  <button className={s.cardDeleteBtn} onClick={() => setDeleteConfirm(t)} title="Löschen">🗑</button>
                </div>
              </div>
              <div className={s.cardName}>{t.name}</div>
              <div className={s.cardSub} style={{ color: t.color }}>{t.role}</div>
              {t.experience && <div className={s.cardSub}>⚡ {t.experience} Erfahrung</div>}
              <div className={s.cardMeta}>
                <span style={{ color:'#fbbf24' }}>★ {t.rating}</span>
                <span>{t.reviews} Bewertungen</span>
              </div>
              <div className={s.chipRow}>
                {(t.courses ?? []).map(c => <span key={c} className={s.chipSmall}>{c}</span>)}
              </div>
              {t.bio && (
                <div className={s.cardSub} style={{ marginTop:'0.25rem', overflow:'hidden',
                  display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                  {t.bio}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <TrainerModal
          trainer={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load() }}
        />
      )}

      {deleteConfirm && (
        <div className={s.modalOverlay}>
          <div className={s.confirmModal}>
            <div className={s.confirmIcon}>⚠️</div>
            <h3 className={s.confirmTitle}>Trainer löschen?</h3>
            <p className={s.confirmText}><strong>{deleteConfirm.name}</strong> wird unwiderruflich gelöscht.</p>
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
