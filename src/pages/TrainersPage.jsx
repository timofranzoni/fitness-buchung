import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchTrainers } from '../lib/trainerService.js'
import { useStudio } from '../context/StudioContext.jsx'
import styles from './TrainersPage.module.css'

function initials(name) {
  return (name ?? '?').trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0,2)
}

export default function TrainersPage() {
  const { studio } = useStudio()
  const { slug } = useParams()
  const base = `/studio/${slug}`

  const [trainers, setTrainers] = useState([])
  const [loading, setLoading]   = useState(true)
  const [active, setActive]     = useState(null)

  useEffect(() => {
    fetchTrainers(studio?.id).then(setTrainers).finally(() => setLoading(false))
  }, [studio?.id])

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.eyebrow}>Dein Team</div>
        <h1 className={styles.title}>Unsere Trainer</h1>
        <p className={styles.subtitle}>Zertifiziert, motiviert und leidenschaftlich dabei – lern dein Team kennen.</p>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <span>Trainer werden geladen…</span>
        </div>
      ) : (
        <div className={styles.grid}>
          {trainers.map(trainer => (
            <div key={trainer.id ?? trainer.name}
              className={`${styles.card} ${active === (trainer.id ?? trainer.name) ? styles.cardOpen : ''}`}
              style={{ '--tc': trainer.color }}>
              <div className={styles.cardMain}>
                <div className={styles.avatarWrap}>
                  <div className={styles.avatar}>
                    {trainer.photo_url
                      ? <img src={trainer.photo_url} alt={trainer.name}
                          style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }}
                          onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex' }} />
                      : null}
                    <span style={{ display: trainer.photo_url ? 'none' : 'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%' }}>
                      {initials(trainer.name)}
                    </span>
                  </div>
                  <div className={styles.avatarRing} />
                </div>
                <div className={styles.cardInfo}>
                  <div className={styles.cardName}>{trainer.name}</div>
                  <div className={styles.cardRole}>{trainer.role}</div>
                  <div className={styles.cardRating}>
                    <span className={styles.stars}>{'★'.repeat(Math.round(trainer.rating ?? 5))}</span>
                    <span className={styles.ratingText}>{trainer.rating} · {trainer.reviews} Bewertungen</span>
                  </div>
                  {trainer.experience && (
                    <div className={styles.cardExp}>
                      <span className={styles.expBadge}>⚡ {trainer.experience} Erfahrung</span>
                    </div>
                  )}
                </div>
                <button
                  className={styles.toggleBtn}
                  onClick={() => setActive(active === (trainer.id ?? trainer.name) ? null : (trainer.id ?? trainer.name))}>
                  {active === (trainer.id ?? trainer.name) ? '−' : '+'}
                </button>
              </div>

              {active === (trainer.id ?? trainer.name) && (
                <div className={styles.cardDetail}>
                  <div className={styles.divider} />
                  {trainer.bio && <p className={styles.bio}>{trainer.bio}</p>}
                  <div className={styles.detailCols}>
                    {trainer.certifications?.length > 0 && (
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
                    )}
                    <div className={styles.detailCol}>
                      {trainer.courses?.length > 0 && (
                        <>
                          <div className={styles.detailLabel}>Kurse</div>
                          <div className={styles.courseChips}>
                            {trainer.courses.map(c => <span key={c} className={styles.courseChip}>{c}</span>)}
                          </div>
                        </>
                      )}
                      {trainer.schedule?.length > 0 && (
                        <>
                          <div className={styles.detailLabel} style={{ marginTop:'1rem' }}>Nächste Einheiten</div>
                          <div className={styles.scheduleChips}>
                            {trainer.schedule.map(sl => <span key={sl} className={styles.scheduleChip}>{sl}</span>)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <Link to={`${base}/buchen`} className={styles.bookBtn}>
                    Kurs bei {trainer.name.split(' ')[0]} buchen →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={styles.teamCta}>
        <div className={styles.teamCtaAvatars}>
          {trainers.slice(0,5).map(t => (
            <div key={t.id ?? t.name} className={styles.teamCtaAvatar} style={{ background: t.color }}>
              {initials(t.name)}
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
