import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Notice from '../components/Notice'
import StatusBadge from '../components/StatusBadge'
import DashboardLayout from '../layouts/DashboardLayout'
import { studentNav } from '../data/navigation'
import { api, formatDateTime, getStoredUser, roleLabels } from '../lib/api'

function MyRegistrationsPage() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])
  const [registrations, setRegistrations] = useState([])
  const [status, setStatus] = useState({ loading: true, message: '', tone: 'info' })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    api.myRegistrations()
      .then((data) => {
        setRegistrations(data)
        setStatus({ loading: false, message: '', tone: 'info' })
      })
      .catch((error) => {
        setStatus({ loading: false, message: error.message, tone: 'danger' })
      })
  }, [navigate, user])

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Campus-Y User'

  return (
    <DashboardLayout
      sidebarTitle="CampusPulse"
      sidebarSubtitle="University Hub"
      navItems={studentNav}
      user={displayName}
      role={roleLabels[user?.role_id] || 'Student'}
      topbarTitle="My Registrations"
    >
      <section className="welcome-panel">
        <h2>Your Registered Events</h2>
        <p>View all campus workshops, webinars, and sessions you've registered for and track their current attendance status.</p>
      </section>

      {status.message && <Notice tone={status.tone}>{status.message}</Notice>}
      {status.loading && <Notice>Loading your registrations...</Notice>}

      {!status.loading && registrations.length === 0 && (
        <Notice tone="info">
          You haven't registered for any events yet. Check out the Browse Events page to get started!
        </Notice>
      )}

      {!status.loading && registrations.length > 0 && (
        <div className="panel activity-panel">
          <div className="panel-heading">
            <h3>Registrations Directory</h3>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Event Date</th>
                  <th>Venue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((item) => (
                  <tr key={item.registration_id}>
                    <td style={{ fontWeight: '600' }}>{item.title}</td>
                    <td>{formatDateTime(item.start_datetime)}</td>
                    <td>
                      <span className="chip">{item.venue || 'Campus'}</span>
                    </td>
                    <td>
                      <StatusBadge tone={item.status === 'Waitlisted' ? 'warning' : 'success'}>
                        {item.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default MyRegistrationsPage
