import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Notice from '../components/Notice'
import StatusBadge from '../components/StatusBadge'
import DashboardLayout from '../layouts/DashboardLayout'
import { studentNav } from '../data/navigation'
import { api, formatDateTime, getStoredUser, normalizeRegistration, roleLabels } from '../lib/api'

const FILTERS = ['All', 'Ongoing', 'Upcoming', 'Completed']

function getEventStatusTone(status) {
  if (status === 'Ongoing') return 'success'
  if (status === 'Upcoming') return 'warning'
  return 'neutral'
}

function MyRegistrationsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useMemo(() => getStoredUser(), [])
  const [rawRegistrations, setRawRegistrations] = useState([])
  const [status, setStatus] = useState({ loading: true, message: '', tone: 'info' })

  const activeFilter = useMemo(() => {
    const filter = searchParams.get('filter')
    if (!filter) return 'All'
    const matched = FILTERS.find((f) => f.toLowerCase() === filter.toLowerCase())
    return matched || 'All'
  }, [searchParams])

  const registrations = useMemo(
    () => rawRegistrations.map(normalizeRegistration),
    [rawRegistrations]
  )

  const filteredRegistrations = useMemo(() => {
    if (activeFilter === 'All') return registrations
    return registrations.filter((item) => item.eventStatus === activeFilter)
  }, [registrations, activeFilter])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    api.myRegistrations()
      .then((data) => {
        setRawRegistrations(data)
        setStatus({ loading: false, message: '', tone: 'info' })
      })
      .catch((error) => {
        setStatus({ loading: false, message: error.message, tone: 'danger' })
      })
  }, [navigate, user])

  const setFilter = (filter) => {
    if (filter === 'All') {
      setSearchParams({})
      return
    }

    setSearchParams({ filter: filter.toLowerCase() })
  }

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Campus-Y User'

  return (
    <DashboardLayout
      sidebarTitle="Campus-Y"
      sidebarSubtitle="Student Portal"
      navItems={studentNav}
      user={displayName}
      role={roleLabels[user?.role_id] || 'Student'}
      topbarTitle="My Registrations"
    >
      <section className="welcome-panel">
        <h2>My Registered Events</h2>
        <p>View all campus workshops, webinars, and sessions you've registered for and track whether they are upcoming, ongoing, or completed.</p>
      </section>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setFilter(filter)}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius)',
              border: 'none',
              background: activeFilter === filter ? 'var(--primary)' : 'transparent',
              color: activeFilter === filter ? '#fff' : 'var(--text-muted)',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {filter === 'Completed' ? 'Closed / Completed' : filter}
          </button>
        ))}
      </div>

      {status.message && <Notice tone={status.tone}>{status.message}</Notice>}
      {status.loading && <Notice>Loading your registrations...</Notice>}

      {!status.loading && registrations.length === 0 && (
        <Notice tone="info">
          You haven't registered for any events yet. Check out the Events page to get started!
        </Notice>
      )}

      {!status.loading && registrations.length > 0 && filteredRegistrations.length === 0 && (
        <Notice tone="info">No registrations match the selected filter.</Notice>
      )}

      {!status.loading && filteredRegistrations.length > 0 && (
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
                  <th>Registration</th>
                  <th>Event Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((item) => (
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
                    <td>
                      <StatusBadge tone={getEventStatusTone(item.eventStatus)}>
                        {item.eventStatus}
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
