import { NavLink, useNavigate } from 'react-router-dom'
import Brand from './Brand'
import Button from './Button'
import Icon from './Icon'
import { api, clearSession } from '../lib/api'

function Sidebar({ title, subtitle, navItems, action }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await api.logout()
    } catch (e) {
      console.error('Logout failed:', e.message)
    }
    clearSession()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <Brand label={title} subtitle={subtitle} />
      <nav className="side-nav" aria-label={`${title} navigation`}>
        {navItems.map((item) => (
          <NavLink key={item.label} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      {action && (
        <div className="sidebar-action" style={{ marginTop: 'auto' }}>
          <Button to={action.to} icon={action.icon}>
            {action.label}
          </Button>
        </div>
      )}
      <div className="sidebar-logout" style={{ marginTop: action ? '0px' : 'auto', borderTop: '1px solid var(--border-soft)', paddingTop: '20px' }}>
        <button onClick={handleLogout} className="btn btn-secondary wide" style={{ color: 'var(--danger)', borderColor: 'var(--border)' }}>
          <Icon name="logout" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
