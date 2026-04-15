import { useState, useEffect } from 'react'
import styles from './BookingConfirmation.module.css'

export default function BookingConfirmation({ booking, onReset }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`${styles.container} ${visible ? styles.visible : ''}`}>
      <div className={styles.checkCircle}>
        <svg viewBox="0 0 52 52" className={styles.checkSvg}>
          <circle className={styles.checkCircleBg} cx="26" cy="26" r="25" />
          <path className={styles.checkMark} fill="none" d="M14 27l8 8 16-16" />
        </svg>
      </div>

      <div className={styles.titleGroup}>
        <h1 className={styles.title}>Buchung bestätigt!</h1>
        <p className={styles.subtitle}>
          Dein Platz ist reserviert. Wir freuen uns auf dich, {booking.name.split(' ')[0]}!
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <span className={styles.courseIcon}>{booking.course.icon}</span>
            <div>
              <div className={styles.courseName}>{booking.course.name}</div>
              <div className={styles.courseDesc}>{booking.course.description}</div>
            </div>
          </div>
          <div className={styles.bookingId}>#{booking.bookingId}</div>
        </div>

        <div className={styles.divider} />

        <div className={styles.details}>
          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>📅</div>
            <div>
              <div className={styles.detailLabel}>Datum</div>
              <div className={styles.detailValue}>{booking.dateFormatted}</div>
            </div>
          </div>
          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>🕐</div>
            <div>
              <div className={styles.detailLabel}>Uhrzeit</div>
              <div className={styles.detailValue}>{booking.slot} Uhr</div>
            </div>
          </div>
          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>⏱️</div>
            <div>
              <div className={styles.detailLabel}>Dauer</div>
              <div className={styles.detailValue}>{booking.course.duration} Minuten</div>
            </div>
          </div>
          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>👤</div>
            <div>
              <div className={styles.detailLabel}>Name</div>
              <div className={styles.detailValue}>{booking.name}</div>
            </div>
          </div>
          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>✉️</div>
            <div>
              <div className={styles.detailLabel}>E-Mail</div>
              <div className={styles.detailValue}>{booking.email}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.notice}>
        <span className={styles.noticeIcon}>📬</span>
        <span>Eine Bestätigungsmail wurde an <strong>{booking.email}</strong> gesendet.</span>
      </div>

      <div className={styles.tips}>
        <div className={styles.tipTitle}>Tipps für deinen Kurs</div>
        <ul className={styles.tipList}>
          <li>Bringe bitte Sportkleidung und ein Handtuch mit.</li>
          <li>Komme 5–10 Minuten vor Kursbeginn an.</li>
          <li>Stornierungen bitte bis 2 Stunden vorher.</li>
        </ul>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={onReset}>
          Weiteren Kurs buchen
        </button>
      </div>
    </div>
  )
}
