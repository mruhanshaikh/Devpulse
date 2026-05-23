import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { UserStoreProvider } from './context/UserStoreContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import { Skeleton } from './components/ui'
import { Toaster } from 'sonner'

const Overview      = lazy(() => import('./pages/Overview'))
const KanbanPage    = lazy(() => import('./pages/KanbanPage').then(m => ({ default: m.KanbanPage })))
const SnippetsPage  = lazy(() => import('./pages/SnippetsPage'))
const FocusPage     = lazy(() => import('./pages/FocusPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))

const PageLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 32 }}>
    <Skeleton width="30%" height="32px" radius="8px" />
    <Skeleton width="100%" height="120px" radius="12px" />
    <Skeleton width="100%" height="200px" radius="12px" />
  </div>
)

function ProtectedRoutes() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return (
    <UserStoreProvider username={user.login}>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"          element={<Overview />} />
            <Route path="/kanban"    element={<KanbanPage />} />
            <Route path="/snippets"  element={<SnippetsPage />} />
            <Route path="/focus"     element={<FocusPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </UserStoreProvider>
  )
}

export default function App() {
  const { isAuthenticated } = useAuth()
  return (
    <>
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/*"     element={<ProtectedRoutes />} />
    </Routes>
    <Toaster
        position="top-right"
        richColors
        closeButton
        theme="dark"
        toastOptions={{
          style: {
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          },
        }}
      />
    </>
  )
}
