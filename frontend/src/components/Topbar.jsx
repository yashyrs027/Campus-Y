import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { getStoredUser, clearSession, api } from '../lib/api'
import { initTheme, applyTheme } from '../lib/theme'

function Topbar({ title, user = 'Alex Rivera', role = 'Student', onToggleSidebar, isSidebarOpen }) {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [theme, setTheme] = useState(() => initTheme())
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    setCurrentUser(getStoredUser())
  }, [user])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    applyTheme(nextTheme)
  }

  const handleLogout = async () => {
    try {
      await api.logout()
    } catch (err) {
      console.error(err)
    } finally {
      clearSession()
      navigate('/login')
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/events?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: 0 }}>
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="topbar-hamburger-btn"
            aria-label="Toggle Sidebar Navigation"
            title="Toggle Sidebar Navigation"
          >
            <Icon name="menu" />
          </button>
        )}
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: 0 }}>
          <label className="search-bar">
            <Icon name="search" />
            <input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0 4px', display: 'flex' }}
                aria-label="Clear search"
              >
                <Icon name="x" />
              </button>
            )}
          </label>
        </form>
      </div>
      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        {/* Dynamic Theme Toggle Button (Light / Dark Mode Switch) */}
        <button
          type="button"
          onClick={handleToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="theme-toggle-btn"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>

        {/* User Profile Widget */}
        <div className="user-pill-container" ref={dropdownRef}>
          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="user-pill" 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'inherit', 
              font: 'inherit', 
              cursor: 'pointer',
              display: 'flex',
              padding: 0,
              textAlign: 'left'
            }}
          >
            <span>
              <strong>{user}</strong>
              <small style={{ display: 'block', color: 'var(--muted)' }}>{role}</small>
            </span>
            {currentUser?.profile_image ? (
              <img 
                src={currentUser.profile_image} 
                alt={user} 
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} 
              />
            ) : (
              <b>{user.split(' ').map((part) => part ? part[0] : '').join('')}</b>
            )}
          </button>

          {isOpen && (
            <div className="profile-dropdown">
              <button 
                type="button"
                className="profile-dropdown-item"
                onClick={() => {
                  setIsOpen(false)
                  navigate('/profile')
                }}
              >
                👤 Manage Account
              </button>
              <div className="profile-dropdown-divider" />
              <button 
                type="button"
                className="profile-dropdown-item danger"
                onClick={() => {
                  setIsOpen(false)
                  handleLogout()
                }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar
