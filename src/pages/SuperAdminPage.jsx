import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import {
  fetchAllStudios,
  createStudio,
  updateStudio,
  deleteStudio,
  assignStudioAdmin,
} from '../lib/studioService.js'
import styles from './AdminPage.module.css'
import s from '../components/admin/admin.module.css'

// ─── Login ────────────────────────────────────────────────────────────────────

function SuperLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) setError('Ungültige Anmeldedaten.')
  }

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>⚡ Fit<span>Book</span></div>
        <h1 className={styles.loginTitle}>SuperAdmin</h1>
        <p className={styles.loginSubtitle}>Nur für autorisierte Agentur-Zugänge.</p>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.loginField}>
            <label className={styles.loginLabel}>E-Mail</label>
            <input type="email" className={styles.loginInput}
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.loginField}>
            <label className={styles.loginLabel}>Passwort</label>
            <input type="password" className={styles.loginInput}
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className={styles.loginError}>{error}</div>}
          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? 'Anmelden…' : 'Anmelden →'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Kein SuperAdmin-Zugriff ──────────────────────────────────────────────────

function NotSuperAdmin({ onLogout }) {
  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <div style={{ fontSize:'3rem', textAlign:'center' }}>🔐</div>
        <h1 className={styles.loginTitle}>Kein SuperAdmin</h1>
        <p className={styles.loginSubtitle}>Dein Account hat keine SuperAdmin-Berechtigung.</p>
        <button className={styles.loginBtn} onClick={onLogout}>Abmelden</button>
      </div>
    </div>
  )
}

// ─── Studio-Modal ─────────────────────────────────────────────────────────────

