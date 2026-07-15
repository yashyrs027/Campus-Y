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

  return (
    <article 
      className="event-card" 
      onClick={() => navigate(`/events/${event.event_id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className={`event-art event-art-${event.tone}`}>
        <img
        src={getEventImage(event.title)}
        className="event-image"
    />
        <span className="chip chip-blue">{event.category}</span>
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
            style={isSaved ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' } : {}}
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
