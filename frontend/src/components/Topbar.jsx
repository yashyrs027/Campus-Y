import { Link } from 'react-router-dom'
import SearchBar from './SearchBar'

function Topbar({ title, user = 'Alex Rivera', role = 'Student' }) {
  return (
    <header className="topbar">
      {title && <h1>{title}</h1>}
      <SearchBar />
      <div className="topbar-actions">
        <Link to="/profile" className="user-pill" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span>
            <strong>{user}</strong>
            <small>{role}</small>
          </span>
          <b>{user.split(' ').map((part) => part ? part[0] : '').join('')}</b>
        </Link>
      </div>
    </header>
  )
}

export default Topbar
