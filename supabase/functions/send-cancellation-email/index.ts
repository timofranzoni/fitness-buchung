import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import {
  buildCancellationEmail,
  buildStudioCancellationEmail,
  type CancellationEmailData,
} from '../_shared/emails.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL') ?? 'FitBook <onboarding@resend.dev>'

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

  try {
    const { booking, customerEmail, studioEmail } = await req.json() as {
      booking:       CancellationEmailData
      customerEmail: string
      studioEmail?:  string
    }

    if (!customerEmail || !booking?.name) {
      return new Response(JSON.stringify({ error: 'Fehlende Pflichtfelder' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const errors: string[] = []

    // 1. Stornierungsbestätigung an Kunden
    try {
      await sendEmail(
        customerEmail,
        `❌ Stornierungsbestätigung: ${booking.courseIcon} ${booking.courseName}`,
        buildCancellationEmail(booking),
      )
    } catch (e) {
      errors.push(`Kundenmail: ${e}`)
      console.error('Storno-Kundenmail fehlgeschlagen:', e)
    }

    // 2. Stornierungsbenachrichtigung ans Studio (optional)
    if (studioEmail) {
      try {
        await sendEmail(
          studioEmail,
          `⚠️ Stornierung: ${booking.courseIcon} ${booking.courseName} – ${booking.name}`,
          buildStudioCancellationEmail(booking),
        )
      } catch (e) {
        errors.push(`Studiomail: ${e}`)
        console.error('Storno-Studiomail fehlgeschlagen:', e)
      }
    }

    return new Response(
      JSON.stringify({ success: true, errors: errors.length ? errors : undefined }),
      { headers: { ...cors, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('Edge Function Fehler:', err)
    return new Response(JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
