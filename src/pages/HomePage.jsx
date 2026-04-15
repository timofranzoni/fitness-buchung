import { Link, useParams } from 'react-router-dom'
import { COURSES, INTENSITY_COLORS } from '../data/courses.js'
import { TRAINERS } from '../data/trainers.js'
import styles from './HomePage.module.css'

const STATS = [
  { value: '2.400+', label: 'Aktive Mitglieder' },
  { value: '18', label: 'Kurse pro Woche' },
  { value: '6', label: 'Zertifizierte Trainer' },
  { value: '98%', label: 'Zufriedenheitsrate' },
]

export default function HomePage() {
  const { slug } = useParams()
  const base = `/studio/${slug}`

  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>🔥 Jetzt bis zu 30% Rabatt im April</div>
        <h1 className={styles.heroTitle}>
          Dein Fitness-<br />
          <span className={styles.heroAccent}>Ziel erreichen.</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Erstklassige Kurse, motivierte Trainer und eine Community, die dich antreibt.
          Buch jetzt deinen ersten Kurs — kostenlos.
        </p>
        <div className={styles.heroActions}>
          <Link to={`${base}/buchen`} className={styles.heroCta}>Kurs buchen →</Link>
          <Link to={`${base}/kurse`} className={styles.heroSecondary}>Kurse entdecken</Link>
        </div>
        <div className={styles.heroStats}>
          {STATS.map(s => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Kurse Preview */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionEyebrow}>Was wir bieten</div>
            <h2 className={styles.sectionTitle}>Unsere Kurse</h2>
          </div>
          <Link to={`${base}/kurse`} className={styles.sectionLink}>Alle Kurse →</Link>
        </div>
        <div className={styles.courseGrid}>
          {COURSES.map(course => (
            <Link to={`${base}/buchen`} key={course.id} className={styles.courseCard} style={{ '--c': course.color }}>
              <div className={styles.courseCardTop}>
                <span className={styles.courseIcon}>{course.icon}</span>
                <span className={styles.courseIntensity} style={{ color: INTENSITY_COLORS[course.intensity] }}>
                  ● {course.intensity}
                </span>
              </div>
              <div className={styles.courseName}>{course.name}</div>
              <div className={styles.courseDesc}>{course.description}</div>
              <div className={styles.courseMeta}>{course.duration} Min. · {course.slots.length} Zeiten/Tag</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trainer Preview */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionEyebrow}>Dein Team</div>
            <h2 className={styles.sectionTitle}>Unsere Trainer</h2>
          </div>
          <Link to={`${base}/trainer`} className={styles.sectionLink}>Alle Trainer →</Link>
        </div>
        <div className={styles.trainerGrid}>
          {TRAINERS.slice(0, 3).map(t => (
            <Link to={`${base}/trainer`} key={t.id} className={styles.trainerCard}>
              <div className={styles.trainerAvatar} style={{ '--tc': t.color }}>
                {t.initials}
              </div>
              <div className={styles.trainerName}>{t.name}</div>
              <div className={styles.trainerRole}>{t.role}</div>
              <div className={styles.trainerRating}>
                {'★'.repeat(Math.round(t.rating))} <span>{t.rating} ({t.reviews})</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerContent}>
          <h2 className={styles.ctaBannerTitle}>Bereit loszulegen?</h2>
          <p className={styles.ctaBannerText}>Buch deinen ersten Kurs heute – ganz ohne Mitgliedschaft.</p>
        </div>
        <Link to={`${base}/buchen`} className={styles.heroCta}>Jetzt buchen →</Link>
      </section>

    </div>
  )
}
