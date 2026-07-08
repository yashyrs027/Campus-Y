import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EventCard from '../components/EventCard'
import Notice from '../components/Notice'
import DashboardLayout from '../layouts/DashboardLayout'
import { studentNav, clubNav, adminNav, reviewerNav } from '../data/navigation'
import { api, getStoredUser, normalizeEvent, roleLabels } from '../lib/api'

function SavedEventsPage() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])
  const [events, setEvents] = useState([])

  // Dynamic Navigation menu config
  const navConfig = useMemo(() => {
    if (!user) return { navItems: [], title: 'CampusPulse', subtitle: 'University Hub' }
    const roleId = Number(user.role_id)
    if (roleId === 1) {
      return { navItems: adminNav, title: 'Admin Central', subtitle: 'University Portal' }
    } else if (roleId === 2 || roleId === 3) {
      return { navItems: reviewerNav, title: 'Campus-Y Review', subtitle: 'Approval Workspace' }
    } else if (roleId === 4 || roleId === 5) {
      return {
        navItems: clubNav,
        title: 'Club Management',
        subtitle: 'President Portal',
        action: { label: 'New Proposal', icon: 'plus', to: '/proposal/new' },
      }
    } else {
      return { navItems: studentNav, title: 'CampusPulse', subtitle: 'University Hub' }
    }
  }, [user])
  
  // Saved events state
  const [savedIds, setSavedIds] = useState(() => {
    const raw = localStorage.getItem('campus_y_saved_events')
    return raw ? JSON.parse(raw) : []
  })

  const [status, setStatus] = useState({ loading: true, message: '', tone: 'info' })
  const [registeringId, setRegisteringId] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    api.events()
      .then((data) => {
        setEvents(data.map(normalizeEvent))
        setStatus({ loading: false, message: '', tone: 'info' })
      })
      .catch((error) => {
        setStatus({ loading: false, message: error.message, tone: 'danger' })
      })
  }, [navigate, user])

  // Filter events to only show saved ones
  const savedEvents = useMemo(() => {
    return events.filter((event) => savedIds.includes(Number(event.event_id)))
  }, [events, savedIds])

  const register = async (event) => {
    setRegisteringId(event.event_id)
    setStatus({ loading: false, message: '', tone: 'info' })
    try {
      await api.registerForEvent(event.event_id)
      setStatus({ loading: false, message: 'Registration successful.', tone: 'success' })
      
      // Reload events to update registrations / seats
      const updatedEvents = await api.events()
      setEvents(updatedEvents.map(normalizeEvent))
    } catch (error) {
      setStatus({ loading: false, message: error.message, tone: 'danger' })
    } finally {
      setRegisteringId(null)
    }
  }

  const toggleSave = (event) => {
    const eventId = Number(event.event_id)
    setSavedIds((current) => {
      const updated = current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId]
      localStorage.setItem('campus_y_saved_events', JSON.stringify(updated))
      return updated
    })
  }

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Campus-Y User'

  return (
    <DashboardLayout
      sidebarTitle={navConfig.title}
      sidebarSubtitle={navConfig.subtitle}
      navItems={navConfig.navItems}
      action={navConfig.action}
      user={displayName}
      role={roleLabels[user?.role_id] || 'Student'}
      topbarTitle="Saved Events"
    >
      <section className="welcome-panel">
        <h2>Your Saved Events</h2>
        <p>Keep track of events you are interested in. Click the bookmark icon to remove them from your saved list.</p>
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
            onRegister={Number(user?.role_id) === 6 && event.computedStatus !== 'Completed' ? register : undefined}
            registering={registeringId === event.event_id}
            isSaved={true}
            onToggleSave={toggleSave}
          />
        ))}
      </section>
    </DashboardLayout>
  )
}

export default SavedEventsPage
