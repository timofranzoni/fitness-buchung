import { useState } from 'react'
import BookingForm from '../components/BookingForm.jsx'
import BookingConfirmation from '../components/BookingConfirmation.jsx'
import styles from './BookingPage.module.css'

export default function BookingPage() {
  const [booking, setBooking] = useState(null)

  return (
    <div className={styles.page}>
      {booking ? (
        <BookingConfirmation booking={booking} onReset={() => setBooking(null)} />
      ) : (
        <BookingForm onSubmit={setBooking} />
      )}
    </div>
  )
}
