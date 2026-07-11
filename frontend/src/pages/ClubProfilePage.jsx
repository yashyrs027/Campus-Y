import { useEffect, useMemo, useState } from 'react'
import MetricCard from '../components/MetricCard'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Icon from '../components/Icon'
import Notice from '../components/Notice'
import DashboardLayout from '../layouts/DashboardLayout'
import { studentNav, clubNav, adminNav, reviewerNav } from '../data/navigation'
import { api, getStoredUser, normalizeEvent, roleLabels } from '../lib/api'

function ClubProfilePage() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])

  const [clubs, setClubs] = useState([])
  const [events, setEvents] = useState([])
  const [selectedClub, setSelectedClub] = useState(null)
  const [status, setStatus] = useState({ loading: true, message: '', tone: 'info' })

  // Dynamic Navigation menu config
  const navConfig = useMemo(() => {
    if (!user) return { navItems: [], title: 'Campus-Y',  }
    const roleId = Number(user.role_id)
    if (roleId === 1) {
      return { navItems: adminNav, title: 'Campus-Y' }
    } else if (roleId === 2 || roleId === 3) {
      return { navItems: reviewerNav, title: 'Campus-Y ' }
    } else if (roleId === 4 || roleId === 5) {
      return {
        navItems: clubNav,
        title: 'Campus-Y',
        
      }
    } else {
      return { navItems: studentNav, title: 'Campus-Y' }
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    Promise.all([api.catalog(), api.events()])
      .then(([catalogData, eventsData]) => {
        setClubs(catalogData.clubs || [])
        setEvents(eventsData.map(normalizeEvent))
        setStatus({ loading: false, message: '', tone: 'info' })
      })
      .catch((error) => {
        setStatus({ loading: false, message: error.message, tone: 'danger' })
      })
  }, [navigate, user])

  // Compute stats for a specific club
  const clubStats = useMemo(() => {
    if (!selectedClub) return { eventsCount: 0, clubEvents: [], totalEnrolled: 0 }
    
    const clubEvents = events.filter((e) => Number(e.club_id) === Number(selectedClub.club_id))
    const totalEnrolled = clubEvents.reduce((sum, e) => sum + Number(e.registered || 0), 0)

    return {
      eventsCount: clubEvents.length,
      clubEvents,
      totalEnrolled
    }
  }, [selectedClub, events])

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Campus-Y User'

  return (
    <DashboardLayout
      sidebarTitle={navConfig.title}
      sidebarSubtitle={navConfig.subtitle}
      navItems={navConfig.navItems}
      user={displayName}
      role={roleLabels[user?.role_id] || 'Student'}
      topbarTitle="Club Profiles"
    >
      {status.message && <Notice tone={status.tone}>{status.message}</Notice>}
      {status.loading && <Notice>Loading club directory...</Notice>}

      <section className="welcome-panel">
        <h2>Discover Clubs</h2>
        <p>Browse active clubs, view their organized activities, and track attendance levels.</p>
      </section>

      {!selectedClub ? (
        // Grid of all clubs
        <div className="event-grid">
          {clubs.map((club) => {
            const organizedEvents = events.filter((e) => Number(e.club_id) === Number(club.club_id))
            return (
              <div 
                key={club.club_id} 
                className="event-card" 
                style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid var(--border)' }}
                onClick={() => setSelectedClub(club)}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none' }}
              >
                <div style={{ height: '8px', background: 'var(--primary)' }} />
                <div className="event-card-body" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className="chip">{club.department_name || 'General'}</span>
                    <small style={{ color: 'var(--muted-2)' }}>ID #{club.club_id}</small>
                  </div>
                  <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{club.club_name}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '14px', lineLineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '63px' }}>
                    {club.description || 'No description provided.'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-soft)' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary-strong)' }}>
                      {organizedEvents.length} Events Organized
                    </span>
                    <Button variant="ghost" icon="arrowRight" style={{ minHeight: 'auto', padding: '0 8px' }}>View Detail</Button>
                  </div>
                </div>
              </div>
            )
          })}
          
          {!clubs.length && !status.loading && (
            <Notice tone="info">No active clubs found in the catalog.</Notice>
          )}
        </div>
      ) : (
        // Detailed club statistics view
        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <Button onClick={() => setSelectedClub(null)} variant="secondary">
              <Icon name="arrowRight" style={{ transform: 'rotate(180deg)' }} /> Back to Directory
            </Button>
          </div>

          <div className="panel" style={{ background: '#fff', border: '1px solid var(--border)' }}>
            <div style={{ borderBottom: '1px solid var(--border-soft)', paddingBottom: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="chip chip-blue">{selectedClub.department_name || 'General'}</span>
                <span style={{ color: 'var(--muted-2)' }}>ID #{selectedClub.club_id}</span>
              </div>
              <h2 style={{ fontSize: '28px', marginTop: '12px', color: 'var(--primary-strong)' }}>{selectedClub.club_name}</h2>
              <p style={{ color: 'var(--muted)', fontSize: '15px', marginTop: '8px', lineHeight: '1.6' }}>{selectedClub.description}</p>
            </div>

            <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '28px' }}>
              <MetricCard icon="calendar" label="Total Events Organized" value={clubStats.eventsCount}  />
              <MetricCard icon="users" label="Total Enrolled Students" value={clubStats.totalEnrolled}  />
            </div>

            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '14px' }}>Events History & Enrollment</h3>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Event Title</th>
                      <th>Status</th>
                      <th>Venue</th>
                      <th>Students Enrolled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubStats.clubEvents.map((event) => (
                      <tr key={event.event_id}>
                        <td style={{ fontWeight: '600' }}>{event.title}</td>
                        <td>
                          <span style={{ 
                            fontWeight: 'bold', 
                            color: event.computedStatus === 'Ongoing' ? 'var(--success)' : event.computedStatus === 'Upcoming' ? 'var(--warning)' : 'var(--muted)' 
                          }}>
                            {event.computedStatus}
                          </span>
                        </td>
                        <td>{event.venue}</td>
                        <td>
                          <span className="chip" style={{ background: 'var(--primary-soft)', color: 'var(--primary-strong)', padding: '4px 12px' }}>
                            <strong>{Number(event.registered || 0)}</strong> / {event.capacity ? event.capacity : 'Open'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!clubStats.clubEvents.length && (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--muted)' }}>This club has not organized any events yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default ClubProfilePage
