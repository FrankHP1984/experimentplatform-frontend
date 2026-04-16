import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// Public pages
import Landing           from '../pages/public/Landing'
import ParticipantInvite from '../pages/public/ParticipantInvite'

// Researcher pages
import Onboarding          from '../pages/researcher/Onboarding'
import Dashboard           from '../pages/researcher/Dashboard'
import ExperimentDetail    from '../pages/researcher/ExperimentDetail'
import ExperimentWizard    from '../pages/researcher/ExperimentWizard'
import ParticipantDetail   from '../pages/researcher/ParticipantDetail'
import ResponsesAnalytics  from '../pages/researcher/ResponsesAnalytics'
import ProfileResearcher   from '../pages/researcher/ProfileResearcher'

// Participant pages
import DashboardParticipant from '../pages/participant/DashboardParticipant'
import Questionnaire        from '../pages/participant/Questionnaire'
import ProfileParticipant   from '../pages/participant/ProfileParticipant'

// Error pages
import NotFound      from '../pages/errors/NotFound'
import TokenExpired  from '../pages/errors/TokenExpired'
import AccessDenied  from '../pages/errors/AccessDenied'
import ServerError   from '../pages/errors/ServerError'

// ----------------------------------------------------------------
// PrivateRoute: protects routes by role
// ----------------------------------------------------------------
function PrivateRoute({ children, role }) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (role && user?.role !== role) {
    return <Navigate to="/error/access-denied" replace />
  }

  return children
}

// ----------------------------------------------------------------
// PublicRoute: redirects authenticated users to their dashboard
// ----------------------------------------------------------------
function PublicRoute({ children }) {
  const { user, isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    const dest = user?.role === 'PARTICIPANT' ? '/participant/dashboard' : '/dashboard'
    return <Navigate to={dest} replace />
  }

  return children
}

// ----------------------------------------------------------------
// Router
// ----------------------------------------------------------------
export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/invite/:token" element={<ParticipantInvite />} />

      {/* Researcher */}
      <Route path="/onboarding" element={
        <PrivateRoute role="RESEARCHER"><Onboarding /></PrivateRoute>
      } />
      <Route path="/dashboard" element={
        <PrivateRoute role="RESEARCHER"><Dashboard /></PrivateRoute>
      } />
      <Route path="/experiments/:id" element={
        <PrivateRoute role="RESEARCHER"><ExperimentDetail /></PrivateRoute>
      } />
      <Route path="/experiments/:id/wizard" element={
        <PrivateRoute role="RESEARCHER"><ExperimentWizard /></PrivateRoute>
      } />
      <Route path="/experiments/:id/participants/:participantId" element={
        <PrivateRoute role="RESEARCHER"><ParticipantDetail /></PrivateRoute>
      } />
      <Route path="/experiments/:id/analytics" element={
        <PrivateRoute role="RESEARCHER"><ResponsesAnalytics /></PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute role="RESEARCHER"><ProfileResearcher /></PrivateRoute>
      } />

      {/* Participant */}
      <Route path="/participant/dashboard" element={
        <PrivateRoute role="PARTICIPANT"><DashboardParticipant /></PrivateRoute>
      } />
      <Route path="/participant/study/:id/questionnaire" element={
        <PrivateRoute role="PARTICIPANT"><Questionnaire /></PrivateRoute>
      } />
      <Route path="/participant/profile" element={
        <PrivateRoute role="PARTICIPANT"><ProfileParticipant /></PrivateRoute>
      } />

      {/* Errors */}
      <Route path="/404"                   element={<NotFound />} />
      <Route path="/error/token-expired"   element={<TokenExpired />} />
      <Route path="/error/access-denied"   element={<AccessDenied />} />
      <Route path="/error/server"          element={<ServerError />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
