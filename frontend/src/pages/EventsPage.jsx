import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import EventCard from '../components/EventCard'
import Notice from '../components/Notice'
import SearchBar from '../components/SearchBar'
import DashboardLayout from '../layouts/DashboardLayout'
import { studentNav, clubNav, adminNav, reviewerNav } from '../data/navigation'
import { api, getStoredUser, normalizeEvent, roleLabels } from '../lib/api'

function EventsPage() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])
  const [events, setEvents] = useState([])
  const [catalog, setCatalog] = useState({ clubs: [], event_categories: [] })
  
  // Filter states
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedClub, setSelectedClub] = useState('')
  
  // Saved events state (persisted in localStorage)
  const [savedIds, setSavedIds] = useState(() => {
    const raw = localStorage.getItem('campus_y_saved_events')
    return raw ? JSON.parse(raw) : []
  })

  const [status, setStatus] = useState({ loading: true, message: '', tone: 'info' })
  const [registeringId, setRegisteringId] = useState(null)

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

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    Promise.all([api.events(), api.catalog()])
      .then(([eventsData, catalogData]) => {
        setEvents(eventsData.map(normalizeEvent))
        setCatalog(catalogData)
        setStatus({ loading: false, message: '', tone: 'info' })
      })
      .catch((error) => {
        setStatus({ loading: false, message: error.message, tone: 'danger' })
      })
  }, [navigate, user])

  // Filter computation
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesQuery = event.title?.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = !selectedCategory || Number(event.category_id) === Number(selectedCategory)
      const matchesStatus = !selectedStatus || event.computedStatus === selectedStatus
      const matchesClub = !selectedClub || Number(event.club_id) === Number(selectedClub)
      
      return matchesQuery && matchesCategory && matchesStatus && matchesClub
    })
  }, [events, query, selectedCategory, selectedStatus, selectedClub])

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
      topbarTitle="Discover Events"
    >
      <section className="welcome-panel">
        <h2>Discover Upcoming Activities</h2>
        <p>Explore current, upcoming, and completed college events, check seat availability, and manage your registrations.</p>
      </section>

      <section className="filter-panel" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '14px', alignItems: 'center' }}>
        <SearchBar onChange={(event) => setQuery(event.target.value)} placeholder="Search by event title..." value={query} />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ border: '1px solid #c9cfdf', borderRadius: 'var(--radius)', minHeight: '48px', padding: '0 16px', background: '#fbfbff', color: '#303747' }}
        >
          <option value="">All Categories</option>
          {catalog.event_categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{ border: '1px solid #c9cfdf', borderRadius: 'var(--radius)', minHeight: '48px', padding: '0 16px', background: '#fbfbff', color: '#303747' }}
        >
          <option value="">All Statuses</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={selectedClub}
          onChange={(e) => setSelectedClub(e.target.value)}
          style={{ border: '1px solid #c9cfdf', borderRadius: 'var(--radius)', minHeight: '48px', padding: '0 16px', background: '#fbfbff', color: '#303747' }}
        >
          <option value="">All Clubs</option>
          {catalog.clubs.map((c) => (
            <option key={c.club_id} value={c.club_id}>{c.club_name}</option>
          ))}
        </select>
      </section>

      {status.message && <Notice tone={status.tone}>{status.message}</Notice>}
      {status.loading && <Notice>Loading events and categories...</Notice>}
      
      {!status.loading && filteredEvents.length === 0 && (
        <Notice tone="info">No events match your criteria. Try adjusting the search query or filters.</Notice>
      )}

      <section className="event-grid">
        {filteredEvents.map((event) => (
          <EventCard
            event={event}
            key={event.event_id}
            onRegister={Number(user?.role_id) === 6 && event.computedStatus !== 'Completed' ? register : undefined}
            registering={registeringId === event.event_id}
            isSaved={savedIds.includes(Number(event.event_id))}
            onToggleSave={toggleSave}
          />
        ))}
      </section>
    </DashboardLayout>
  )
}

export default EventsPage
