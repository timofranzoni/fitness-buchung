import { serve }      from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { buildReminderEmail, type ReminderEmailData } from '../_shared/emails.ts'

const RESEND_API_KEY      = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM_EMAIL          = Deno.env.get('FROM_EMAIL') ?? 'FitBook <onboarding@resend.dev>'
const SUPABASE_URL        = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const APP_URL             = Deno.env.get('APP_URL') ?? ''

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function formatDate(isoDate: string): string {
  return new Date(isoDate + 'T12:00:00').toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(JSON.stringify(json))
  return json
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  // Nur mit Service Role Key aufrufbar (z.B. von pg_cron)
  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.includes(SUPABASE_SERVICE_KEY)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Datum von morgen berechnen
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowISO = tomorrow.toISOString().split('T')[0]

  // Alle Buchungen von morgen ohne Erinnerungsmail
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      booking_id,
      cancel_token,
      customer_name,
      customer_email,
      course_name,
      course_icon,
      slot_time,
      booking_date,
      studio_id,
      studios (
        name,
        slug
      )
    `)
    .eq('booking_date', tomorrowISO)
    .eq('reminder_sent', false)

  if (error) {
    console.error('DB-Fehler:', error)
    return new Response(JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }

  let sent = 0
  let failed = 0

  for (const b of (bookings ?? [])) {
    const studio = (b.studios as { name: string; slug: string } | null)
    const studioName = studio?.name ?? 'FitBook'
    const studioSlug = studio?.slug ?? 'demo'
    const appUrl = APP_URL ? `${APP_URL}/studio/${studioSlug}` : `${SUPABASE_URL.replace('.supabase.co', '.vercel.app')}/studio/${studioSlug}`

    const emailData: ReminderEmailData = {
      name:           b.customer_name,
      bookingId:      b.booking_id,
      cancelToken:    b.cancel_token,
      courseName:     b.course_name,
      courseIcon:     b.course_icon ?? '🏋️',
      courseDuration: 60,
      dateFormatted:  formatDate(b.booking_date),
      slot:           b.slot_time,
      studioName,
      appUrl,
    }

    try {
      await sendEmail(
        b.customer_email,
        `⏰ Morgen: ${b.course_icon ?? ''} ${b.course_name} um ${b.slot_time} Uhr`,
        buildReminderEmail(emailData),
      )

      // reminder_sent = true setzen
      await supabase
        .from('bookings')
        .update({ reminder_sent: true })
        .eq('id', b.id)

      sent++
    } catch (e) {
      console.error(`Reminder für ${b.customer_email} fehlgeschlagen:`, e)
      failed++
    }
  }

  return new Response(
    JSON.stringify({ success: true, sent, failed, total: (bookings ?? []).length }),
    { headers: { ...cors, 'Content-Type': 'application/json' } },
  )
})
