import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import BookingsTab from '../components/admin/BookingsTab.jsx'
import CoursesTab  from '../components/admin/CoursesTab.jsx'
import TrainersTab from '../components/admin/TrainersTab.jsx'
import SettingsTab from '../components/admin/SettingsTab.jsx'
import styles from './AdminPage.module.css'

// ─── Login ────────────────────────────────────────────────────────────────────

function AdminLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) setError('Ungültige Anmeldedaten. Bitte E-Mail und Passwort prüfen.')
  }

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>⚡ Fit<span>Book</span></div>
        <h1 className={styles.loginTitle}>Admin-Bereich</h1>
        <p className={styles.loginSubtitle}>Melde dich mit deinen Admin-Zugangsdaten an.</p>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.loginField}>
            <label className={styles.loginLabel}>E-Mail</label>
            <input type="email" className={styles.loginInput} placeholder="admin@fitbook.de"
              value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className={styles.loginField}>
            <label className={styles.loginLabel}>Passwort</label>
            <input type="password" className={styles.loginInput} placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          {error && <div className={styles.loginError}>{error}</div>}
          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? 'Anmelden…' : 'Anmelden →'}
          </button>
        </form>
        <p className={styles.loginHint}>
          Admin-Account anlegen: Supabase Dashboard<br />→ Authentication → Users → Add User
        </p>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

const TABS = [
  { id:'bookings',  label:'Buchungen', icon:'📋' },
  { id:'courses',   label:'Kurse',     icon:'🏋️' },
  { id:'trainers',  label:'Trainer',   icon:'👥' },
  { id:'settings',  label:'Einstellungen', icon:'⚙️' },
]

function Dashboard({ user, onLogout }) {
  const [tab, setTab]       = useState('bookings')
  const [counts, setCounts] = useState({ bookings:0, courses:0, trainers:0 })
  const [todayCount, setTodayCount] = useState(0)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    Promise.all([
      supabase.from('bookings').select('*', { count:'exact', head:true }),
      supabase.from('courses').select('*',  { count:'exact', head:true }),
      supabase.from('trainers').select('*', { count:'exact', head:true }),
      supabase.from('bookings').select('*', { count:'exact', head:true }).eq('booking_date', today),
    ]).then(([b, c, t, td]) => {
      setCounts({ bookings: b.count ?? 0, courses: c.count ?? 0, trainers: t.count ?? 0 })
      setTodayCount(td.count ?? 0)
    }).catch(() => {})
  }, [])

  const STATS = [
    { icon:'📋', label:'Buchungen gesamt',  value: counts.bookings },
    { icon:'📅', label:'Heute gebucht',     value: todayCount      },
    { icon:'🏋️', label:'Kurse im Angebot',  value: counts.courses  },
    { icon:'👥', label:'Trainer im Team',   value: counts.trainers },
  ]

  return (
    <div className={styles.dashboard}>
      <header className={styles.adminHeader}>
        <div className={styles.adminLogo}>
          ⚡ Fit<span>Book</span>
          <span className={styles.adminBadge}>Admin</span>
        </div>
        <div className={styles.adminHeaderRight}>
          <span className={styles.adminUserEmail}>{user?.email}</span>
          <button className={styles.logoutBtn} onClick={onLogout}>Abmelden</button>
        </div>
      </header>

      <div className={styles.dashContent}>
        {/* Stats */}
        <div className={styles.statsRow}>
          {STATS.map(st => (
            <div key={st.label} className={styles.statCard}>
              <span className={styles.statIcon}>{st.icon}</span>
              <span className={styles.statValue}>{st.value}</span>
              <span className={styles.statLabel}>{st.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className={styles.tabBar}>
          {TABS.map(t => (
            <button key={t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
              onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
              {t.id !== 'settings' && (
                <span className={styles.tabCount}>
                  {t.id === 'bookings' ? counts.bookings : t.id === 'courses' ? counts.courses : counts.trainers}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {tab === 'bookings' && (
            <BookingsTab onCountChange={n => setCounts(c => ({ ...c, bookings: n }))} />
          )}
          {tab === 'courses' && (
            <CoursesTab onCountChange={n => setCounts(c => ({ ...c, courses: n }))} />
          )}
          {tab === 'trainers' && (
            <TrainersTab onCountChange={n => setCounts(c => ({ ...c, trainers: n }))} />
          )}
          {tab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  )
}

// ─── Haupt-Export ─────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:36, height:36, border:'3px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      </div>
    )
  }

  if (!session) return <AdminLogin />

  return <Dashboard user={session.user} onLogout={() => supabase.auth.signOut()} />
}
