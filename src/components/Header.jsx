import { NavLink } from 'react-router-dom'
import { useStudio } from '../context/StudioContext.jsx'
import styles from './Header.module.css'

export default function Header() {
  const { settings } = useStudio()

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo}>
          {settings.logo_url
            ? <img src={settings.logo_url} alt={settings.name}
                className={styles.logoImg}
                onError={e => e.currentTarget.style.display = 'none'} />
            : <span className={styles.logoIcon}>{settings.logo_emoji ?? '⚡'}</span>
          }
          <span className={styles.logoText}>{settings.name ?? 'FitBook'}</span>
        </NavLink>
        <nav className={styles.nav}>
          <NavLink to="/kurse"   className={({ isActive }) => `${styles.navLink}   ${isActive ? styles.navLinkActive : ''}`}>Kurse</NavLink>
          <NavLink to="/trainer" className={({ isActive }) => `${styles.navLink}   ${isActive ? styles.navLinkActive : ''}`}>Trainer</NavLink>
          <NavLink to="/preise"  className={({ isActive }) => `${styles.navLink}   ${isActive ? styles.navLinkActive : ''}`}>Preise</NavLink>
          <NavLink to="/buchen"  className={({ isActive }) => `${styles.navCta}    ${isActive ? styles.navCtaActive  : ''}`}>Kurs buchen</NavLink>
        </nav>
      </div>
    </header>
  )
}
