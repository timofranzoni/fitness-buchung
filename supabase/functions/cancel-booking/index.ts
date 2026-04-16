import { serve }       from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { buildCancellationEmail, buildStudioCancellationEmail } from '../_shared/emails.ts'

const RESEND_API_KEY       = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM_EMAIL           = Deno.env.get('FROM_EMAIL') ?? 'FitBook <onboarding@resend.dev>'
const SUPABASE_URL         = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const APP_URL              = Deno.env.get('APP_URL') ?? ''

const ACCENT = '#ff6b1a'

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
  if (!res.ok) throw new Error(await res.text())
}

function htmlPage(title: string, emoji: string, heading: string, body: string, cta?: { label: string; url: string }): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#f0f1f5; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; padding:20px; }
    .card { background:#fff; border-radius:20px; padding:48px 40px; text-align:center; max-width:480px; width:100%; box-shadow:0 4px 24px rgba(0,0,0,0.08); border:1px solid #e5e7eb; }
    .logo { font-size:20px; font-weight:900; letter-spacing:-0.02em; color:#0f0f13; margin-bottom:32px; }
    .logo span { color:${ACCENT}; }
    .emoji { font-size:56px; margin-bottom:20px; display:block; }
    h1 { font-size:24px; font-weight:800; color:#111827; margin-bottom:12px; }
    p  { color:#6b7280; font-size:15px; line-height:1.6; margin-bottom:8px; }
    .detail { background:#f9fafb; border-radius:10px; padding:16px 20px; margin:20px 0; text-align:left; }
    .detail-row { display:flex; justify-content:space-between; font-size:14px; padding:6px 0; border-bottom:1px solid #f3f4f6; }
    .detail-row:last-child { border:none; }
    .detail-row .label { color:#9ca3af; }
    .detail-row .value { font-weight:600; color:#111827; }
    .btn { display:inline-block; background:${ACCENT}; color:#fff; text-decoration:none; border-radius:10px; padding:13px 28px; font-size:15px; font-weight:700; margin-top:24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">⚡ Fit<span>Book</span></div>
    <span class="emoji">${emoji}</span>
    <h1>${heading}</h1>
    ${body}
    ${cta ? `<a href="${cta.url}" class="btn">${cta.label}</a>` : ''}
  </div>
</body>
</html>`
}

serve(async (req: Request) => {
  const url   = new URL(req.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return new Response(
      htmlPage('Fehler', '❌', 'Ungültiger Link', '<p>Dieser Stornierungslink ist ungültig oder abgelaufen.</p>'),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Buchung anhand des Tokens laden
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      id, booking_id, cancel_token,
      customer_name, customer_email,
      course_name, course_icon,
      slot_time, booking_date, studio_id,
      studios ( name, slug, notification_email )
    `)
    .eq('cancel_token', token)
    .single()

  if (error || !booking) {
    return new Response(
      htmlPage(
        'Nicht gefunden', '🔍', 'Buchung nicht gefunden',
        '<p>Diese Buchung existiert nicht oder wurde bereits storniert.</p>',
      ),
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  const studio     = booking.studios as { name: string; slug: string; notification_email: string | null } | null
  const studioName = studio?.name ?? 'FitBook'
  const studioSlug = studio?.slug ?? 'demo'
  const appUrl     = APP_URL ? `${APP_URL}/studio/${studioSlug}` : ''
  const dateFormatted = formatDate(booking.booking_date)

  // Buchung löschen
  const { error: deleteError } = await supabase
    .from('bookings')
    .delete()
    .eq('id', booking.id)

  if (deleteError) {
    console.error('Löschfehler:', deleteError)
    return new Response(
      htmlPage('Fehler', '⚠️', 'Stornierung fehlgeschlagen',
        '<p>Die Buchung konnte leider nicht storniert werden. Bitte kontaktiere das Studio direkt.</p>'),
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  // Stornierungsmails senden (fire-and-forget)
  const emailData = {
    name:          booking.customer_name,
    bookingId:     booking.booking_id,
    courseName:    booking.course_name,
    courseIcon:    booking.course_icon ?? '🏋️',
    dateFormatted,
    slot:          booking.slot_time,
    studioName,
    appUrl,
  }

  sendEmail(
    booking.customer_email,
    `❌ Stornierungsbestätigung: ${booking.course_icon ?? ''} ${booking.course_name}`,
    buildCancellationEmail(emailData),
  ).catch(e => console.error('Storno-Kundenmail fehlgeschlagen:', e))

  if (studio?.notification_email) {
    sendEmail(
      studio.notification_email,
      `⚠️ Stornierung: ${booking.course_icon ?? ''} ${booking.course_name} – ${booking.customer_name}`,
      buildStudioCancellationEmail(emailData),
    ).catch(e => console.error('Storno-Studiomail fehlgeschlagen:', e))
  }

  // Erfolgsseite anzeigen
  return new Response(
    htmlPage(
      'Storniert', '✅', 'Buchung storniert',
      `<p>Deine Buchung wurde erfolgreich storniert.</p>
       <div class="detail">
         <div class="detail-row"><span class="label">Kurs</span><span class="value">${booking.course_icon ?? ''} ${booking.course_name}</span></div>
         <div class="detail-row"><span class="label">Datum</span><span class="value">${dateFormatted}</span></div>
         <div class="detail-row"><span class="label">Uhrzeit</span><span class="value">${booking.slot_time} Uhr</span></div>
       </div>
       <p>Du erhältst in Kürze eine Bestätigungs-E-Mail.</p>`,
      appUrl ? { label: 'Neuen Kurs buchen →', url: appUrl } : undefined,
    ),
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )
})
