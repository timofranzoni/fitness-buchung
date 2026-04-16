// ── Shared Email Templates ────────────────────────────────────────────────────

const ACCENT   = '#ff6b1a'
const BG       = '#f0f1f5'
const CARD     = '#ffffff'
const DARK     = '#0f0f13'
const MUTED    = '#6b7280'
const TEXT     = '#111827'
const SUCCESS  = '#10b981'
const DANGER   = '#ef4444'
const WARN_BG  = '#fff8f2'
const WARN_BDR = '#ffd4b3'

// ── Shared building blocks ────────────────────────────────────────────────────

function emailShell(content: string, studioName = 'FitBook'): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${studioName}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${TEXT};-webkit-font-smoothing:antialiased;">
  <div style="max-width:600px;margin:0 auto;padding:40px 16px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:28px;">
      <span style="font-size:26px;font-weight:900;letter-spacing:-0.03em;color:${DARK};">
        ⚡ ${studioName.split('').map((c,i) => i < studioName.length - 1 ? c : `<span style="color:${ACCENT};">${c}</span>`).join('')}
      </span>
    </div>

    ${content}

    <!-- Footer -->
    <div style="text-align:center;padding:28px 0 0;color:#9ca3af;font-size:12px;line-height:1.8;">
      <p style="margin:0;">⚡ ${studioName} · Diese E-Mail wurde automatisch generiert</p>
      <p style="margin:0;">Bitte nicht direkt auf diese E-Mail antworten.</p>
    </div>

  </div>
</body>
</html>`
}

function card(content: string): string {
  return `<div style="background:${CARD};border-radius:16px;padding:36px 32px;margin-bottom:16px;border:1px solid #e5e7eb;">${content}</div>`
}

function detailRow(label: string, value: string, last = false): string {
  return `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;${last ? '' : 'border-bottom:1px solid #f3f4f6;'}">
    <span style="color:${MUTED};font-size:14px;">${label}</span>
    <span style="font-weight:600;font-size:14px;color:${TEXT};text-align:right;max-width:60%;">${value}</span>
  </div>`
}

function ctaButton(label: string, url: string, color = ACCENT): string {
  return `<div style="text-align:center;margin:24px 0 0;">
    <a href="${url}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;border-radius:10px;padding:14px 32px;font-size:15px;font-weight:700;letter-spacing:-0.01em;">${label}</a>
  </div>`
}

function badge(text: string, color: string): string {
  return `<span style="display:inline-block;background:${color}20;color:${color};border:1px solid ${color}40;border-radius:20px;padding:3px 12px;font-size:12px;font-weight:700;">${text}</span>`
}

// ── 1. Buchungsbestätigung (an Kunden) ───────────────────────────────────────

export interface BookingEmailData {
  name:           string
  email:          string
  bookingId:      string
  cancelToken:    string
  courseName:     string
  courseIcon:     string
  courseDuration: number
  date:           string          // ISO: 2025-06-14
  dateFormatted:  string          // "Samstag, 14. Juni 2025"
  slot:           string          // "09:00"
  studioName:     string
  appUrl:         string
}

export function buildConfirmationEmail(b: BookingEmailData): string {
  const cancelUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/cancel-booking?token=${b.cancelToken}`

  return emailShell(`

    ${card(`
      <!-- Hero -->
      <div style="text-align:center;margin-bottom:28px;">
        <div style="width:68px;height:68px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;">✅</div>
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${DARK};">Buchung bestätigt!</h1>
        <p style="margin:0;color:${MUTED};font-size:15px;line-height:1.5;">
          Hallo <strong style="color:${TEXT};">${b.name}</strong>,<br>dein Platz bei <strong style="color:${ACCENT};">${b.courseIcon} ${b.courseName}</strong> ist gesichert.
        </p>
      </div>

      <!-- Detail-Tabelle -->
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;">Deine Buchungsdetails</p>
      ${detailRow('Kurs',        `${b.courseIcon} ${b.courseName}`)}
      ${detailRow('Datum',       `<strong>${b.dateFormatted}</strong>`)}
      ${detailRow('Uhrzeit',     `<strong>${b.slot} Uhr</strong>`)}
      ${detailRow('Dauer',       `${b.courseDuration} Minuten`)}
      ${detailRow('Name',        b.name)}
      ${detailRow('Buchungs-ID', `<code style="background:#f3f4f6;padding:2px 8px;border-radius:6px;font-size:13px;">#${b.bookingId}</code>`, true)}
    `)}

    <!-- Tipps-Box -->
    <div style="background:${WARN_BG};border:1px solid ${WARN_BDR};border-radius:14px;padding:22px 26px;margin-bottom:16px;">
      <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${ACCENT};">Tipps für deinen Kurs</p>
      <ul style="margin:0;padding-left:18px;color:#4b5563;font-size:14px;line-height:1.9;">
        <li>Bringe Sportkleidung und ein Handtuch mit.</li>
        <li>Plane 5–10 Minuten Puffer für die Ankunft ein.</li>
        <li>Wasser wird gestellt – eigene Flasche ist trotzdem praktisch.</li>
        <li>Stornierungen bitte bis 2 Stunden vorher vornehmen.</li>
      </ul>
    </div>

    <!-- CTAs -->
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:8px;">
      <a href="${b.appUrl}" style="display:inline-block;background:${ACCENT};color:#fff;text-decoration:none;border-radius:10px;padding:13px 28px;font-size:14px;font-weight:700;">
        Weiteren Kurs buchen →
      </a>
      <a href="${cancelUrl}" style="display:inline-block;background:#fff;color:${MUTED};text-decoration:none;border-radius:10px;padding:13px 28px;font-size:14px;font-weight:600;border:1px solid #e5e7eb;">
        Buchung stornieren
      </a>
    </div>

  `, b.studioName)
}

