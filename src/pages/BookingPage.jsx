import { useState, useEffect } from 'react'
import BookingForm from '../components/BookingForm.jsx'
import BookingConfirmation from '../components/BookingConfirmation.jsx'
import { fetchCourses } from '../lib/courseService.js'
import { createBooking, sendConfirmationEmail } from '../lib/bookingService.js'
import { useStudio } from '../context/StudioContext.jsx'
import styles from './BookingPage.module.css'

export default function BookingPage() {
  const { studio } = useStudio()
  const [booking, setBooking] = useState(null)
  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  useEffect(() => {
    fetchCourses(studio?.id)
      .then(setCourses)
      .finally(() => setLoadingCourses(false))
  }, [studio?.id])

  async function handleSubmit(data) {
    try {
      await createBooking(studio?.id, data)
    } catch (err) {
      console.error('Buchung konnte nicht gespeichert werden:', err)
    }

    sendConfirmationEmail(data).catch(err =>
      console.warn('E-Mail konnte nicht gesendet werden:', err)
    )

    setBooking(data)
  }

  return (
    <div className={styles.page}>
      {booking ? (
        <BookingConfirmation booking={booking} onReset={() => setBooking(null)} />
      ) : loadingCourses ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Kurse werden geladen…</span>
        </div>
      ) : (
        <BookingForm courses={courses} onSubmit={handleSubmit} />
      )}
    </div>
  )
}
