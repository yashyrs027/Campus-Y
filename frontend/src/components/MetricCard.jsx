import Icon from './Icon'

function MetricCard({ icon, label, value, note, muted = false, onClick }) {
  return (
    <article
      className="metric-card"
      onClick={onClick}
      onKeyDown={onClick ? (event) => { if (event.key === 'Enter' || event.key === ' ') onClick(event) } : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <div className={muted ? 'metric-icon muted' : 'metric-icon'}>
        <Icon name={icon} />
      </div>
      {note && <span className="metric-note">{note}</span>}
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  )
}

export default MetricCard
