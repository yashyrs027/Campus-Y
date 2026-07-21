import { NavLink, useNavigate } from 'react-router-dom'
import Brand from './Brand'
import Button from './Button'
import Icon from './Icon'
import { api, clearSession } from '../lib/api'

function Sidebar({ title, subtitle, navItems, action, isOpen, onToggle, onNavClick }) {
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
    <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <Brand label={title} subtitle={subtitle} />
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggle}
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar"
        >
          <Icon name="menu" />
        </button>
      </div>

      <div className="sidebar-scrollable-area">
        <nav className="side-nav" aria-label={`${title} navigation`}>
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onNavClick}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        {action && (
          <div className="sidebar-action">
            <Button to={action.to} icon={action.icon} onClick={onNavClick}>
              {action.label}
            </Button>
          </div>
        )}
        <div className="sidebar-logout">
          <button
            onClick={handleLogout}
            className="btn btn-secondary wide"
            style={{ color: 'var(--danger)', borderColor: 'var(--border)' }}
          >
            <Icon name="logout" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
