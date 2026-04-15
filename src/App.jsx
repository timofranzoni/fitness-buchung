import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { StudioProvider } from './context/StudioContext.jsx'
import Header     from './components/Header.jsx'
import Footer     from './components/Footer.jsx'
import HomePage   from './pages/HomePage.jsx'
import CoursesPage  from './pages/CoursesPage.jsx'
import TrainersPage from './pages/TrainersPage.jsx'
import PricingPage  from './pages/PricingPage.jsx'
import BookingPage  from './pages/BookingPage.jsx'
import AdminPage    from './pages/AdminPage.jsx'
import styles from './App.module.css'

function Layout() {
  const { pathname } = useLocation()
  const isAdmin = pathname === '/admin'

  return (
    <div className={styles.app}>
      {!isAdmin && <Header />}
      <main className={styles.main}>
        <Routes>
          <Route path="/"        element={<HomePage />} />
          <Route path="/kurse"   element={<CoursesPage />} />
          <Route path="/trainer" element={<TrainersPage />} />
          <Route path="/preise"  element={<PricingPage />} />
          <Route path="/buchen"  element={<BookingPage />} />
          <Route path="/admin"   element={<AdminPage />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <StudioProvider>
        <Layout />
      </StudioProvider>
    </BrowserRouter>
  )
}
