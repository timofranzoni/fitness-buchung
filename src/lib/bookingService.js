import { supabase } from './supabase.js'

const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Direkter fetch zur Edge Function
// verify_jwt = false in supabase/config.toml → kein JWT nötig für öffentliche Funktionen
async function invokeFunction(name, body) {
  // Session-JWT verwenden falls vorhanden (Admin), sonst nur apikey-Header
  const { data: { session } } = await supabase.auth.getSession()

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
  }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${name} HTTP ${res.status}: ${text}`)
  return JSON.parse(text)
}

// ── Buchung erstellen ─────────────────────────────────────────────────────────

export async function createBooking(studioId, bookingData) {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      booking_id:     bookingData.bookingId,
      customer_name:  bookingData.name,
      customer_email: bookingData.email,
      course_id:      bookingData.course.id ?? null,
      course_name:    bookingData.course.name,
      course_icon:    bookingData.course.icon,
      slot_time:      bookingData.slot,
      booking_date:   bookingData.date,
      studio_id:      studioId,
    })
    .select()
    .single()

  if (error) throw error
  return data  // enthält cancel_token wenn migration_005 gelaufen ist
}

// ── Buchungsbestätigung + Studio-Benachrichtigung senden ─────────────────────

export async function sendBookingEmails(bookingData, dbRow, studio) {
  const dateFormatted = new Date(bookingData.date + 'T12:00:00').toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const payload = {
    booking: {
      name:           bookingData.name,
      email:          bookingData.email,
      bookingId:      bookingData.bookingId,
      cancelToken:    dbRow?.cancel_token ?? '',
      courseName:     bookingData.course.name,
      courseIcon:     bookingData.course.icon ?? '🏋️',
      courseDuration: bookingData.course.duration ?? 60,
      date:           bookingData.date,
      dateFormatted,
      slot:           bookingData.slot,
      studioName:     studio?.name ?? 'FitBook',
      studioEmail:    studio?.notification_email ?? studio?.owner_email ?? null,
      appUrl:         window.location.origin + `/studio/${studio?.slug ?? 'demo'}`,
    },
  }

  console.log('[sendBookingEmails] Sende Payload:', payload)
  const result = await invokeFunction('send-booking-email', payload)
  console.log('[sendBookingEmails] Antwort:', result)
  return result
}

// ── Stornierungsmails senden ──────────────────────────────────────────────────

export async function sendCancellationEmails(booking, studio) {
  const dateFormatted = new Date(booking.booking_date + 'T12:00:00').toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const payload = {
    customerEmail: booking.customer_email,
    studioEmail:   studio?.notification_email ?? null,
    booking: {
      name:          booking.customer_name,
      bookingId:     booking.booking_id,
      courseName:    booking.course_name,
      courseIcon:    booking.course_icon ?? '🏋️',
      dateFormatted,
      slot:          booking.slot_time,
      studioName:    studio?.name ?? 'FitBook',
      appUrl:        window.location.origin + `/studio/${studio?.slug ?? 'demo'}`,
    },
  }

  console.log('[sendCancellationEmails] Sende Payload:', payload)
  const result = await invokeFunction('send-cancellation-email', payload)
  console.log('[sendCancellationEmails] Antwort:', result)
  return result
}

// ── Alle Buchungen laden ──────────────────────────────────────────────────────

export async function fetchAllBookings(studioId) {
  let query = supabase.from('bookings').select('*').order('created_at', { ascending: false })
  if (studioId) query = query.eq('studio_id', studioId)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

// ── Buchung löschen + Stornierungsmails ──────────────────────────────────────

export async function deleteBooking(id, booking, studio) {
  const { error } = await supabase.from('bookings').delete().eq('id', id)
  if (error) throw error

  if (booking) {
    sendCancellationEmails(booking, studio).catch(e =>
      console.error('[deleteBooking] Stornierungsmail fehlgeschlagen:', e)
    )
  }
}
