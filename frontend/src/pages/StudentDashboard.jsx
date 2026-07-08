import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import EventCard from '../components/EventCard'
import MetricCard from '../components/MetricCard'
import Notice from '../components/Notice'
import StatusBadge from '../components/StatusBadge'
import DashboardLayout from '../layouts/DashboardLayout'
import { studentNav } from '../data/navigation'
import { api, formatDateTime, getStoredUser, normalizeEvent, roleLabels } from '../lib/api'

function StudentDashboard() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])
  const [dashboard, setDashboard] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [status, setStatus] = useState({ loading: true, message: '', tone: 'info' })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    Promise.all([api.studentDashboard(), api.myRegistrations()])
      .then(([dashboardData, registrationData]) => {
        setDashboard(dashboardData)
        setRegistrations(registrationData)
        setStatus({ loading: false, message: '', tone: 'info' })
      })
      .catch((error) => {
        setStatus({ loading: false, message: error.message, tone: 'danger' })
      })
  }, [navigate, user])

  const profile = dashboard?.profile || user || {}
  const displayName = `${profile.first_name || user?.first_name || 'Student'} ${profile.last_name || user?.last_name || ''}`.trim()
  const upcomingEvents = (dashboard?.upcoming_events || []).map(normalizeEvent)

  return (
    <DashboardLayout
      sidebarTitle="Campus-Y"
      sidebarSubtitle="Student Portal"
      navItems={studentNav}
      user={displayName}
      role={profile.department_name || roleLabels[user?.role_id] || 'Student'}
    >
      {status.message && <Notice tone={status.tone}>{status.message}</Notice>}
      {status.loading && <Notice>Loading your dashboard from backend...</Notice>}
      <section className="welcome-panel">
        <h2>Welcome back, {profile.first_name || 'Student'}!</h2>
        <p>You have <strong>{upcomingEvents.length} upcoming events</strong> available and <strong>{dashboard?.registered_events || 0} registrations</strong> in your profile.</p>
      </section>

      <section className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <MetricCard icon="calendar" label="Upcoming Events" value={upcomingEvents.length} note="Published" />
        <MetricCard icon="check" label="Registered Events" value={dashboard?.registered_events || 0} note="Your total" />
        <MetricCard icon="activity" label="Completed Events" value={registrations.filter((item) => item.status === 'Completed').length} note="From API" />
      </section>

      <div className="student-grid">
        <section className="panel activity-panel">
          <div className="panel-heading">
            <h3>Recent Activity</h3>
            <a href="/events">View All</a>
          </div>
          <table>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((item) => (
                <tr key={item.registration_id}>
                  <td>{item.title}</td>
                  <td>{formatDateTime(item.start_datetime)}</td>
                  <td><span className="chip">{item.venue || 'Campus'}</span></td>
                  <td><StatusBadge tone={item.status === 'Waitlisted' ? 'warning' : 'success'}>{item.status}</StatusBadge></td>
                </tr>
              ))}
              {!registrations.length && (
                <tr>
                  <td colSpan="4">No registrations yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <aside className="quick-panel">
          <section className="panel">
            <h3>Upcoming Deadlines</h3>
            {upcomingEvents.slice(0, 2).map((event) => (
              <p key={event.event_id}><strong>{event.title}</strong><span>{event.date} - {event.venue}</span></p>
            ))}
            {!upcomingEvents.length && <p><strong>No deadlines</strong><span>Published events will appear here.</span></p>}
          </section>
          <Button to="/events" icon="search">Browse Events</Button>
        </aside>
      </div>

      <section className="recommended-section">
        <h3>Recommended for You</h3>
        <div className="event-grid two">
          {upcomingEvents.slice(0, 2).map((event) => (
            <EventCard key={event.event_id} event={event} />
          ))}
        </div>
      </section>
    </DashboardLayout>
  )
}

export default StudentDashboard
