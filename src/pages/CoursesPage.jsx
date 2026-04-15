import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchCourses } from '../lib/courseService.js'
import { useStudio } from '../context/StudioContext.jsx'
import { INTENSITY_COLORS } from '../data/courses.js'
import styles from './CoursesPage.module.css'

const DAYS  = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
const SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export default function CoursesPage() {
  const { studio } = useStudio()
  const { slug } = useParams()
  const base = `/studio/${slug}`

  const [courses, setCourses]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [activeFilter, setActiveFilter] = useState('Alle')
  const [activeDay, setActiveDay]     = useState('Montag')

  useEffect(() => {
    fetchCourses(studio?.id)
      .then(setCourses)
      .finally(() => setLoading(false))
  }, [studio?.id])

  const filters  = ['Alle', 'Leicht', 'Mittel', 'Intensiv']
  const filtered = activeFilter === 'Alle' ? courses : courses.filter(c => c.intensity === activeFilter)

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.eyebrow}>Unser Angebot</div>
        <h1 className={styles.title}>Alle Kurse</h1>
        <p className={styles.subtitle}>Von entspanntem Yoga bis hochintensivem CrossFit – für jedes Fitnesslevel das Richtige.</p>
      </div>

      {/* Filter */}
      <div className={styles.filterBar}>
        {filters.map(f => (
          <button key={f}
            className={`${styles.filterBtn} ${activeFilter === f ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-secondary)' }}>
          <div style={{ width:36, height:36, border:'3px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 1rem' }} />
          Kurse werden geladen…
        </div>
      ) : (
        <>
          {/* Course cards */}
          <div className={styles.courseGrid}>
            {filtered.map(course => (
              <div key={course.id ?? course.name} className={styles.courseCard} style={{ '--c': course.color }}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>{course.icon}</div>
                  <span className={styles.intensityBadge} style={{ color: INTENSITY_COLORS[course.intensity], borderColor: INTENSITY_COLORS[course.intensity] + '40', background: INTENSITY_COLORS[course.intensity] + '15' }}>
                    {course.intensity}
                  </span>
                </div>
                <h3 className={styles.cardTitle}>{course.name}</h3>
                <p className={styles.cardDesc}>{course.description}</p>
                <div className={styles.cardMeta}>
                  <span className={styles.metaItem}>⏱️ {course.duration} Min.</span>
                  <span className={styles.metaItem}>📅 {(course.slots ?? []).length}× täglich</span>
                </div>
                <div className={styles.cardSlots}>
                  {(course.slots ?? []).map(s => (
                    <span key={s} className={styles.slotChip}>{s}</span>
                  ))}
                </div>
                <Link to={`${base}/buchen`} className={styles.bookBtn}>Jetzt buchen →</Link>
              </div>
            ))}
          </div>

          {/* Wochenplan */}
          <div className={styles.scheduleSection}>
            <div className={styles.scheduleHeader}>
              <div>
                <div className={styles.eyebrow}>Überblick</div>
                <h2 className={styles.scheduleTitle}>Wochenstundenplan</h2>
              </div>
            </div>

            <div className={styles.dayTabs}>
              {DAYS.map((day, i) => (
                <button key={day}
                  className={`${styles.dayTab} ${activeDay === day ? styles.dayTabActive : ''}`}
                  onClick={() => setActiveDay(day)}>
                  <span className={styles.dayShort}>{SHORT[i]}</span>
                  <span className={styles.dayFull}>{day}</span>
                </button>
              ))}
            </div>

            <div className={styles.scheduleGrid}>
              {courses.map((course, ci) => {
                const slot = (course.slots ?? [])[ci % Math.max((course.slots ?? []).length, 1)]
                return (
                  <div key={course.id ?? course.name} className={styles.scheduleItem} style={{ '--c': course.color }}>
                    <div className={styles.scheduleTime}>{slot} Uhr</div>
                    <div className={styles.scheduleIcon}>{course.icon}</div>
                    <div className={styles.scheduleName}>{course.name}</div>
                    <div className={styles.scheduleDuration}>{course.duration} Min.</div>
                    <Link to={`${base}/buchen`} className={styles.scheduleBook}>+</Link>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
