import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import CoursesPage from './pages/CoursesPage.jsx'
import TrainersPage from './pages/TrainersPage.jsx'
import PricingPage from './pages/PricingPage.jsx'
import BookingPage from './pages/BookingPage.jsx'
import styles from './App.module.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <Header />
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/kurse" element={<CoursesPage />} />
            <Route path="/trainer" element={<TrainersPage />} />
            <Route path="/preise" element={<PricingPage />} />
            <Route path="/buchen" element={<BookingPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