// ── 2. Studio-Benachrichtigung (an Studio-Admin) ─────────────────────────────

export interface StudioNotificationData {
  name:          string
  email:         string
  bookingId:     string
  courseName:    string
  courseIcon:    string
  date:          string
  dateFormatted: string
  slot:          string
  studioName:    string
  createdAt:     string
}

export function buildStudioNotificationEmail(b: StudioNotificationData): string {
  return emailShell(`

    ${card(`
      <div style="margin-bottom:20px;">
        <div style="display:inline-block;margin-bottom:12px;">${badge('Neue Buchung', SUCCESS)}</div>
        <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:${DARK};">Neue Buchung eingegangen</h1>
        <p style="margin:0;color:${MUTED};font-size:14px;">Kurs: <strong style="color:${TEXT};">${b.courseIcon} ${b.courseName}</strong></p>
      </div>

      <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;">Kundendetails</p>
      ${detailRow('Name',        b.name)}
      ${detailRow('E-Mail',      `<a href="mailto:${b.email}" style="color:${ACCENT};text-decoration:none;">${b.email}</a>`)}
      ${detailRow('Buchungs-ID', `<code style="background:#f3f4f6;padding:2px 8px;border-radius:6px;font-size:13px;">#${b.bookingId}</code>`)}

      <p style="margin:16px 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;">Kursdetails</p>
      ${detailRow('Datum',       `<strong>${b.dateFormatted}</strong>`)}
      ${detailRow('Uhrzeit',     `${b.slot} Uhr`)}
      ${detailRow('Eingang',     b.createdAt, true)}
    `)}

  `, b.studioName)
}

// ── 3. Erinnerungsmail (24h vorher, an Kunden) ───────────────────────────────

export interface ReminderEmailData {
  name:           string
  bookingId:      string
  cancelToken:    string
  courseName:     string
  courseIcon:     string
  courseDuration: number
  dateFormatted:  string
  slot:           string
  studioName:     string
  appUrl:         string
}

