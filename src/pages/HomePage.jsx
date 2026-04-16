import { Link, useParams } from 'react-router-dom'
import { COURSES, INTENSITY_COLORS } from '../data/courses.js'
import { TRAINERS } from '../data/trainers.js'
import { useContent } from '../context/ContentContext.jsx'
import { ET } from '../components/LiveEditor.jsx'
import styles from './HomePage.module.css'

export default function HomePage() {
  const { slug } = useParams()
  const base = `/studio/${slug}`
  const { content } = useContent()

  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <ET field="hero_badge">🔥 Jetzt bis zu 30% Rabatt im April</ET>
        </div>
        <h1 className={styles.heroTitle}>
          <ET field="hero_headline">Dein Fitness-</ET><br />
          <span className={styles.heroAccent}>
            <ET field="hero_accent">Ziel erreichen.</ET>
          </span>
        </h1>
        <p className={styles.heroSubtitle}>
          <ET field="hero_subtext" block>
            Erstklassige Kurse, motivierte Trainer und eine Community, die dich antreibt.
            Buch jetzt deinen ersten Kurs — kostenlos.
          </ET>
        </p>
        <div className={styles.heroActions}>
          <Link to={`${base}/buchen`} className={styles.heroCta}>Kurs buchen →</Link>
          <Link to={`${base}/kurse`}  className={styles.heroSecondary}>Kurse entdecken</Link>
        </div>
        <div className={styles.heroStats}>
          {(content.stats ?? []).map((st, i) => (
            <div key={i} className={styles.stat}>
              <span className={styles.statValue}>
                <ET field={`stats.${i}.value`}>{st.value}</ET>
              </span>
              <span className={styles.statLabel}>
                <ET field={`stats.${i}.label`}>{st.label}</ET>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Kurse Preview */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionEyebrow}>
              <ET field="courses_eyebrow">Was wir bieten</ET>
            </div>
            <h2 className={styles.sectionTitle}>
              <ET field="courses_title">Unsere Kurse</ET>
            </h2>
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
            <div className={styles.sectionEyebrow}>
              <ET field="trainers_eyebrow">Dein Team</ET>
            </div>
            <h2 className={styles.sectionTitle}>
              <ET field="trainers_title">Unsere Trainer</ET>
            </h2>
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
          <h2 className={styles.ctaBannerTitle}>
            <ET field="cta_headline">Bereit loszulegen?</ET>
          </h2>
          <p className={styles.ctaBannerText}>
            <ET field="cta_subtext" block>
              Buch deinen ersten Kurs heute – ganz ohne Mitgliedschaft.
            </ET>
          </p>
        </div>
        <Link to={`${base}/buchen`} className={styles.heroCta}>Jetzt buchen →</Link>
      </section>

    </div>
  )
}
