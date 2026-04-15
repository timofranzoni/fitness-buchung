import { useState } from 'react'
import { Link } from 'react-router-dom'
import { COURSES, INTENSITY_COLORS } from '../data/courses.js'
import { TRAINERS } from '../data/trainers.js'
import styles from './CoursesPage.module.css'

const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
const SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

// Build a simple weekly schedule
function buildSchedule() {
  const schedule = {}
  DAYS.forEach(day => { schedule[day] = [] })
  COURSES.forEach(course => {
    course.slots.forEach((slot, i) => {
      const day = DAYS[i % 5 + (course.id === 'yoga' ? 0 : course.id === 'crossfit' ? 1 : course.id === 'spinning' ? 2 : course.id === 'pilates' ? 0 : course.id === 'boxing' ? 3 : 4) % 5]
      const trainer = TRAINERS.find(t => t.courses.includes(course.name))
      schedule[day].push({ course, slot, trainer })
    })
  })
  return schedule
}

export default function CoursesPage() {
  const [activeFilter, setActiveFilter] = useState('Alle')
  const [activeDay, setActiveDay] = useState('Montag')

  const filters = ['Alle', 'Leicht', 'Mittel', 'Intensiv']
  const filtered = activeFilter === 'Alle' ? COURSES : COURSES.filter(c => c.intensity === activeFilter)

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
          <button
            key={f}
            className={`${styles.filterBtn} ${activeFilter === f ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Course cards */}
      <div className={styles.courseGrid}>
        {filtered.map(course => {
          const trainer = TRAINERS.find(t => t.courses.includes(course.name))
          return (
            <div key={course.id} className={styles.courseCard} style={{ '--c': course.color }}>
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
                <span className={styles.metaItem}>📅 {course.slots.length}× täglich</span>
              </div>
              <div className={styles.cardSlots}>
                {course.slots.map(s => (
                  <span key={s} className={styles.slotChip}>{s}</span>
                ))}
              </div>
              {trainer && (
                <div className={styles.cardTrainer}>
                  <div className={styles.trainerDot} style={{ background: trainer.color }}>{trainer.initials}</div>
                  <span className={styles.trainerName}>{trainer.name}</span>
                </div>
              )}
              <Link to="/buchen" className={styles.bookBtn}>Jetzt buchen →</Link>
            </div>
          )
        })}
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
            <button
              key={day}
              className={`${styles.dayTab} ${activeDay === day ? styles.dayTabActive : ''}`}
              onClick={() => setActiveDay(day)}
            >
              <span className={styles.dayShort}>{SHORT[i]}</span>
              <span className={styles.dayFull}>{day}</span>
            </button>
          ))}
        </div>

        <div className={styles.scheduleGrid}>
          {COURSES.map((course, ci) => {
            const slot = course.slots[ci % course.slots.length]
            const trainer = TRAINERS.find(t => t.courses.includes(course.name))
            return (
              <div key={course.id} className={styles.scheduleItem} style={{ '--c': course.color }}>
                <div className={styles.scheduleTime}>{slot} Uhr</div>
                <div className={styles.scheduleIcon}>{course.icon}</div>
                <div className={styles.scheduleName}>{course.name}</div>
                <div className={styles.scheduleDuration}>{course.duration} Min.</div>
                {trainer && <div className={styles.scheduleTrainer}>{trainer.name.split(' ')[0]}</div>}
                <Link to="/buchen" className={styles.scheduleBook}>+</Link>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
