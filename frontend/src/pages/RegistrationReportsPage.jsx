import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Notice from '../components/Notice'
import SearchBar from '../components/SearchBar'
import StatusBadge from '../components/StatusBadge'
import DashboardLayout from '../layouts/DashboardLayout'
import { studentNav, clubNav, adminNav, reviewerNav } from '../data/navigation'
import { api, formatDateTime, getStoredUser, roleLabels } from '../lib/api'

function getNavConfig(roleId) {
  if (roleId === 1) {
    return { navItems: adminNav, title: 'Admin Central', subtitle: 'University Portal' }
  }
  if (roleId === 2 || roleId === 3) {
    return { navItems: reviewerNav, title: 'Campus-Y Review', subtitle: 'Approval Workspace' }
  }
  if (roleId === 4 || roleId === 5) {
    return { navItems: clubNav, title: 'Club Management', subtitle: 'President Portal' }
  }
  return { navItems: studentNav, title: 'Campus-Y', subtitle: 'Student Portal' }
}

function RegistrationReportsPage() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])
  const roleId = Number(user?.role_id)
  const navConfig = useMemo(() => getNavConfig(roleId), [roleId])

  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [eventQuery, setEventQuery] = useState('')
  const [studentQuery, setStudentQuery] = useState('')
  const [status, setStatus] = useState({ loading: true, message: '', tone: 'info' })
  const [detailLoading, setDetailLoading] = useState(false)

  const allowedRoles = [1, 2, 3, 4, 5]

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!allowedRoles.includes(roleId)) {
      navigate('/student')
      return
    }

    api.registrationReportEvents()
      .then((data) => {
        setEvents(data)
        setStatus({ loading: false, message: '', tone: 'info' })
      })
      .catch((error) => {
        setStatus({ loading: false, message: error.message, tone: 'danger' })
      })
  }, [navigate, user, roleId])

  const filteredEvents = useMemo(() => {
    const query = eventQuery.trim().toLowerCase()
    if (!query) return events

    return events.filter((event) =>
      event.title?.toLowerCase().includes(query) ||
      event.club_name?.toLowerCase().includes(query) ||
      event.venue?.toLowerCase().includes(query)
    )
  }, [events, eventQuery])

  const filteredRegistrations = useMemo(() => {
    const query = studentQuery.trim().toLowerCase()
    if (!query) return registrations

    return registrations.filter((item) => {
      const name = item.student_name?.toLowerCase() || ''
      const email = item.email?.toLowerCase() || ''
      const studentId = item.student_id?.toLowerCase() || ''
      return name.includes(query) || email.includes(query) || studentId.includes(query)
    })
  }, [registrations, studentQuery])

  const openEventReport = async (event) => {
    setSelectedEvent(event)
    setStudentQuery('')
    setDetailLoading(true)
    setStatus((current) => ({ ...current, message: '', tone: 'info' }))

    try {
      const data = await api.eventRegistrationReport(event.event_id)
      setRegistrations(data)
    } catch (error) {
      setRegistrations([])
      setStatus({ loading: false, message: error.message, tone: 'danger' })
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => {
    setSelectedEvent(null)
    setRegistrations([])
    setStudentQuery('')
  }

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Campus-Y User'

  return (
    <DashboardLayout
      sidebarTitle={navConfig.title}
      sidebarSubtitle={navConfig.subtitle}
      navItems={navConfig.navItems}
      user={displayName}
      role={roleLabels[roleId] || 'User'}
      topbarTitle="Registration Reports"
    >
      <section className="welcome-panel">
        <h2>Registration Reports</h2>
        <p>Monitor student registrations for events relevant to your role. Select an event to view enrolled students.</p>
      </section>

      {status.message && <Notice tone={status.tone}>{status.message}</Notice>}
      {status.loading && <Notice>Loading registration reports...</Notice>}

      {!status.loading && !selectedEvent && (
        <>
          <section style={{ marginBottom: '20px', maxWidth: '420px' }}>
            <SearchBar
              placeholder="Search events by title, club, or venue..."
              value={eventQuery}
              onChange={(e) => setEventQuery(e.target.value)}
            />
          </section>

          {!filteredEvents.length && (
            <Notice tone="info">No events found for your access level.</Notice>
          )}

          <section className="panel">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Club</th>
                    <th>Date</th>
                    <th>Venue</th>
                    <th>Registered</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event.event_id}>
                      <td style={{ fontWeight: 600 }}>{event.title}</td>
                      <td>{event.club_name || '—'}</td>
                      <td>{formatDateTime(event.start_datetime)}</td>
                      <td>{event.venue}</td>
                      <td>
                        <strong>{event.registered || 0}</strong>
                        {event.capacity ? ` / ${event.capacity}` : ''}
                      </td>
                      <td>
                        <Button onClick={() => openEventReport(event)}>View Students</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {selectedEvent && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>{selectedEvent.title}</h3>
              <p style={{ color: 'var(--muted)', margin: '6px 0 0' }}>
                {selectedEvent.club_name || 'Campus Event'} · {formatDateTime(selectedEvent.start_datetime)} · {selectedEvent.venue}
              </p>
            </div>
            <Button variant="secondary" onClick={closeDetail}>Back to Events</Button>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <span className="chip chip-blue">{selectedEvent.registered || 0} registered students</span>
            {selectedEvent.capacity ? (
              <span className="chip">{selectedEvent.capacity} capacity</span>
            ) : null}
          </div>

          <div style={{ marginBottom: '20px', maxWidth: '420px' }}>
            <SearchBar
              placeholder="Search students by name or email..."
              value={studentQuery}
              onChange={(e) => setStudentQuery(e.target.value)}
            />
          </div>

          {detailLoading && <Notice>Loading student registrations...</Notice>}

          {!detailLoading && filteredRegistrations.length === 0 && (
            <Notice tone="info">
              {registrations.length === 0
                ? 'No students have registered for this event yet.'
                : 'No students match your search.'}
            </Notice>
          )}

          {!detailLoading && filteredRegistrations.length > 0 && (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Student ID</th>
                    <th>Department</th>
                    <th>Phone</th>
                    <th>Registered On</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((item) => (
                    <tr key={item.registration_id}>
                      <td style={{ fontWeight: 600 }}>{item.student_name}</td>
                      <td>{item.email}</td>
                      <td>{item.student_id || '—'}</td>
                      <td>{item.department_name || '—'}</td>
                      <td>{item.phone || '—'}</td>
                      <td>{formatDateTime(item.registration_date)}</td>
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
          )}
        </section>
      )}
    </DashboardLayout>
  )
}

export default RegistrationReportsPage
