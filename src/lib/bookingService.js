import { supabase } from './supabase.js'

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
    .select('*, studios(name, notification_email)')
    .single()

  if (error) throw error
  return data  // enthält cancel_token aus DB
}

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

  const { error } = await supabase.functions.invoke('send-booking-email', { body: payload })
  if (error) throw error
}

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

  const { error } = await supabase.functions.invoke('send-cancellation-email', { body: payload })
  if (error) throw error
}

export async function fetchAllBookings(studioId) {
  let query = supabase.from('bookings').select('*').order('created_at', { ascending: false })
  if (studioId) query = query.eq('studio_id', studioId)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function deleteBooking(id, booking, studio) {
  const { error } = await supabase.from('bookings').delete().eq('id', id)
  if (error) throw error

  // Stornierungsmails senden (fire-and-forget)
  if (booking) {
    sendCancellationEmails(booking, studio).catch(e =>
      console.warn('Stornierungsmail fehlgeschlagen:', e)
    )
  }
}
