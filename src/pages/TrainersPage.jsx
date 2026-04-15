import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TRAINERS } from '../data/trainers.js'
import styles from './TrainersPage.module.css'

export default function TrainersPage() {
  const [active, setActive] = useState(null)

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.eyebrow}>Dein Team</div>
        <h1 className={styles.title}>Unsere Trainer</h1>
        <p className={styles.subtitle}>
          Zertifiziert, motiviert und leidenschaftlich dabei – lern dein Team kennen.
        </p>
      </div>

      <div className={styles.grid}>
        {TRAINERS.map(trainer => (
          <div
            key={trainer.id}
            className={`${styles.card} ${active === trainer.id ? styles.cardOpen : ''}`}
            style={{ '--tc': trainer.color }}
          >
            <div className={styles.cardMain}>
              <div className={styles.avatarWrap}>
                <div className={styles.avatar}>{trainer.initials}</div>
                <div className={styles.avatarRing} />
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardName}>{trainer.name}</div>
                <div className={styles.cardRole}>{trainer.role}</div>
                <div className={styles.cardRating}>
                  <span className={styles.stars}>{'★'.repeat(Math.round(trainer.rating))}</span>
                  <span className={styles.ratingText}>{trainer.rating} · {trainer.reviews} Bewertungen</span>
                </div>
                <div className={styles.cardExp}>
                  <span className={styles.expBadge}>⚡ {trainer.experience} Erfahrung</span>
                </div>
              </div>
              <button
                className={styles.toggleBtn}
                onClick={() => setActive(active === trainer.id ? null : trainer.id)}
                aria-label="Profil anzeigen"
              >
                {active === trainer.id ? '−' : '+'}
              </button>
            </div>

            {active === trainer.id && (
              <div className={styles.cardDetail}>
                <div className={styles.divider} />
                <p className={styles.bio}>{trainer.bio}</p>

                <div className={styles.detailCols}>
                  <div className={styles.detailCol}>
                    <div className={styles.detailLabel}>Zertifikate</div>
                    <ul className={styles.certList}>
                      {trainer.certifications.map(c => (
                        <li key={c} className={styles.certItem}>
                          <span className={styles.certDot} />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.detailCol}>
                    <div className={styles.detailLabel}>Kurse</div>
                    <div className={styles.courseChips}>
                      {trainer.courses.map(c => (
                        <span key={c} className={styles.courseChip}>{c}</span>
                      ))}
                    </div>
                    <div className={styles.detailLabel} style={{ marginTop: '1rem' }}>Nächste Einheiten</div>
                    <div className={styles.scheduleChips}>
                      {trainer.schedule.map(s => (
                        <span key={s} className={styles.scheduleChip}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <Link to="/buchen" className={styles.bookBtn}>
                  Kurs bei {trainer.name.split(' ')[0]} buchen →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Team CTA */}
      <div className={styles.teamCta}>
        <div className={styles.teamCtaAvatars}>
          {TRAINERS.map(t => (
            <div key={t.id} className={styles.teamCtaAvatar} style={{ background: t.color }}>
              {t.initials}
            </div>
          ))}
        </div>
        <div className={styles.teamCtaText}>
          <h3 className={styles.teamCtaTitle}>Werde Teil des Teams</h3>
          <p className={styles.teamCtaSubtitle}>Wir suchen leidenschaftliche Fitness-Trainer. Bewirb dich jetzt.</p>
        </div>
        <a href="#" className={styles.teamCtaBtn}>Jetzt bewerben</a>
      </div>
    </div>
  )
}
