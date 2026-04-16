import { useState, useEffect } from 'react'
import { fetchAllBookings, deleteBooking } from '../../lib/bookingService.js'
import { useStudio } from '../../context/StudioContext.jsx'
import s from './admin.module.css'

function formatDate(iso) {
  if (!iso) return '–'
  return new Date(iso + 'T12:00:00').toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' })
}
function formatDateTime(iso) {
  if (!iso) return '–'
  return new Date(iso).toLocaleString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
}

const QUICK_FILTERS = [
  { label: 'Alle',       value: 'all'   },
  { label: 'Heute',      value: 'today' },
  { label: 'Diese Woche',value: 'week'  },
  { label: 'Dieser Monat', value: 'month' },
]

export default function BookingsTab({ studioId, onCountChange }) {
  const { studio } = useStudio()
  const [bookings, setBookings]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [quickFilter, setQuickFilter]   = useState('all')
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchAllBookings(studioId)
      .then(b => { setBookings(b); onCountChange?.(b.length) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [studioId])

  async function handleDelete(id) {
    const booking = bookings.find(b => b.id === id)
    await deleteBooking(id, booking, studio).catch(console.error)
    const next = bookings.filter(b => b.id !== id)
    setBookings(next)
    onCountChange?.(next.length)
    setDeleteConfirm(null)
  }

  function applyFilters(list) {
    const today = new Date().toISOString().split('T')[0]
    let filtered = list

    if (quickFilter !== 'all') {
      const now = new Date()
      filtered = filtered.filter(b => {
        const d = b.booking_date
        if (quickFilter === 'today') return d === today
        if (quickFilter === 'week') {
          const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1)
          const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
          return d >= mon.toISOString().split('T')[0] && d <= sun.toISOString().split('T')[0]
        }
        if (quickFilter === 'month') return d?.startsWith(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`)
        return true
      })
    }
    if (dateFrom) filtered = filtered.filter(b => b.booking_date >= dateFrom)
    if (dateTo)   filtered = filtered.filter(b => b.booking_date <= dateTo)
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(b =>
        b.customer_name?.toLowerCase().includes(q) ||
        b.customer_email?.toLowerCase().includes(q) ||
        b.course_name?.toLowerCase().includes(q) ||
        b.booking_id?.toLowerCase().includes(q)
      )
    }
    return filtered
  }

  const visible = applyFilters(bookings)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      {/* Toolbar */}
      <div className={s.toolbar}>
        <div className={s.toolbarLeft}>
          <input
            type="search" className={s.searchInput}
            placeholder="Name, E-Mail, Kurs…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select className={s.filterSelect} value={quickFilter} onChange={e => setQuickFilter(e.target.value)}>
            {QUICK_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <input type="date" className={s.filterSelect} value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setQuickFilter('all') }}
            title="Von Datum" style={{ width: 150 }}
          />
          <input type="date" className={s.filterSelect} value={dateTo}
            onChange={e => { setDateTo(e.target.value); setQuickFilter('all') }}
            title="Bis Datum" style={{ width: 150 }}
          />
          {(dateFrom || dateTo || search || quickFilter !== 'all') && (
            <button className={s.cancelBtn} style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
              onClick={() => { setSearch(''); setQuickFilter('all'); setDateFrom(''); setDateTo('') }}>
              ✕ Zurücksetzen
            </button>
          )}
        </div>
        <span className={s.resultCount}>{visible.length} von {bookings.length} Buchungen</span>
      </div>

      {loading ? (
        <div className={s.loadingRow}><div className={s.spinner} /> Buchungen werden geladen…</div>
      ) : visible.length === 0 ? (
        <div className={s.emptyState}>
          <div className={s.emptyIcon}>📋</div>
          <div>{bookings.length === 0 ? 'Noch keine Buchungen vorhanden.' : 'Keine Treffer für diese Filter.'}</div>
        </div>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
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
              {visible.map(b => (
                <tr key={b.id}>
                  <td><code className={s.bookingIdCode}>#{b.booking_id}</code></td>
                  <td className={s.tdBold}>{b.customer_name}</td>
                  <td className={s.tdMuted}>{b.customer_email}</td>
                  <td><span className={s.courseChip}>{b.course_icon} {b.course_name}</span></td>
                  <td>{formatDate(b.booking_date)}</td>
                  <td>{b.slot_time} Uhr</td>
                  <td className={s.tdMuted}>{formatDateTime(b.created_at)}</td>
                  <td>
                    <button className={`${s.iconRowBtn} ${s.iconRowBtnDanger}`}
                      onClick={() => setDeleteConfirm(b)} title="Löschen">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteConfirm && (
        <div className={s.modalOverlay}>
          <div className={s.confirmModal}>
            <div className={s.confirmIcon}>⚠️</div>
            <h3 className={s.confirmTitle}>Buchung löschen?</h3>
            <p className={s.confirmText}>
              Buchung <strong>#{deleteConfirm.booking_id}</strong> von <strong>{deleteConfirm.customer_name}</strong> wird unwiderruflich gelöscht.
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
