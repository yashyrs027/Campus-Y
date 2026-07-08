function StatusBadge({ children, tone = 'success' }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>
}

export default StatusBadge