function StudioModal({ studio, onSave, onClose }) {
  const isEdit = Boolean(studio?.id)
  const [form, setForm] = useState({
    name:       studio?.name       ?? '',
    slug:       studio?.slug       ?? '',
    ownerEmail: studio?.owner_email ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  function toSlug(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Name ist Pflichtfeld.'); return }
    if (!form.slug.trim()) { setError('Slug ist Pflichtfeld.'); return }
    if (!/^[a-z0-9-]+$/.test(form.slug)) { setError('Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.'); return }
    setSaving(true); setError('')
    try {
      if (isEdit) {
        await updateStudio(studio.id, { name: form.name, slug: form.slug, owner_email: form.ownerEmail })
      } else {
        await createStudio(form)
      }
      onSave()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className={s.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <div className={s.modalHeader}>
          <h2 className={s.modalTitle}>{isEdit ? 'Studio bearbeiten' : 'Neues Studio anlegen'}</h2>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={s.modalBody}>
          <div className={s.fieldRow}>
            <div className={s.field}>
              <label className={s.label}>Studio-Name *</label>
              <input className={s.input} value={form.name}
                onChange={e => {
                  const name = e.target.value
                  setForm(f => ({ ...f, name, slug: isEdit ? f.slug : toSlug(name) }))
                }}
                placeholder="z.B. FitCity München" />
            </div>
            <div className={s.field}>
              <label className={s.label}>URL-Slug *</label>
              <input className={s.input} value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                placeholder="z.B. fitcity-muenchen" />
              {form.slug && (
                <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:'0.25rem' }}>
                  URL: /studio/<strong>{form.slug}</strong>
                </div>
              )}
            </div>
          </div>
          <div className={s.field}>
            <label className={s.label}>Inhaber-E-Mail (optional)</label>
            <input className={s.input} type="email" value={form.ownerEmail}
              onChange={e => setForm(f => ({ ...f, ownerEmail: e.target.value }))}
              placeholder="kunde@firma.de" />
          </div>
          {error && <div className={s.errorMsg}>{error}</div>}
        </div>
        <div className={s.modalFooter}>
          <button className={s.cancelBtn} onClick={onClose}>Abbrechen</button>
          <button className={s.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Wird gespeichert…' : isEdit ? 'Speichern' : 'Studio anlegen'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Admin-Zuweisungs-Modal ───────────────────────────────────────────────────

function AssignModal({ studio, onClose }) {
  const [email, setEmail]   = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone]     = useState(false)
  const [error, setError]   = useState('')

  async function handleAssign() {
    if (!email.trim()) { setError('E-Mail ist Pflichtfeld.'); return }
    setSaving(true); setError('')
    try {
      await assignStudioAdmin(email.trim(), studio.id)
      setDone(true)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className={s.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <div className={s.modalHeader}>
          <h2 className={s.modalTitle}>Admin zuweisen – {studio.name}</h2>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={s.modalBody}>
          {done ? (
            <div style={{ textAlign:'center', padding:'1.5rem 0', color:'var(--text-secondary)' }}>
              <div style={{ fontSize:'2.5rem' }}>✅</div>
              <p style={{ marginTop:'0.5rem' }}><strong>{email}</strong> wurde als Admin für <strong>{studio.name}</strong> eingetragen.</p>
            </div>
          ) : (
            <>
              <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', marginBottom:'1rem' }}>
                Der Benutzer muss bereits in Supabase → Authentication → Users angelegt sein.
              </p>
              <div className={s.field}>
                <label className={s.label}>E-Mail des Benutzers *</label>
                <input className={s.input} type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@kunde.de" />
              </div>
              {error && <div className={s.errorMsg}>{error}</div>}
            </>
          )}
        </div>
        <div className={s.modalFooter}>
          <button className={s.cancelBtn} onClick={onClose}>{done ? 'Schließen' : 'Abbrechen'}</button>
          {!done && (
            <button className={s.saveBtn} onClick={handleAssign} disabled={saving}>
              {saving ? 'Wird zugewiesen…' : 'Admin zuweisen'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function SuperDashboard({ user, onLogout }) {
  const [studios, setStudios]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)   // 'new' | studio-object | null
  const [assignModal, setAssignModal] = useState(null) // studio-object | null
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  async function load() {
    setLoading(true)
    const list = await fetchAllStudios().catch(() => [])
    setStudios(list)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    await deleteStudio(id).catch(console.error)
    setStudios(s => s.filter(x => x.id !== id))
    setDeleteConfirm(null)
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.adminHeader}>
        <div className={styles.adminLogo}>
          ⚡ Fit<span>Book</span>
          <span className={styles.adminBadge} style={{ background:'#7c3aed' }}>SuperAdmin</span>
        </div>
        <div className={styles.adminHeaderRight}>
          <span className={styles.adminUserEmail}>{user?.email}</span>
          <button className={styles.logoutBtn} onClick={onLogout}>Abmelden</button>
        </div>
      </header>

      <div className={styles.dashContent}>
        {/* Toolbar */}
        <div className={s.toolbar} style={{ marginBottom:'1.5rem' }}>
          <div>
            <h2 style={{ color:'var(--text-primary)', fontWeight:700, fontSize:'1.25rem', margin:0 }}>Alle Studios</h2>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem', margin:'0.25rem 0 0' }}>
              {studios.length} Studio{studios.length !== 1 ? 's' : ''} verwaltet
            </p>
          </div>
          <button className={s.addBtn} onClick={() => setModal('new')}>+ Neues Studio</button>
        </div>

        {loading ? (
          <div className={s.loadingRow}><div className={s.spinner} /> Studios werden geladen…</div>
        ) : studios.length === 0 ? (
          <div className={s.emptyState}>
            <div className={s.emptyIcon}>🏢</div>
            <div>Noch keine Studios angelegt.</div>
            <button className={s.addBtn} onClick={() => setModal('new')}>+ Erstes Studio anlegen</button>
          </div>
        ) : (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug / URL</th>
                  <th>Inhaber</th>
                  <th>Status</th>
                  <th>Erstellt</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {studios.map(studio => (
                  <tr key={studio.id}>
                    <td className={s.tdBold}>{studio.name}</td>
                    <td>
                      <a href={`/studio/${studio.slug}`} target="_blank" rel="noreferrer"
                        style={{ color:'var(--accent)', fontFamily:'monospace', fontSize:'0.85rem' }}>
                        /studio/{studio.slug}
                      </a>
                    </td>
                    <td className={s.tdMuted}>{studio.owner_email || '–'}</td>
                    <td>
                      <span style={{
                        display:'inline-block', padding:'0.2rem 0.6rem', borderRadius:20, fontSize:'0.75rem', fontWeight:600,
                        background: studio.active ? '#10b98120' : '#ef444420',
                        color:      studio.active ? '#10b981'   : '#ef4444',
                        border:     `1px solid ${studio.active ? '#10b98140' : '#ef444440'}`,
                      }}>
                        {studio.active ? '● Aktiv' : '● Inaktiv'}
                      </span>
                    </td>
                    <td className={s.tdMuted}>
                      {new Date(studio.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td style={{ display:'flex', gap:'0.5rem' }}>
                      <button className={s.cardEditBtn} title="Bearbeiten" onClick={() => setModal(studio)}>✏️</button>
                      <button className={s.cardEditBtn} title="Admin zuweisen" onClick={() => setAssignModal(studio)}
                        style={{ fontSize:'1rem' }}>👤</button>
                      <button className={`${s.iconRowBtn} ${s.iconRowBtnDanger}`} title="Löschen"
                        onClick={() => setDeleteConfirm(studio)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Hinweis-Box */}
        <div style={{
          marginTop:'2rem', padding:'1.25rem 1.5rem', borderRadius:12,
          background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.25)',
        }}>
          <h4 style={{ color:'#a78bfa', margin:'0 0 0.5rem', fontWeight:600 }}>So einen neuen Kunden einrichten:</h4>
          <ol style={{ color:'var(--text-secondary)', fontSize:'0.875rem', lineHeight:1.8, margin:0, paddingLeft:'1.25rem' }}>
            <li>Neues Studio anlegen (oben rechts)</li>
            <li>Kundenzugang in Supabase → Authentication → Users → Add User anlegen</li>
            <li>Auf das 👤-Symbol klicken und die E-Mail des Kunden eintragen</li>
            <li>Dem Kunden die URL <code style={{ color:'#a78bfa' }}>/studio/[slug]/admin</code> mitteilen</li>
          </ol>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <StudioModal
          studio={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load() }}
        />
      )}

      {assignModal && (
        <AssignModal
          studio={assignModal}
          onClose={() => setAssignModal(null)}
        />
      )}

      {deleteConfirm && (
        <div className={s.modalOverlay}>
          <div className={s.confirmModal}>
            <div className={s.confirmIcon}>⚠️</div>
            <h3 className={s.confirmTitle}>Studio löschen?</h3>
            <p className={s.confirmText}>
              <strong>{deleteConfirm.name}</strong> und alle zugehörigen Daten (Kurse, Buchungen, Trainer) werden unwiderruflich gelöscht.
            </p>
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

// ─── Haupt-Export ─────────────────────────────────────────────────────────────

export default function SuperAdminPage() {
  const [session, setSession]         = useState(undefined)
  const [isSuperadmin, setIsSuperadmin] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
      setIsSuperadmin(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) { setIsSuperadmin(null); return }
    supabase
      .from('studio_users')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'superadmin')
      .then(({ data }) => setIsSuperadmin(!!(data && data.length > 0)))
  }, [session])

  if (session === undefined || (session && isSuperadmin === null)) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:36, height:36, border:'3px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      </div>
    )
  }

  if (!session) return <SuperLogin />
  if (!isSuperadmin) return <NotSuperAdmin onLogout={() => supabase.auth.signOut()} />

  return <SuperDashboard user={session.user} onLogout={() => supabase.auth.signOut()} />
}
