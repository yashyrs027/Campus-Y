import { useNavigate } from 'react-router-dom'
import { getEventImage } from "../data/eventImages";
import Button from './Button'
import Icon from './Icon'

function EventCard({ event, onRegister, registering, isSaved, onToggleSave, isEnrolled }) {
  const navigate = useNavigate()
  
  const getStatusColor = (status) => {
    if (status === 'Ongoing') return 'var(--success)'
    if (status === 'Upcoming') return 'var(--warning)'
    return 'var(--muted)'
  }

  const bannerSrc = event.banner || getEventImage(event.title)

  return (
    <article 
      className="event-card" 
      onClick={() => navigate(`/events/${event.event_id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div 
        className={`event-art event-art-${event.tone}`} 
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {bannerSrc ? (
          <img
            src={bannerSrc}
            alt={event.title}
            className="event-image"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0,
            }}
          />
        ) : (
          /* System Default Dynamic Fallback Graphic / Gradient Placeholder */
          <div
            className="event-art-fallback"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.92), rgba(59, 130, 246, 0.75))',
              zIndex: 0,
            }}
          >
            <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.45)' }}>
              <Icon name="calendar" style={{ width: '42px', height: '42px', margin: '0 auto 4px auto', display: 'block' }} />
              <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Campus-Y Event</span>
            </div>
          </div>
        )}

        <span className="chip chip-blue" style={{ position: 'relative', zIndex: 2 }}>{event.category}</span>
        
        {onToggleSave && (
          <button
            className="icon-button"
            type="button"
            aria-label="Save event"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleSave(event)
            }}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              zIndex: 2,
              background: 'var(--surface)',
              ...(isSaved ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' } : {})
            }}
          >
            <Icon name="bookmark" />
          </button>
        )}
      </div>

      <div className="event-card-body">
        <div className="club-line">
          <span className="club-swatch" />
          {event.club}
        </div>
        <h3>{event.title}</h3>
        <p>
          <Icon name="mapPin" />
          {event.venue}
        </p>
        <p>
          <Icon name="calendar" />
          Register Deadline: <strong>{event.registrationDeadline}</strong>
        </p>
        <p>
          <Icon name="activity" />
          <span>Status: </span>
          <strong style={{ color: getStatusColor(event.computedStatus) }}>
            {event.computedStatus}
          </strong>
        </p>
        <div className="event-card-actions">
          <span className={event.seats <= 12 ? 'seat-warning' : 'seat-count'}>
            {event.capacity ? `${event.seats} seats left` : event.status || 'Open'}
          </span>
          {isEnrolled ? (
            <Button disabled variant="secondary">
              Enrolled
            </Button>
          ) : event.registrationClosed ? (
            <Button disabled variant="secondary">
              Closed
            </Button>
          ) : onRegister ? (
            <Button disabled={registering} onClick={(e) => { e.stopPropagation(); onRegister(event); }}>
              {registering ? 'Saving...' : 'Register'}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default EventCard
