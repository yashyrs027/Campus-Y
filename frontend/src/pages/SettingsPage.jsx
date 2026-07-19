import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Icon from '../components/Icon'
import Notice from '../components/Notice'
import DashboardLayout from '../layouts/DashboardLayout'
import { studentNav, clubNav, adminNav, reviewerNav } from '../data/navigation'
import { api, getStoredUser, dashboardPathForRole, roleLabels } from '../lib/api'

function SettingsPage() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })

  // Password visibility eye toggle states
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [status, setStatus] = useState({ loading: false, message: '', tone: 'info' })

  // Determine navigation menu and titles dynamically based on user role
  const navConfig = useMemo(() => {
    if (!user) return { navItems: [], title: 'Campus-Y' }
    const roleId = Number(user.role_id)
    if (roleId === 1) {
      return { navItems: adminNav, title: 'Campus-Y' }
    } else if (roleId === 2 || roleId === 3) {
      return { navItems: reviewerNav, title: 'Campus-Y' }
    } else if (roleId === 4 || roleId === 5) {
      return { navItems: clubNav, title: 'Campus-Y' }
    } else {
      return { navItems: studentNav, title: 'Campus-Y' }
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Cancel Action: Discards input changes and redirects back to main role dashboard
  const handleCancel = () => {
    setPasswordForm({
      old_password: '',
      new_password: '',
      confirm_password: '',
    })
    setShowOldPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    if (user) {
      navigate(dashboardPathForRole(user.role_id))
    } else {
      navigate('/login')
    }
  }

  // Update Credentials Handler: Sends request to API
  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ loading: true, message: '', tone: 'info' })

    if (!passwordForm.old_password) {
      setStatus({ loading: false, message: 'Current password is required.', tone: 'danger' })
      return
    }

    if (!passwordForm.new_password || passwordForm.new_password.length < 8) {
      setStatus({ loading: false, message: 'New password must be at least 8 characters long.', tone: 'danger' })
      return
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setStatus({ loading: false, message: 'New passwords do not match.', tone: 'danger' })
      return
    }

    try {
      await api.changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      })

      setPasswordForm({
        old_password: '',
        new_password: '',
        confirm_password: '',
      })
      setShowOldPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)

      setStatus({
        loading: false,
        message: 'Credentials updated successfully.',
        tone: 'success',
      })
    } catch (error) {
      setStatus({ loading: false, message: error.message || 'Failed to update credentials.', tone: 'danger' })
    }
  }

  const displayName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User' : 'User'

  return (
    <DashboardLayout
      sidebarTitle={navConfig.title}
      sidebarSubtitle={navConfig.subtitle}
      navItems={navConfig.navItems}
      action={navConfig.action}
      topbarTitle="Setting"
      user={displayName}
      role={user ? roleLabels[user.role_id] || 'Member' : 'Member'}
    >
      {/* Primary Container Card */}
      <div className="panel" style={{ maxWidth: '680px', margin: '0 auto' }}>
        
        {/* A. Header Section */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', color: 'var(--primary-strong)' }}>Setting</h2>
          <p style={{ color: 'var(--muted)', marginTop: '4px' }}>
            Manage your security parameters, update authentication credentials, and configure system preferences.
          </p>
        </div>

        {status.message && <Notice tone={status.tone}>{status.message}</Notice>}

        {/* B. Security & Credentials Form */}
        <form onSubmit={handleSubmit} className="proposal-form" style={{ gap: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', marginBottom: '8px' }}>
            <Icon name="settings" /> Security & Credentials
          </h3>

          <div style={{ display: 'grid', gap: '18px' }}>
            
            {/* Current Password Input Field */}
            <label>
              <span>Current Password</span>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  name="old_password"
                  value={passwordForm.old_password}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  required
                  style={{ width: '100%', paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  aria-label={showOldPassword ? 'Hide current password' : 'Show current password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                  }}
                >
                  <Icon name={showOldPassword ? 'eyeOff' : 'eye'} />
                </button>
              </div>
            </label>

            {/* New Password Input Field */}
            <label>
              <span>New Password</span>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="new_password"
                  value={passwordForm.new_password}
                  onChange={handleChange}
                  placeholder="Enter new password (min. 8 characters)"
                  required
                  minLength={8}
                  style={{ width: '100%', paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                  }}
                >
                  <Icon name={showNewPassword ? 'eyeOff' : 'eye'} />
                </button>
              </div>
            </label>

            {/* Confirm New Password Input Field */}
            <label>
              <span>Confirm New Password</span>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirm_password"
                  value={passwordForm.confirm_password}
                  onChange={handleChange}
                  placeholder="Re-enter new password"
                  required
                  minLength={8}
                  style={{ width: '100%', paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                  }}
                >
                  <Icon name={showConfirmPassword ? 'eyeOff' : 'eye'} />
                </button>
              </div>
            </label>
          </div>

          {/* C. Combined Action Footer */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              alignItems: 'center',
              gap: '12px', 
              marginTop: '24px', 
              paddingTop: '20px', 
              borderTop: '1px solid var(--border-soft)' 
            }}
          >
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleCancel}
              disabled={status.loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={status.loading}
            >
              {status.loading ? 'Updating Credentials...' : 'Update Credentials'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default SettingsPage
