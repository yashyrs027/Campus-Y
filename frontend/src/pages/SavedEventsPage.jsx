import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EventCard from '../components/EventCard'
import Notice from '../components/Notice'
import DashboardLayout from '../layouts/DashboardLayout'
import { studentNav } from '../data/navigation'
import { api, getSavedEventIds, getStoredUser, normalizeEvent, roleLabels, setSavedEventIds, sortEventsForDisplay } from '../lib/api'

function SavedEventsPage() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])
  const [events, setEvents] = useState([])
  const [savedIds, setSavedIds] = useState(() => getSavedEventIds(user?.user_id))
  const [status, setStatus] = useState({ loading: true, message: '', tone: 'info' })
  const [registeringId, setRegisteringId] = useState(null)
  const [enrolledIds, setEnrolledIds] = useState(new Set())

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    if (Number(user.role_id) !== 6) {
      navigate('/events')
      return
    }

    Promise.all([api.events(), api.myRegistrations()])
      .then(([eventsData, registrationData]) => {
        setEvents(eventsData.map(normalizeEvent))
        setEnrolledIds(new Set(registrationData.map((item) => Number(item.event_id))))
        setStatus({ loading: false, message: '', tone: 'info' })
      })
      .catch((error) => {
        setStatus({ loading: false, message: error.message, tone: 'danger' })
      })
  }, [navigate, user])

  const savedEvents = useMemo(() => {
    const saved = events.filter((event) => savedIds.includes(Number(event.event_id)))
    return sortEventsForDisplay(saved)
  }, [events, savedIds])

  const register = async (event) => {
    setRegisteringId(event.event_id)
    setStatus({ loading: false, message: '', tone: 'info' })
    try {
      await api.registerForEvent(event.event_id)
      setEnrolledIds((current) => new Set([...current, Number(event.event_id)]))
      setStatus({ loading: false, message: 'Registration successful.', tone: 'success' })

      const updatedEvents = await api.events()
      setEvents(updatedEvents.map(normalizeEvent))
    } catch (error) {
      setStatus({ loading: false, message: error.message, tone: 'danger' })
    } finally {
      setRegisteringId(null)
    }
  }

  const toggleSave = (event) => {
    if (!user?.user_id) return

    const eventId = Number(event.event_id)
    setSavedIds((current) => {
      const updated = current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId]
      setSavedEventIds(user.user_id, updated)
      return updated
    })
  }

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Campus-Y User'

  return (
    <DashboardLayout
      sidebarTitle="Campus-Y"
      sidebarSubtitle="Student Portal"
      navItems={studentNav}
      user={displayName}
      role={roleLabels[user?.role_id] || 'Student'}
      topbarTitle="Saved Events"
    >
      <section className="welcome-panel">
        <h2>My Saved Events</h2>
        <p>Your bookmarked events are stored only on your student account in this browser.</p>
      </section>

      {status.message && <Notice tone={status.tone}>{status.message}</Notice>}
      {status.loading && <Notice>Loading saved events...</Notice>}

      {!status.loading && savedEvents.length === 0 && (
        <Notice tone="info">
          You haven't saved any events yet. Browse events and click the bookmark icon on any event to save it here!
        </Notice>
      )}

      <section className="event-grid">
        {savedEvents.map((event) => (
          <EventCard
            event={event}
            key={event.event_id}
            onRegister={event.computedStatus !== 'Completed' ? register : undefined}
            registering={registeringId === event.event_id}
            isEnrolled={enrolledIds.has(Number(event.event_id))}
            isSaved={true}
            onToggleSave={toggleSave}
          />
        ))}
      </section>
    </DashboardLayout>
  )
}

export default SavedEventsPage
