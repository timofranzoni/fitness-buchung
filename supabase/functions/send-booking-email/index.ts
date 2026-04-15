import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function buildEmailHTML(b: Record<string, unknown>): string {
  const course = b.course as Record<string, unknown>
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Buchungsbestätigung</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f5;font-family:Inter,Arial,sans-serif;color:#111;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:30px;font-weight:900;letter-spacing:-0.03em;">
        ⚡ Fit<span style="color:#ff6b1a;">Book</span>
      </span>
    </div>

    <!-- Hero -->
    <div style="background:#fff;border-radius:20px;padding:40px 32px;text-align:center;margin-bottom:20px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <div style="width:72px;height:72px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:36px;margin-bottom:20px;">✅</div>
      <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;color:#111;">Buchung bestätigt!</h1>
      <p style="margin:0;color:#555;font-size:16px;line-height:1.5;">
        Hallo <strong>${b.name}</strong>, dein Platz bei <strong>${String(course.name)}</strong> ist gesichert.
      </p>
    </div>

    <!-- Details Card -->
    <div style="background:#fff;border-radius:20px;padding:32px;margin-bottom:20px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <p style="margin:0 0 20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#888;">Deine Buchungsdetails</p>

      ${[
        ['Kurs',        `${String(course.icon)} ${String(course.name)}`],
        ['Datum',       String(b.dateFormatted)],
        ['Uhrzeit',     `${String(b.slot)} Uhr`],
        ['Dauer',       `${String(course.duration)} Minuten`],
        ['Name',        String(b.name)],
        ['E-Mail',      String(b.email)],
        ['Buchungs-ID', `#${String(b.bookingId)}`],
      ].map(([label, value]) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f0f0f5;">
        <span style="color:#888;font-size:14px;">${label}</span>
        <span style="font-weight:600;font-size:14px;color:#111;">${value}</span>
      </div>`).join('')}
    </div>

    <!-- Tips -->
    <div style="background:#fff8f5;border:1px solid #ffe0cc;border-radius:16px;padding:24px 28px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#ff6b1a;text-transform:uppercase;letter-spacing:0.08em;">Tipps für deinen Kurs</p>
      <ul style="margin:0;padding-left:20px;color:#555;font-size:14px;line-height:1.8;">
        <li>Bringe Sportkleidung und ein Handtuch mit.</li>
        <li>Komme 5–10 Minuten vor Kursbeginn an.</li>
        <li>Stornierungen bitte bis 2 Stunden vorher.</li>
        <li>Wasser wird gestellt – Trinkflasche trotzdem empfohlen.</li>
      </ul>
    </div>

    <!-- CTA Button -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="https://sxhgfmsnkuymkegomolp.supabase.co" style="background:#ff6b1a;color:#fff;text-decoration:none;border-radius:12px;padding:14px 32px;font-size:15px;font-weight:700;display:inline-block;">
        Weiteren Kurs buchen →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;color:#aaa;font-size:12px;line-height:1.6;">
      <p style="margin:0 0 4px;">⚡ FitBook GmbH · Musterstraße 1 · 10115 Berlin</p>
      <p style="margin:0;">Diese E-Mail wurde automatisch generiert. Bitte nicht antworten.</p>
    </div>

  </div>
</body>
</html>`
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { booking } = await req.json()

    if (!booking?.email || !booking?.name) {
      return new Response(
        JSON.stringify({ error: 'Fehlende Pflichtfelder' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'FitBook <onboarding@resend.dev>',
        to:      [booking.email],
        subject: `✅ Buchungsbestätigung: ${booking.course?.name} am ${booking.dateFormatted}`,
        html:    buildEmailHTML(booking),
      }),
    })

    const result = await emailRes.json()

    if (!emailRes.ok) {
      console.error('Resend Fehler:', result)
      return new Response(
        JSON.stringify({ error: 'E-Mail konnte nicht gesendet werden', detail: result }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('Edge Function Fehler:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