export function buildReminderEmail(b: ReminderEmailData): string {
  const cancelUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/cancel-booking?token=${b.cancelToken}`

  return emailShell(`

    ${card(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:68px;height:68px;background:#fef3c7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;">⏰</div>
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${DARK};">Morgen ist es soweit!</h1>
        <p style="margin:0;color:${MUTED};font-size:15px;line-height:1.5;">
          Hallo <strong style="color:${TEXT};">${b.name}</strong>,<br>
          dein Kurs <strong style="color:${ACCENT};">${b.courseIcon} ${b.courseName}</strong> findet <strong style="color:${TEXT};">morgen</strong> statt.
        </p>
      </div>

      <!-- Kurs-Highlight -->
      <div style="background:${BG};border-radius:12px;padding:20px 24px;text-align:center;margin-bottom:20px;">
        <div style="font-size:40px;margin-bottom:8px;">${b.courseIcon}</div>
        <div style="font-size:20px;font-weight:800;color:${DARK};margin-bottom:4px;">${b.courseName}</div>
        <div style="font-size:16px;color:${ACCENT};font-weight:700;">${b.dateFormatted} · ${b.slot} Uhr</div>
        <div style="font-size:13px;color:${MUTED};margin-top:4px;">${b.courseDuration} Minuten</div>
      </div>

      ${detailRow('Buchungs-ID', `<code style="background:#f3f4f6;padding:2px 8px;border-radius:6px;font-size:13px;">#${b.bookingId}</code>`, true)}
    `)}

    <!-- Checkliste -->
    <div style="background:${WARN_BG};border:1px solid ${WARN_BDR};border-radius:14px;padding:22px 26px;margin-bottom:16px;">
      <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${ACCENT};">Deine Checkliste für morgen</p>
      <ul style="margin:0;padding-left:18px;color:#4b5563;font-size:14px;line-height:2;">
        <li>✅ Sportkleidung und Handtuch einpacken</li>
        <li>✅ 10 Minuten früher da sein</li>
        <li>✅ Ausreichend trinken vor dem Kurs</li>
        <li>✅ Trinkflasche mitnehmen</li>
      </ul>
    </div>

    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <a href="${b.appUrl}" style="display:inline-block;background:${ACCENT};color:#fff;text-decoration:none;border-radius:10px;padding:13px 28px;font-size:14px;font-weight:700;">
        Kursplan ansehen →
      </a>
      <a href="${cancelUrl}" style="display:inline-block;background:#fff;color:${MUTED};text-decoration:none;border-radius:10px;padding:13px 28px;font-size:14px;font-weight:600;border:1px solid #e5e7eb;">
        Stornieren
      </a>
    </div>

  `, b.studioName)
}

// ── 4. Stornierungsbestätigung (an Kunden) ───────────────────────────────────

export interface CancellationEmailData {
  name:          string
  bookingId:     string
  courseName:    string
  courseIcon:    string
  dateFormatted: string
  slot:          string
  studioName:    string
  appUrl:        string
}

export function buildCancellationEmail(b: CancellationEmailData): string {
  return emailShell(`

    ${card(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:68px;height:68px;background:#fee2e2;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;">❌</div>
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${DARK};">Buchung storniert</h1>
        <p style="margin:0;color:${MUTED};font-size:15px;line-height:1.5;">
          Hallo <strong style="color:${TEXT};">${b.name}</strong>,<br>
          deine Buchung wurde erfolgreich storniert.
        </p>
      </div>

      <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;">Stornierte Buchung</p>
      ${detailRow('Kurs',        `${b.courseIcon} ${b.courseName}`)}
      ${detailRow('Datum',       b.dateFormatted)}
      ${detailRow('Uhrzeit',     `${b.slot} Uhr`)}
      ${detailRow('Buchungs-ID', `<code style="background:#f3f4f6;padding:2px 8px;border-radius:6px;font-size:13px;">#${b.bookingId}</code>`, true)}
    `)}

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:20px 24px;margin-bottom:16px;text-align:center;">
      <p style="margin:0;color:#166534;font-size:14px;line-height:1.6;">
        <strong>Platz wieder frei.</strong><br>
        Natürlich kannst du jederzeit einen neuen Kurs buchen – wir freuen uns auf dich!
      </p>
    </div>

    ${ctaButton('Neuen Kurs buchen →', b.appUrl)}

  `, b.studioName)
}

// ── 5. Stornierungsbenachrichtigung (an Studio) ──────────────────────────────

export function buildStudioCancellationEmail(b: CancellationEmailData): string {
  return emailShell(`

    ${card(`
      <div style="margin-bottom:20px;">
        <div style="display:inline-block;margin-bottom:12px;">${badge('Stornierung', DANGER)}</div>
        <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:${DARK};">Buchung storniert</h1>
        <p style="margin:0;color:${MUTED};font-size:14px;">Ein Kunde hat seine Buchung storniert.</p>
      </div>

      ${detailRow('Kunde',       b.name)}
      ${detailRow('Kurs',        `${b.courseIcon} ${b.courseName}`)}
      ${detailRow('Datum',       b.dateFormatted)}
      ${detailRow('Uhrzeit',     `${b.slot} Uhr`)}
      ${detailRow('Buchungs-ID', `<code style="background:#f3f4f6;padding:2px 8px;border-radius:6px;font-size:13px;">#${b.bookingId}</code>`, true)}
    `)}

  `, b.studioName)
}
