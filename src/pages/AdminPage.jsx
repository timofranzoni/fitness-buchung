import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { fetchAllBookings, deleteBooking } from '../lib/bookingService.js'
import { fetchCourses, createCourse, updateCourse, deleteCourse } from '../lib/courseService.js'
import styles from './AdminPage.module.css'

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

const PRESET_COLORS = ['#ff6b1a','#a78bfa','#f87171','#34d399','#fbbf24','#fb923c','#e879f9','#60a5fa']
const PRESET_ICONS  = ['🧘','🏋️','🚴','🤸','🥊','💃','🏃','⚡','🎯','🔥']
const INTENSITIES   = ['Leicht', 'Mittel', 'Intensiv']

function formatDate(iso) {
  if (!iso) return '–'
  return new Date(iso).toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' })
}
function formatDateTime(iso) {
  if (!iso) return '–'
  return new Date(iso).toLocaleString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
}

// ─── Login-Formular ───────────────────────────────────────────────────────────

function AdminLogin({ onLogin }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) {
      setError('Ungültige Anmeldedaten. Bitte prüfe E-Mail und Passwort.')
    } else {
      onLogin()
    }
  }

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>⚡ Fit<span>Book</span></div>
        <h1 className={styles.loginTitle}>Admin-Bereich</h1>
        <p className={styles.loginSubtitle}>Melde dich mit deinen Admin-Zugangsdaten an.</p>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.field}>
            <label className={styles.label}>E-Mail</label>
            <input
              type="email"
              className={styles.input}
              placeholder="admin@fitbook.de"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Passwort</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <div className={styles.errorMsg}>{error}</div>}
          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? 'Anmelden…' : 'Anmelden →'}
          </button>
        </form>
        <p className={styles.loginHint}>
          Admin-Account in Supabase Dashboard erstellen:<br />
          Authentication → Users → Add User
        </p>
      </div>
    </div>
  )
}

// ─── Kurs-Modal (Erstellen / Bearbeiten) ─────────────────────────────────────

