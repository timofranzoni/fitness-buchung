import { NavLink, useParams } from 'react-router-dom'
import { useStudio } from '../context/StudioContext.jsx'
import styles from './Header.module.css'

export default function Header() {
  const { settings } = useStudio()
  const { slug } = useParams()
  const base = `/studio/${slug}`

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to={`${base}/`} className={styles.logo}>
          {settings.logo_url
            ? <img src={settings.logo_url} alt={settings.name}
                className={styles.logoImg}
                onError={e => e.currentTarget.style.display = 'none'} />
            : <span className={styles.logoIcon}>{settings.logo_emoji ?? '⚡'}</span>
          }
          <span className={styles.logoText}>{settings.name ?? 'FitBook'}</span>
        </NavLink>
        <nav className={styles.nav}>
          <NavLink to={`${base}/kurse`}   className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>Kurse</NavLink>
          <NavLink to={`${base}/trainer`} className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>Trainer</NavLink>
          <NavLink to={`${base}/preise`}  className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>Preise</NavLink>
          <NavLink to={`${base}/buchen`}  className={({ isActive }) => `${styles.navCta}  ${isActive ? styles.navCtaActive  : ''}`}>Kurs buchen</NavLink>
        </nav>
      </div>
    </header>
  )
}
