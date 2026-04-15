import { NavLink } from 'react-router-dom'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>
            Fit<span className={styles.logoAccent}>Book</span>
          </span>
        </NavLink>
        <nav className={styles.nav}>
          <NavLink to="/kurse" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>
            Kurse
          </NavLink>
          <NavLink to="/trainer" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>
            Trainer
          </NavLink>
          <NavLink to="/preise" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>
            Preise
          </NavLink>
          <NavLink to="/buchen" className={({ isActive }) => `${styles.navCta} ${isActive ? styles.navCtaActive : ''}`}>
            Kurs buchen
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
