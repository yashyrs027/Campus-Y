import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Icon from '../components/Icon'
import Notice from '../components/Notice'
import DashboardLayout from '../layouts/DashboardLayout'
import { studentNav, clubNav, adminNav, reviewerNav } from '../data/navigation'
import { api, getStoredUser, getToken, saveSession, roleLabels } from '../lib/api'

function ProfilePage() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])

  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    gender: '',
    email: '',
    role_id: '',
    department_id: '',
  })
  const [departments, setDepartments] = useState([])
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [profileStatus, setProfileStatus] = useState({ loading: false, message: '', tone: 'info' })
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, message: '', tone: 'info' })

  // Determine navigation menu and titles dynamically based on role
  const navConfig = useMemo(() => {
    if (!user) return { navItems: [], title: 'Campus-Y', subtitle: 'Portal' }
    const roleId = Number(user.role_id)
    if (roleId === 1) {
      return { navItems: adminNav, title: 'Admin Central', subtitle: 'University Portal' }
    } else if (roleId === 2 || roleId === 3) {
      return { navItems: reviewerNav, title: 'Campus-Y Review', subtitle: 'Approval Workspace' }
    } else if (roleId === 4 || roleId === 5) {
      return {
        navItems: clubNav,
        title: 'Club Management',
        subtitle: 'President Portal',
        action: { label: 'New Proposal', icon: 'plus', to: '/proposal/new' },
      }
    } else {
      return { navItems: studentNav, title: 'Campus-Y', subtitle: 'Student Portal' }
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Fetch profile details and department list
    setProfileStatus({ loading: true, message: '', tone: 'info' })
    Promise.all([api.profile(), api.catalog()])
      .then(([profileData, catalogData]) => {
        setProfile({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          phone: profileData.phone || '',
          gender: profileData.gender || 'Male',
          email: profileData.email || '',
          role_id: profileData.role_id || user.role_id,
          department_id: profileData.department_id || '',
        })
        setDepartments(catalogData.departments || [])
        setProfileStatus({ loading: false, message: '', tone: 'info' })
      })
      .catch((error) => {
        setProfileStatus({ loading: false, message: error.message, tone: 'danger' })
      })
  }, [navigate, user])

  const handleProfileChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const submitProfile = async (e) => {
    e.preventDefault()
    setProfileStatus({ loading: true, message: '', tone: 'info' })

    try {
      const updated = await api.updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone || null,
        gender: profile.gender,
      })

      // Update local storage session so topbar is updated instantly
      const session = {
        token: getToken(),
        user: {
          ...user,
          first_name: updated.first_name,
          last_name: updated.last_name,
        },
      }
      saveSession(session)

      setProfile((prev) => ({
        ...prev,
        first_name: updated.first_name,
        last_name: updated.last_name,
        phone: updated.phone || '',
        gender: updated.gender,
      }))
      setProfileStatus({ loading: false, message: 'Profile updated successfully.', tone: 'success' })
    } catch (error) {
      setProfileStatus({ loading: false, message: error.message, tone: 'danger' })
    }
  }

  const submitPassword = async (e) => {
    e.preventDefault()
    setPasswordStatus({ loading: true, message: '', tone: 'info' })

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordStatus({ loading: false, message: 'New passwords do not match.', tone: 'danger' })
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
      setPasswordStatus({ loading: false, message: 'Password updated successfully.', tone: 'success' })
    } catch (error) {
      setPasswordStatus({ loading: false, message: error.message, tone: 'danger' })
    }
  }

  const departmentName = useMemo(() => {
    const dept = departments.find((d) => Number(d.department_id) === Number(profile.department_id))
    return dept ? `${dept.department_name} (${dept.department_code})` : 'General Department'
  }, [departments, profile.department_id])

  const displayName = `${profile.first_name || user?.first_name || ''} ${profile.last_name || user?.last_name || ''}`.trim() || 'User'

  return (
    <DashboardLayout
      sidebarTitle={navConfig.title}
      sidebarSubtitle={navConfig.subtitle}
      navItems={navConfig.navItems}
      action={navConfig.action}
      topbarTitle="My Profile"
      user={displayName}
      role={roleLabels[profile.role_id] || 'Member'}
    >
      <section className="welcome-panel">
        <h2>Manage Profile Settings</h2>
        <p>Keep your user information up to date and manage your account security.</p>
      </section>

      <div className="proposal-grid">
        <div className="panel">
          <h3><Icon name="users" /> Personal Details</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
            Registered role: <strong>{roleLabels[profile.role_id]}</strong> in <strong>{departmentName}</strong>
          </p>

          {profileStatus.message && <Notice tone={profileStatus.tone}>{profileStatus.message}</Notice>}

          <form onSubmit={submitProfile} className="proposal-form" style={{ gap: '20px' }}>
            <div className="form-row">
              <label>
                <span>First Name</span>
                <input
                  name="first_name"
                  value={profile.first_name}
                  onChange={handleProfileChange}
                  required
                  placeholder="e.g. Alex"
                />
              </label>
              <label>
                <span>Last Name</span>
                <input
                  name="last_name"
                  value={profile.last_name}
                  onChange={handleProfileChange}
                  required
                  placeholder="e.g. Rivera"
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                <span>Email Address (Readonly)</span>
                <input
                  name="email"
                  value={profile.email}
                  disabled
                  style={{ background: '#f5f5f5', color: '#888', cursor: 'not-allowed' }}
                />
              </label>
              <label>
                <span>Phone Number</span>
                <input
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  placeholder="e.g. +91 99999 88888"
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                <span>Gender</span>
                <select name="gender" value={profile.gender} onChange={handleProfileChange} required>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button disabled={profileStatus.loading} type="submit" style={{ width: '100%' }}>
                  {profileStatus.loading ? 'Saving...' : 'Save Profile Details'}
                </Button>
              </div>
            </div>
          </form>
        </div>

        <aside className="proposal-side">
          <div className="panel">
            <h3><Icon name="settings" /> Change Password</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '20px', fontSize: '14px' }}>
              We recommend using a password at least 8 characters long containing letters and digits.
            </p>

            {passwordStatus.message && <Notice tone={passwordStatus.tone}>{passwordStatus.message}</Notice>}

            <form onSubmit={submitPassword} className="proposal-form" style={{ display: 'grid', gap: '15px' }}>
              <label>
                <span>Current Password</span>
                <input
                  type="password"
                  name="old_password"
                  value={passwordForm.old_password}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                />
              </label>
              <label>
                <span>New Password</span>
                <input
                  type="password"
                  name="new_password"
                  value={passwordForm.new_password}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                />
              </label>
              <label>
                <span>Confirm New Password</span>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordForm.confirm_password}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                />
              </label>
              <Button disabled={passwordStatus.loading} type="submit" variant="secondary" style={{ width: '100%', marginTop: '10px' }}>
                {passwordStatus.loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  )
}

export default ProfilePage
