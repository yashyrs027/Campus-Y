import { Link } from 'react-router-dom'
import Icon from './Icon'

function Brand({ label = 'Campus-Y', subtitle, compact = false }) {
  return (
    <Link className="brand" to="/">
      <span className="brand-mark">
        <Icon name="building" />
      </span>
      {!compact && (
        <span>
          <strong>{label}</strong>
          {subtitle && <small>{subtitle}</small>}
        </span>
      )}
    </Link>
  )
}

export default Brand
