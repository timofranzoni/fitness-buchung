import { useState } from 'react'
import { COURSES, INTENSITY_COLORS } from '../data/courses.js'
import styles from './BookingForm.module.css'

const STEPS = ['Kurs wählen', 'Uhrzeit wählen', 'Deine Daten']

export default function BookingForm({ onSubmit }) {
  const [step, setStep] = useState(0)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [form, setForm] = useState({ name: '', email: '' })
  const [errors, setErrors] = useState({})
  const [date, setDate] = useState(getTomorrowDate())

  function getTomorrowDate() {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }

  function formatDateDE(dateStr) {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  function handleCourseSelect(course) {
    setSelectedCourse(course)
    setSelectedSlot(null)
  }

  function handleNext() {
    if (step === 0 && !selectedCourse) return
    if (step === 1 && !selectedSlot) return
    setStep(s => s + 1)
  }

  function handleBack() {
    setStep(s => s - 1)
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Bitte gib deinen Namen ein.'
    if (!form.email.trim()) {
      e.email = 'Bitte gib deine E-Mail-Adresse ein.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Ungültige E-Mail-Adresse.'
    }
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) {
      setErrors(e2)
      return
    }
    onSubmit({
      ...form,
      course: selectedCourse,
      slot: selectedSlot,
      date,
      dateFormatted: formatDateDE(date),
      bookingId: `FB-${Date.now().toString(36).toUpperCase()}`,
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Kurs buchen</h1>
        <p className={styles.subtitle}>Wähle deinen Kurs und sichere dir deinen Platz</p>
      </div>

      {/* Stepper */}
      <div className={styles.stepper}>
        {STEPS.map((label, i) => (
          <div key={i} className={styles.stepWrapper}>
            <div className={`${styles.step} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ''}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Kurs wählen */}
      {step === 0 && (
        <div className={styles.stepContent}>
          <div className={styles.courseGrid}>
            {COURSES.map(course => (
              <button
                key={course.id}
                className={`${styles.courseCard} ${selectedCourse?.id === course.id ? styles.courseCardSelected : ''}`}
                onClick={() => handleCourseSelect(course)}
                style={{ '--course-color': course.color }}
              >
                <div className={styles.courseIcon}>{course.icon}</div>
                <div className={styles.courseName}>{course.name}</div>
                <div className={styles.courseDesc}>{course.description}</div>
                <div className={styles.courseMeta}>
                  <span
                    className={styles.intensity}
                    style={{ color: INTENSITY_COLORS[course.intensity] }}
                  >
                    ● {course.intensity}
                  </span>
                  <span className={styles.duration}>{course.duration} Min.</span>
                </div>
                {selectedCourse?.id === course.id && (
                  <div className={styles.selectedBadge}>✓ Ausgewählt</div>
                )}
              </button>
            ))}
          </div>
          <div className={styles.actions}>
            <button
              className={styles.btnPrimary}
              onClick={handleNext}
              disabled={!selectedCourse}
            >
              Weiter →
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Uhrzeit wählen */}
      {step === 1 && (
        <div className={styles.stepContent}>
          <div className={styles.datePicker}>
            <label className={styles.fieldLabel}>
              <span className={styles.fieldIcon}>📅</span> Datum wählen
            </label>
            <input
              type="date"
              value={date}
              min={getTomorrowDate()}
              onChange={e => setDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>

          <div className={styles.selectedCourseBar}>
            <span className={styles.selectedCourseIcon}>{selectedCourse.icon}</span>
            <div>
              <div className={styles.selectedCourseName}>{selectedCourse.name}</div>
              <div className={styles.selectedCourseDate}>{formatDateDE(date)}</div>
            </div>
          </div>

          <div className={styles.slotsLabel}>Verfügbare Uhrzeiten</div>
          <div className={styles.slotsGrid}>
            {selectedCourse.slots.map(slot => (
              <button
                key={slot}
                className={`${styles.slotBtn} ${selectedSlot === slot ? styles.slotBtnSelected : ''}`}
                onClick={() => setSelectedSlot(slot)}
              >
                {slot} Uhr
              </button>
            ))}
          </div>

          <div className={styles.actions}>
            <button className={styles.btnSecondary} onClick={handleBack}>← Zurück</button>
            <button
              className={styles.btnPrimary}
              onClick={handleNext}
              disabled={!selectedSlot}
            >
              Weiter →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Deine Daten */}
      {step === 2 && (
        <div className={styles.stepContent}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Deine Buchung</div>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryRowIcon}>{selectedCourse.icon}</span>
                <span className={styles.summaryRowLabel}>Kurs</span>
                <span className={styles.summaryRowValue}>{selectedCourse.name}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryRowIcon}>📅</span>
                <span className={styles.summaryRowLabel}>Datum</span>
                <span className={styles.summaryRowValue}>{formatDateDE(date)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryRowIcon}>🕐</span>
                <span className={styles.summaryRowLabel}>Uhrzeit</span>
                <span className={styles.summaryRowValue}>{selectedSlot} Uhr</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryRowIcon}>⏱️</span>
                <span className={styles.summaryRowLabel}>Dauer</span>
                <span className={styles.summaryRowValue}>{selectedCourse.duration} Minuten</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="name">Vollständiger Name</label>
              <input
                id="name"
                type="text"
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                placeholder="Max Mustermann"
                value={form.name}
                onChange={e => {
                  setForm(f => ({ ...f, name: e.target.value }))
                  setErrors(er => ({ ...er, name: undefined }))
                }}
                autoComplete="name"
              />
              {errors.name && <div className={styles.errorMsg}>{errors.name}</div>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="email">E-Mail-Adresse</label>
              <input
                id="email"
                type="email"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="max@beispiel.de"
                value={form.email}
                onChange={e => {
                  setForm(f => ({ ...f, email: e.target.value }))
                  setErrors(er => ({ ...er, email: undefined }))
                }}
                autoComplete="email"
              />
              {errors.email && <div className={styles.errorMsg}>{errors.email}</div>}
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.btnSecondary} onClick={handleBack}>← Zurück</button>
              <button type="submit" className={styles.btnPrimary}>
                Jetzt buchen ✓
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
