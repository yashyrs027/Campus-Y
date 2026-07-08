import Icon from './Icon'

function MetricCard({ icon, label, value, note, muted = false }) {
  return (
    <article className="metric-card">
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
