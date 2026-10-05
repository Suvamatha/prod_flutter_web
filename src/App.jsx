import { lazy, Suspense, useEffect } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import { ToastProvider } from './hooks/useToast'
import { ProjectsProvider } from './hooks/useProjects'
import AuthGate from './components/AuthGate'

const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const CreateProjectPage = lazy(() => import('./pages/CreateProjectPage'))
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'))
const PublicDemoPage = lazy(() => import('./pages/PublicDemoPage'))
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'))
const EmbedDemoPage = lazy(() => import('./pages/EmbedDemoPage'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function DashboardLayout() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-svh">
      <Navbar />
      <main key={pathname} className="animate-fade-in">
        <Outlet />
      </main>
    </div>
  )
}

function PrivateApp() {
  return <AuthGate><DashboardLayout /></AuthGate>
}

export default function App() {
  return (
    <ToastProvider>
      <ProjectsProvider>
        <ScrollToTop />
        <Suspense fallback={<div className="min-h-svh animate-pulse bg-[#FAFAFA]" />}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route element={<PrivateApp />}>
            <Route index element={<ProjectsPage />} />
            <Route path="projects/:slug" element={<ProjectDetailPage />} />
            <Route path="new" element={<CreateProjectPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          {/* Public share pages: standalone, no dashboard chrome. */}
          <Route path="d/:demoId" element={<PublicDemoPage />} />
          <Route path="embed/:demoId" element={<EmbedDemoPage />} />
          <Route path="fluttershow/d/:demoId" element={<PublicDemoPage />} />
        </Routes>
        </Suspense>
      </ProjectsProvider>
    </ToastProvider>
  )
}