function CourseModal({ course, onSave, onClose }) {
  const isEdit = Boolean(course?.id)
  const [form, setForm] = useState({
    name:        course?.name        ?? '',
    icon:        course?.icon        ?? '🏋️',
    description: course?.description ?? '',
    intensity:   course?.intensity   ?? 'Mittel',
    duration:    course?.duration    ?? 60,
    color:       course?.color       ?? '#ff6b1a',
    slots:       course?.slots       ?? [],
  })
  const [newSlot, setNewSlot] = useState('')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function addSlot() {
    const t = newSlot.trim()
    if (!t || form.slots.includes(t)) return
    if (!/^\d{2}:\d{2}$/.test(t)) { setError('Format: HH:MM (z.B. 09:00)'); return }
    setError('')
    set('slots', [...form.slots, t].sort())
    setNewSlot('')
  }

  function removeSlot(s) { set('slots', form.slots.filter(x => x !== s)) }

  async function handleSave() {
    if (!form.name.trim()) { setError('Name ist Pflichtfeld.'); return }
    if (form.slots.length === 0) { setError('Mindestens eine Uhrzeit angeben.'); return }
    setSaving(true)
    setError('')
    try {
      if (isEdit) {
        await updateCourse(course.id, form)
      } else {
        await createCourse(form)
      }
      onSave()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{isEdit ? 'Kurs bearbeiten' : 'Neuen Kurs erstellen'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          {/* Icon-Auswahl */}
          <div className={styles.field}>
            <label className={styles.label}>Icon</label>
            <div className={styles.iconPicker}>
              {PRESET_ICONS.map(ic => (
                <button key={ic} className={`${styles.iconBtn} ${form.icon === ic ? styles.iconBtnActive : ''}`}
                  onClick={() => set('icon', ic)} type="button">
                  {ic}
                </button>
              ))}
              <input
                type="text"
                className={styles.iconInput}
                value={form.icon}
                onChange={e => set('icon', e.target.value)}
                maxLength={4}
                placeholder="Emoji"
              />
            </div>
          </div>

          {/* Name */}
          <div className={styles.field}>
            <label className={styles.label}>Name *</label>
            <input type="text" className={styles.input} value={form.name}
              onChange={e => set('name', e.target.value)} placeholder="z.B. Yoga Flow" />
          </div>

          {/* Beschreibung */}
          <div className={styles.field}>
            <label className={styles.label}>Beschreibung</label>
            <input type="text" className={styles.input} value={form.description}
              onChange={e => set('description', e.target.value)} placeholder="Kurze Beschreibung" />
          </div>

          <div className={styles.fieldRow}>
            {/* Intensität */}
            <div className={styles.field}>
              <label className={styles.label}>Intensität</label>
              <div className={styles.intensityBtns}>
                {INTENSITIES.map(lvl => (
                  <button key={lvl} type="button"
                    className={`${styles.intensityBtn} ${form.intensity === lvl ? styles.intensityBtnActive : ''}`}
                    onClick={() => set('intensity', lvl)}>{lvl}</button>
                ))}
              </div>
            </div>

            {/* Dauer */}
            <div className={styles.field}>
              <label className={styles.label}>Dauer (Min.)</label>
              <input type="number" className={styles.input} value={form.duration} min={15} max={180} step={5}
                onChange={e => set('duration', Number(e.target.value))} />
            </div>
          </div>

          {/* Farbe */}
          <div className={styles.field}>
            <label className={styles.label}>Farbe</label>
            <div className={styles.colorPicker}>
              {PRESET_COLORS.map(c => (
                <button key={c} type="button"
                  className={`${styles.colorSwatch} ${form.color === c ? styles.colorSwatchActive : ''}`}
                  style={{ background: c }} onClick={() => set('color', c)} />
              ))}
            </div>
          </div>

          {/* Zeitslots */}
          <div className={styles.field}>
            <label className={styles.label}>Zeitslots *</label>
            <div className={styles.slotsList}>
              {form.slots.map(s => (
                <span key={s} className={styles.slotChip}>
                  {s} <button className={styles.slotRemove} onClick={() => removeSlot(s)}>✕</button>
                </span>
              ))}
            </div>
            <div className={styles.slotAdd}>
              <input
                type="text" className={styles.input} placeholder="09:00"
                value={newSlot}
                onChange={e => setNewSlot(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSlot())}
                maxLength={5}
                style={{ width: '100px' }}
              />
              <button type="button" className={styles.addSlotBtn} onClick={addSlot}>+ Hinzufügen</button>
            </div>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Abbrechen</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Wird gespeichert…' : isEdit ? 'Änderungen speichern' : 'Kurs erstellen'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ onLogout }) {
  const [tab, setTab]             = useState('bookings')
  const [bookings, setBookings]   = useState([])
  const [courses, setCourses]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(null) // null | 'new' | courseObject
  const [deleteConfirm, setDeleteConfirm] = useState(null) // { type, id, name }

  const loadData = useCallback(async () => {
    setLoading(true)
    const [b, c] = await Promise.all([
      fetchAllBookings().catch(() => []),
      fetchCourses().catch(() => []),
    ])
    setBookings(b)
    setCourses(c)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function handleDeleteBooking(id) {
    await deleteBooking(id).catch(console.error)
    setBookings(b => b.filter(x => x.id !== id))
    setDeleteConfirm(null)
  }

  async function handleDeleteCourse(id) {
    await deleteCourse(id).catch(console.error)
    setCourses(c => c.filter(x => x.id !== id))
    setDeleteConfirm(null)
  }

  const filteredBookings = bookings.filter(b =>
    !search ||
    b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
    b.course_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.booking_id?.toLowerCase().includes(search.toLowerCase())
  )

  // Stats
  const today = new Date().toISOString().split('T')[0]
  const todayCount = bookings.filter(b => b.booking_date === today).length
  const topCourse = bookings.length
    ? Object.entries(bookings.reduce((acc, b) => { acc[b.course_name] = (acc[b.course_name] || 0) + 1; return acc }, {}))
        .sort((a, b) => b[1] - a[1])[0]?.[0]
    : '–'

  return (
    <div className={styles.dashboard}>
      {/* Admin Header */}
      <header className={styles.adminHeader}>
        <div className={styles.adminLogo}>⚡ Fit<span>Book</span> <span className={styles.adminBadge}>Admin</span></div>
        <button className={styles.logoutBtn} onClick={onLogout}>Abmelden</button>
      </header>

      <div className={styles.dashContent}>
        {/* Stats */}
        <div className={styles.statsRow}>
          {[
            { label: 'Buchungen gesamt', value: bookings.length, icon: '📋' },
            { label: 'Heute gebucht',    value: todayCount,       icon: '📅' },
            { label: 'Kurse im Angebot', value: courses.length,   icon: '🏋️' },
            { label: 'Beliebtester Kurs',value: topCourse,        icon: '🔥' },
          ].map(s => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statIcon}>{s.icon}</span>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tab Bar */}
        <div className={styles.tabBar}>
          <button className={`${styles.tab} ${tab === 'bookings' ? styles.tabActive : ''}`} onClick={() => setTab('bookings')}>
            📋 Buchungen <span className={styles.tabCount}>{bookings.length}</span>
          </button>
          <button className={`${styles.tab} ${tab === 'courses' ? styles.tabActive : ''}`} onClick={() => setTab('courses')}>
            🏋️ Kurse <span className={styles.tabCount}>{courses.length}</span>
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} /> Daten werden geladen…
          </div>
        ) : (
          <>
            {/* ── Buchungen ── */}
            {tab === 'bookings' && (
              <div className={styles.section}>
                <div className={styles.sectionToolbar}>
                  <input
                    type="search"
                    className={styles.searchInput}
                    placeholder="Name, E-Mail oder Kurs suchen…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <span className={styles.resultCount}>{filteredBookings.length} Einträge</span>
                </div>

                {filteredBookings.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📋</div>
                    <div>{search ? 'Keine Ergebnisse für diese Suche.' : 'Noch keine Buchungen vorhanden.'}</div>
                  </div>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Buchungs-ID</th>
                          <th>Name</th>
                          <th>E-Mail</th>
                          <th>Kurs</th>
                          <th>Datum</th>
                          <th>Uhrzeit</th>
                          <th>Erstellt</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map(b => (
                          <tr key={b.id}>
                            <td><code className={styles.bookingId}>#{b.booking_id}</code></td>
                            <td className={styles.tdBold}>{b.customer_name}</td>
                            <td className={styles.tdMuted}>{b.customer_email}</td>
                            <td><span className={styles.courseChip}>{b.course_icon} {b.course_name}</span></td>
                            <td>{formatDate(b.booking_date)}</td>
                            <td>{b.slot_time} Uhr</td>
                            <td className={styles.tdMuted}>{formatDateTime(b.created_at)}</td>
                            <td>
                              <button className={styles.deleteRowBtn}
                                onClick={() => setDeleteConfirm({ type: 'booking', id: b.id, name: `Buchung von ${b.customer_name}` })}>
                                🗑
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── Kurse ── */}
            {tab === 'courses' && (
              <div className={styles.section}>
                <div className={styles.sectionToolbar}>
                  <span className={styles.resultCount}>{courses.length} Kurse</span>
                  <button className={styles.addBtn} onClick={() => setModal('new')}>+ Kurs hinzufügen</button>
                </div>

                {courses.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🏋️</div>
                    <div>Noch keine Kurse angelegt.</div>
                    <button className={styles.addBtn} onClick={() => setModal('new')}>+ Ersten Kurs erstellen</button>
                  </div>
                ) : (
                  <div className={styles.courseGrid}>
                    {courses.map(c => (
                      <div key={c.id} className={styles.courseCard} style={{ '--cc': c.color }}>
                        <div className={styles.courseCardTop}>
                          <span className={styles.courseCardIcon}>{c.icon}</span>
                          <div className={styles.courseCardActions}>
                            <button className={styles.editBtn} onClick={() => setModal(c)}>✏️</button>
                            <button className={styles.deleteBtn}
                              onClick={() => setDeleteConfirm({ type: 'course', id: c.id, name: c.name })}>
                              🗑
                            </button>
                          </div>
                        </div>
                        <div className={styles.courseCardName}>{c.name}</div>
                        <div className={styles.courseCardDesc}>{c.description}</div>
                        <div className={styles.courseCardMeta}>
                          <span style={{ color: c.color === '#34d399' ? '#34d399' : c.color === '#f87171' ? '#f87171' : '#fbbf24' }}>
                            ● {c.intensity}
                          </span>
                          <span>{c.duration} Min.</span>
                          <span>{c.slots?.length ?? 0} Zeiten</span>
                        </div>
                        <div className={styles.courseCardSlots}>
                          {(c.slots ?? []).map(s => <span key={s} className={styles.slotChipSmall}>{s}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Kurs-Modal */}
      {modal && (
        <CourseModal
          course={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); loadData() }}
        />
      )}

      {/* Löschen-Bestätigung */}
      {deleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <div className={styles.confirmIcon}>⚠️</div>
            <h3 className={styles.confirmTitle}>Wirklich löschen?</h3>
            <p className={styles.confirmText}><strong>{deleteConfirm.name}</strong> wird unwiderruflich gelöscht.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>Abbrechen</button>
              <button className={styles.confirmDeleteBtn} onClick={() =>
                deleteConfirm.type === 'booking'
                  ? handleDeleteBooking(deleteConfirm.id)
                  : handleDeleteCourse(deleteConfirm.id)
              }>
                Ja, löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Haupt-AdminPage ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [session, setSession] = useState(undefined) // undefined = lädt noch

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (session === undefined) {
    return (
      <div className={styles.fullCenter}>
        <div className={styles.spinner} />
      </div>
    )
  }

  if (!session) {
    return <AdminLogin onLogin={() => {}} />
  }

  return <Dashboard onLogout={handleLogout} />
}
