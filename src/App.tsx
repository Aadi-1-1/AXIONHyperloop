import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'

const NetworkPage = lazy(() => import('./pages/NetworkPage'))
const BusinessPage = lazy(() => import('./pages/BusinessPage'))
const InvestorsPage = lazy(() => import('./pages/InvestorsPage'))
const EvidencePage = lazy(() => import('./pages/EvidencePage'))
const LeadershipPage = lazy(() => import('./pages/LeadershipPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const Presentation = lazy(() => import('./present/Presentation'))

function Loading() {
  return (
    <div className="page-loading" role="status" aria-live="polite">
      <span className="label">Loading</span>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/present" element={<Navigate to="/present/vision" replace />} />
        <Route path="/present/:slug" element={<Presentation />} />
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="network" element={<NetworkPage />} />
          <Route path="business" element={<BusinessPage />} />
          <Route path="investors" element={<InvestorsPage />} />
          <Route path="evidence" element={<EvidencePage />} />
          <Route path="leadership" element={<LeadershipPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
