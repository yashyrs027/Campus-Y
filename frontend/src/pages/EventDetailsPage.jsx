import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/Button'
import Icon from '../components/Icon'
import Notice from '../components/Notice'
import StatusBadge from '../components/StatusBadge'
import DashboardLayout from '../layouts/DashboardLayout'
import { studentNav, clubNav, adminNav, reviewerNav } from '../data/navigation'
import { getEventImage } from '../data/eventImages'
import { api, getStoredUser, normalizeEvent, roleLabels } from '../lib/api'

function EventDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])
  
  const [event, setEvent] = useState(null)
  const [status, setStatus] = useState({ loading: true, message: '', tone: 'info' })
  const [registering, setRegistering] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const isStudent = Number(user?.role_id) === 6

  // Dynamic Navigation menu config
  const navConfig = useMemo(() => {
    if (!user) return { navItems: [], title: 'Campus-Y' }
    const roleId = Number(user.role_id)
    if (roleId === 1) {
      return { navItems: adminNav, title: 'Campus-Y' }
    } else if (roleId === 2 || roleId === 3) {
      return { navItems: reviewerNav, title: 'Campus-Y ' }
    } else if (roleId === 4 || roleId === 5) {
      return { navItems: clubNav, title: 'Campus-Y' }
    } else {
      return { navItems: studentNav, title: 'Campus-Y' }
    }
  }, [user])

  const loadEvent = () => {
    setStatus({ loading: true, message: '', tone: 'info' })
    const requests = [api.event(id)]
    if (isStudent) {
      requests.push(api.myRegistrations())
    }

    Promise.all(requests)
      .then((results) => {
        const [data, registrationData] = results
        setEvent(normalizeEvent(data))
        if (registrationData) {
          setIsEnrolled(registrationData.some((item) => Number(item.event_id) === Number(id)))
        }
        setStatus({ loading: false, message: '', tone: 'info' })
      })
      .catch((error) => {
        setStatus({ loading: false, message: error.message, tone: 'danger' })
      })
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadEvent()
  }, [navigate, user, id])

  const register = async () => {
    if (!event) return
    setRegistering(true)
    setStatus({ loading: false, message: '', tone: 'info' })
    try {
      await api.registerForEvent(event.event_id)
      setIsEnrolled(true)
      setStatus({ loading: false, message: 'Registration successful!', tone: 'success' })
      loadEvent()
    } catch (error) {
      setStatus({ loading: false, message: error.message, tone: 'danger' })
    } finally {
      setRegistering(false)
    }
  }

  const getStatusTone = (computedStatus) => {
    if (computedStatus === 'Ongoing') return 'success'
    if (computedStatus === 'Upcoming') return 'warning'
    return 'neutral'
  }

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Campus-Y User'

  return (
    <DashboardLayout
      sidebarTitle={navConfig.title}
      sidebarSubtitle={navConfig.subtitle}
      navItems={navConfig.navItems}
      user={displayName}
      role={roleLabels[user?.role_id] || 'Student'}
      topbarTitle="Event Details"
    >
      <div style={{ marginBottom: '24px' }}>
        <Button onClick={() => navigate(-1)} variant="secondary">
          <Icon name="arrowRight" style={{ transform: 'rotate(180deg)', marginRight: '6px' }} /> Back
        </Button>
      </div>

      {status.message && <Notice tone={status.tone}>{status.message}</Notice>}
      {status.loading && <Notice>Loading event details...</Notice>}

      {event && (
        <div className="panel" style={{ width: '100%', padding: '32px', display: 'grid', gap: '32px' }}>
          
          {/* Banner / Poster Header Visualization */}
          {(event.banner || getEventImage(event.title)) && (
            <div style={{ width: '100%', maxHeight: '320px', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border-soft)' }}>
              <img 
                src={event.banner || getEventImage(event.title)} 
                alt={event.title} 
                style={{ width: '100%', height: '320px', objectFit: 'cover' }} 
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '24px' }}>
            <div>
              <span className="chip chip-blue" style={{ marginBottom: '12px', display: 'inline-block' }}>{event.category}</span>
              <h2 style={{ fontSize: '32px', margin: '0 0 10px 0', color: 'var(--primary-strong)' }}>{event.title}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '15px' }}>
                <span className="club-swatch" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                <span>Organized by <strong>{event.club}</strong></span>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <StatusBadge tone={getStatusTone(event.computedStatus)}>
                {event.computedStatus}
              </StatusBadge>
              <div style={{ marginTop: '12px', fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>
                {event.capacity ? (
                  <span className={event.seats <= 12 ? 'seat-warning' : 'seat-count'} style={{ fontSize: '16px' }}>
                    {event.seats} / {event.capacity} seats left
                  </span>
                ) : (
                  <span style={{ fontSize: '15px', color: 'var(--muted)' }}>Open Event</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div style={{ background: 'var(--surface-soft)', padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border-soft)', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'inline-flex', background: 'var(--surface-card)', color: 'var(--primary)', padding: '12px', borderRadius: '12px', fontSize: '24px' }}>
                <Icon name="calendar" />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: '600' }}>Date & Time</span>
                <strong style={{ fontSize: '16px', color: 'var(--text-strong)' }}>{event.date}</strong>
              </div>
            </div>

            <div style={{ background: 'var(--surface-soft)', padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border-soft)', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'inline-flex', background: 'var(--surface-card)', color: 'var(--primary)', padding: '12px', borderRadius: '12px', fontSize: '24px' }}>
                <Icon name="mapPin" />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: '600' }}>Venue</span>
                <strong style={{ fontSize: '16px', color: 'var(--text)' }}>{event.venue}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', margin: 0, fontWeight: '700', color: 'var(--text)' }}>About this Event</h3>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4a5568', whiteSpace: 'pre-wrap', margin: 0 }}>
              {event.description}
            </p>
          </div>

          {isStudent && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', borderTop: '1px solid var(--border-soft)', paddingTop: '24px', marginTop: '12px' }}>
              {isEnrolled ? (
                <Button disabled variant="secondary" style={{ padding: '14px 28px', fontSize: '16px' }}>
                  Enrolled
                </Button>
              ) : event.registrationClosed || event.computedStatus === 'Completed' ? (
                <Button disabled variant="secondary" style={{ padding: '14px 28px', fontSize: '16px' }}>
                  Closed
                </Button>
              ) : (
                <Button disabled={registering} onClick={register} style={{ padding: '14px 28px', fontSize: '16px' }}>
                  {registering ? 'Processing...' : 'Register for Event'}
                </Button>
              )}
            </div>
          )}

        </div>
      )}
    </DashboardLayout>
  )
}

export default EventDetailsPage
