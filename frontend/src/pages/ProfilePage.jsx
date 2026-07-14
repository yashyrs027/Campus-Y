import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Icon from '../components/Icon'
import Notice from '../components/Notice'
import MetricCard from '../components/MetricCard'
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
    profile_image: '',
  })
  const [departments, setDepartments] = useState([])
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [profileStatus, setProfileStatus] = useState({ loading: false, message: '', tone: 'info' })
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, message: '', tone: 'info' })
  const [stats, setStats] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setProfileStatus({ loading: false, message: 'Please select a valid image file.', tone: 'danger' })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setProfile((prev) => ({ ...prev, profile_image: event.target.result }))
    }
    reader.readAsDataURL(file)
  }

  // Determine navigation menu and titles dynamically based on role
  const navConfig = useMemo(() => {
    if (!user) return { navItems: [], title: 'Campus-Y'}
    const roleId = Number(user.role_id)
    if (roleId === 1) {
      return { navItems: adminNav, title: 'Campus-Y' }
    } else if (roleId === 2 || roleId === 3) {
      return { navItems: reviewerNav, title: 'Campus-Y' }
    } else if (roleId === 4 || roleId === 5) {
      return {
        navItems: clubNav,
        title: 'Campus-Y',
        // action: { label: 'New Proposal', icon: 'plus', to: '/proposal/new' },
      }
    } else {
      return { navItems: studentNav, title: 'Campus-Y' }
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Fetch profile details, department list, and profile stats
    setProfileStatus({ loading: true, message: '', tone: 'info' })
    Promise.all([api.profile(), api.catalog(), api.profileStats()])
      .then(([profileData, catalogData, statsData]) => {
        setProfile({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          phone: profileData.phone || '',
          gender: profileData.gender || 'Male',
          email: profileData.email || '',
          role_id: profileData.role_id || user.role_id,
          department_id: profileData.department_id || '',
          profile_image: profileData.profile_image || '',
        })
        setDepartments(catalogData.departments || [])
        setStats(statsData)
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
        profile_image: profile.profile_image || null,
      })

      // Update local storage session so topbar is updated instantly
      const session = {
        token: getToken(),
        user: {
          ...user,
          first_name: updated.first_name,
          last_name: updated.last_name,
          profile_image: updated.profile_image,
        },
      }
      saveSession(session)

      setProfile((prev) => ({
        ...prev,
        first_name: updated.first_name,
        last_name: updated.last_name,
        phone: updated.phone || '',
        gender: updated.gender,
        profile_image: updated.profile_image || '',
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
        <h2>Profile Settings</h2>
        <p>Keep your user information up to date and manage your account security.</p>
      </section>

      {/* Stats Dashboard Section */}
      {stats && (
        <section className="metrics-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {Number(profile.role_id) === 6 && (
            <>
              <MetricCard icon="calendar" label="Events Registered" value={stats.registrations ?? 0} />
              <MetricCard icon="certificate" label="Completed Events" value={stats.certificates ?? 0} />
            </>
          )}
          {(Number(profile.role_id) === 4 || Number(profile.role_id) === 5) && (
            <>
              <MetricCard icon="activity" label="Organized Events" value={stats.organized_events ?? 0} />
              <MetricCard icon="users" label="Total Registrations" value={stats.registrations_received ?? 0} />
            </>
          )}
          {[1, 2, 3].includes(Number(profile.role_id)) && (
            <MetricCard icon="check" label="Reviews Performed" value={stats.reviews_performed ?? 0} />
          )}
        </section>
      )}

      <div className="proposal-grid">
        <div className="panel">
          <h3><Icon name="users" /> Personal Details</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
            Registered role: <strong>{roleLabels[profile.role_id]}</strong> in <strong>{departmentName}</strong>
          </p>

          {profileStatus.message && <Notice tone={profileStatus.tone}>{profileStatus.message}</Notice>}

          {/* Avatar Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-soft)' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-strong)' }}>Profile Picture</span>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary-soft)', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {profile.profile_image ? (
                  <img src={profile.profile_image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary-strong)' }}>
                    {displayName.split(' ').map((p) => p[0]).join('')}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                />
                <Button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  style={{ minHeight: 'auto', padding: '10px 18px', fontSize: '14px' }}
                >
                  Upload Picture
                </Button>
                {profile.profile_image && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setProfile((prev) => ({ ...prev, profile_image: '' }))} 
                    style={{ minHeight: 'auto', padding: '10px 14px', fontSize: '14px', color: 'var(--danger)' }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

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

        {/* <aside className="proposal-side"> */}
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
        {/* </aside> */}
      </div>
    </DashboardLayout>
  )
}

export default ProfilePage
