import { supabase } from './supabase.js'

export async function createBooking(bookingData) {
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
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function sendConfirmationEmail(bookingData) {
  const { error } = await supabase.functions.invoke('send-booking-email', {
    body: { booking: bookingData },
  })
  if (error) throw error
}

export async function fetchAllBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function deleteBooking(id) {
  const { error } = await supabase.from('bookings').delete().eq('id', id)
  if (error) throw error
}
