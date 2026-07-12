import { Navigate, Route, Routes } from 'react-router-dom'
import AdminDashboard from './pages/AdminDashboard'
import EventsPage from './pages/EventsPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import ProposalPage from './pages/ProposalPage'
import ReviewDashboard from './pages/ReviewDashboard'
import StudentDashboard from './pages/StudentDashboard'
import ProfilePage from './pages/ProfilePage'
import MyRegistrationsPage from './pages/MyRegistrationsPage'
import SavedEventsPage from './pages/SavedEventsPage'
import ClubDashboard from './pages/ClubDashboard'
import ClubProfilePage from './pages/ClubProfilePage'
import ManageClubsPage from './pages/ManageClubsPage'
import AssignRolesPage from './pages/AssignRolesPage'
import EventDetailsPage from './pages/EventDetailsPage'
import AdminProposalsPage from './pages/AdminProposalsPage'
import RegistrationReportsPage from './pages/RegistrationReportsPage'
import TrackProposalsPage from './pages/TrackProposalsPage'
import ReviewerProposalsPage from './pages/ReviewerProposalsPage'
import { getStoredUser, getToken, dashboardPathForRole } from './lib/api'

function ProtectedRoute({ children, allowedRoles }) {
  const token = getToken()
  const user = getStoredUser()

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(Number(user.role_id))) {
    return <Navigate to={dashboardPathForRole(user.role_id)} replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <EventsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id"
        element={
          <ProtectedRoute>
            <EventDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={[6]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/review"
        element={
          <ProtectedRoute allowedRoles={[2, 3]}>
            <ReviewDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/review/proposals"
        element={
          <ProtectedRoute allowedRoles={[2, 3]}>
            <ReviewerProposalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/proposal/new"
        element={
          <ProtectedRoute allowedRoles={[4, 5, 1]}>
            <ProposalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registrations"
        element={
          <ProtectedRoute allowedRoles={[6]}>
            <MyRegistrationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved"
        element={
          <ProtectedRoute allowedRoles={[6]}>
            <SavedEventsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club"
        element={
          <ProtectedRoute allowedRoles={[4, 5]}>
            <ClubDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club/proposals"
        element={
          <ProtectedRoute allowedRoles={[4, 5]}>
            <TrackProposalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club/profile"
        element={
          <ProtectedRoute>
            <ClubProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clubs"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <ManageClubsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assign-roles"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <AssignRolesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/registrations"
        element={
          <ProtectedRoute allowedRoles={[1, 2, 3, 4, 5]}>
            <RegistrationReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/proposals"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <AdminProposalsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
