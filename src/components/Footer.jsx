import { Link, useParams } from 'react-router-dom'
import { useStudio } from '../context/StudioContext.jsx'
import styles from './Footer.module.css'

export default function Footer() {
  const { settings } = useStudio()
  const { slug } = useParams()
  const base = `/studio/${slug}`

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span>{settings.logo_emoji ?? '⚡'}</span>
            <span>{settings.name ?? 'Fit'}<span className={styles.logoAccent}>Book</span></span>
          </div>
          <p className={styles.tagline}>{settings.description ?? 'Dein Fitnessstudio. Deine Kurse. Deine Zeit.'}</p>
        </div>
        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <div className={styles.linkGroupTitle}>Angebot</div>
            <Link to={`${base}/kurse`}   className={styles.link}>Kurse</Link>
            <Link to={`${base}/trainer`} className={styles.link}>Trainer</Link>
            <Link to={`${base}/preise`}  className={styles.link}>Preise</Link>
            <Link to={`${base}/buchen`}  className={styles.link}>Kurs buchen</Link>
          </div>
          <div className={styles.linkGroup}>
            <div className={styles.linkGroupTitle}>Studio</div>
            <a href="#" className={styles.link}>Über uns</a>
            <a href="#" className={styles.link}>Kontakt</a>
            <a href="#" className={styles.link}>Jobs</a>
          </div>
          <div className={styles.linkGroup}>
            <div className={styles.linkGroupTitle}>Rechtliches</div>
            <a href="#" className={styles.link}>Impressum</a>
            <a href="#" className={styles.link}>Datenschutz</a>
            <a href="#" className={styles.link}>AGB</a>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} {settings.name ?? 'FitBook'} · Alle Rechte vorbehalten</p>
      </div>
    </footer>
  )
}
