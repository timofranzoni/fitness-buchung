import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span>⚡</span>
            <span>Fit<span className={styles.logoAccent}>Book</span></span>
          </div>
          <p className={styles.tagline}>Dein Fitnessstudio. Deine Kurse. Deine Zeit.</p>
        </div>
        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <div className={styles.linkGroupTitle}>Angebot</div>
            <Link to="/kurse" className={styles.link}>Kurse</Link>
            <Link to="/trainer" className={styles.link}>Trainer</Link>
            <Link to="/preise" className={styles.link}>Preise</Link>
            <Link to="/buchen" className={styles.link}>Kurs buchen</Link>
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
        <p>© 2026 FitBook GmbH · Alle Rechte vorbehalten</p>
      </div>
    </footer>
  )
}
