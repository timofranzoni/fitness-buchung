import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom'
import { StudioProvider, useStudio } from './context/StudioContext.jsx'
import { ContentProvider } from './context/ContentContext.jsx'
import { LiveToolbar }    from './components/LiveEditor.jsx'
import Header       from './components/Header.jsx'
import Footer       from './components/Footer.jsx'
import HomePage     from './pages/HomePage.jsx'
import CoursesPage  from './pages/CoursesPage.jsx'
import TrainersPage from './pages/TrainersPage.jsx'
import PricingPage  from './pages/PricingPage.jsx'
import BookingPage  from './pages/BookingPage.jsx'
import AdminPage    from './pages/AdminPage.jsx'
import SuperAdminPage from './pages/SuperAdminPage.jsx'
import styles from './App.module.css'

// ─── Studio-Not-Found ─────────────────────────────────────────────────────────

function StudioNotFound() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem', textAlign:'center', padding:'2rem' }}>
      <div style={{ fontSize:'4rem' }}>🏋️</div>
      <h1 style={{ color:'var(--text-primary)', fontSize:'1.75rem', fontWeight:700 }}>Studio nicht gefunden</h1>
      <p style={{ color:'var(--text-secondary)' }}>Das Studio existiert nicht oder ist nicht mehr aktiv.</p>
    </div>
  )
}

// ─── Studio-Routes (innerhalb von Studio- + Content-Provider) ────────────────

function StudioRoutes() {
  const { pathname } = useLocation()
  const { studio, loading, notFound } = useStudio()
  const { slug } = useParams()
  const base    = `/studio/${slug}`
  const isAdmin = pathname === `${base}/admin`

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:36, height:36, border:'3px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      </div>
    )
  }

  if (notFound) return <StudioNotFound />

  return (
    <ContentProvider studioId={studio?.id}>
      <LiveToolbar />
      <div className={styles.app}>
        {!isAdmin && <Header />}
        <main className={styles.main}>
          <Routes>
            <Route path="/"       element={<HomePage />} />
            <Route path="kurse"   element={<CoursesPage />} />
            <Route path="trainer" element={<TrainersPage />} />
            <Route path="preise"  element={<PricingPage />} />
            <Route path="buchen"  element={<BookingPage />} />
            <Route path="admin"   element={<AdminPage />} />
          </Routes>
        </main>
        {!isAdmin && <Footer />}
      </div>
    </ContentProvider>
  )
}

function StudioLayout() {
  const { slug } = useParams()
  return (
    <StudioProvider slug={slug}>
      <StudioRoutes />
    </StudioProvider>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/studio/:slug/*" element={<StudioLayout />} />
        <Route path="/superadmin/*"   element={<SuperAdminPage />} />
        <Route path="/"               element={<Navigate to="/studio/demo" replace />} />
        <Route path="/kurse"          element={<Navigate to="/studio/demo/kurse"   replace />} />
        <Route path="/trainer"        element={<Navigate to="/studio/demo/trainer" replace />} />
        <Route path="/preise"         element={<Navigate to="/studio/demo/preise"  replace />} />
        <Route path="/buchen"         element={<Navigate to="/studio/demo/buchen"  replace />} />
        <Route path="/admin"          element={<Navigate to="/studio/demo/admin"   replace />} />
      </Routes>
    </BrowserRouter>
  )
}
