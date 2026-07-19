import { useEffect, useMemo, useState, useRef } from 'react'
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

  // Profile fields state
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    gender: '',
    email: '',
    role_id: '',
    department_id: '',
    student_id: '',
    profile_image: '',
  })

  // Original profile state backup for "Cancel" operation
  const [initialProfile, setInitialProfile] = useState(null)
  const [departments, setDepartments] = useState([])
  const [status, setStatus] = useState({ loading: false, message: '', tone: 'info' })
  const fileInputRef = useRef(null)

  // Dynamic navigation configuration based on role
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
      return
    }

    setStatus({ loading: true, message: '', tone: 'info' })
    Promise.all([api.profile(), api.catalog()])
      .then(([profileData, catalogData]) => {
        const loadedProfile = {
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          phone: profileData.phone || '',
          gender: profileData.gender || 'Male',
          email: profileData.email || '',
          role_id: profileData.role_id || user.role_id,
          department_id: profileData.department_id || '',
          student_id: profileData.student_id || '',
          profile_image: profileData.profile_image || '',
        }
        setProfile(loadedProfile)
        setInitialProfile(loadedProfile)
        setDepartments(catalogData.departments || [])
        setStatus({ loading: false, message: '', tone: 'info' })
      })
      .catch((error) => {
        setStatus({ loading: false, message: error.message, tone: 'danger' })
      })
  }, [navigate, user])

  const handleProfileChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setStatus({ loading: false, message: 'Please select a valid image file.', tone: 'danger' })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setProfile((prev) => ({ ...prev, profile_image: event.target.result }))
    }
    reader.readAsDataURL(file)
  }

  // Cancel action: restore initial loaded values
  const handleCancel = () => {
    if (initialProfile) {
      setProfile(initialProfile)
    }
    setStatus({ loading: false, message: 'Changes discarded.', tone: 'info' })
  }

  // Submit profile details exclusively
  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ loading: true, message: '', tone: 'info' })

    try {
      const updated = await api.updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone || null,
        gender: profile.gender,
        student_id: profile.student_id || null,
        profile_image: profile.profile_image || null,
      })

      // Update session storage so Topbar profile widget reflects new info instantly
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

      const refreshedProfile = {
        ...profile,
        first_name: updated.first_name,
        last_name: updated.last_name,
        phone: updated.phone || '',
        gender: updated.gender,
        student_id: updated.student_id || profile.student_id,
        profile_image: updated.profile_image || '',
      }
      setProfile(refreshedProfile)
      setInitialProfile(refreshedProfile)

      setStatus({
        loading: false,
        message: 'Profile details updated successfully.',
        tone: 'success',
      })
    } catch (error) {
      setStatus({ loading: false, message: error.message, tone: 'danger' })
    }
  }

  const departmentName = useMemo(() => {
    const dept = departments.find((d) => Number(d.department_id) === Number(profile.department_id))
    return dept ? `${dept.department_name} (${dept.department_code})` : 'General Department'
  }, [departments, profile.department_id])

  const displayName = `${profile.first_name || user?.first_name || ''} ${profile.last_name || user?.last_name || ''}`.trim() || 'User'
  const isStudentRole = Number(profile.role_id) === 6 || Boolean(profile.student_id)

  return (
    <DashboardLayout
      sidebarTitle={navConfig.title}
      sidebarSubtitle={navConfig.subtitle}
      navItems={navConfig.navItems}
      action={navConfig.action}
      topbarTitle="Profile Settings"
      user={displayName}
      role={roleLabels[profile.role_id] || 'Member'}
    >
      {/* Single Unified Primary Card Container */}
      <div className="panel" style={{ maxWidth: '880px', margin: '0 auto' }}>
        
        {/* Header & Context Section */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', color: 'var(--primary-strong)' }}>Profile Settings</h2>
          <p style={{ color: 'var(--muted)', marginTop: '4px' }}>
            Manage your personal information, contact details, and profile picture.
          </p>
          
          {/* Role Context Badge */}
          <div 
            style={{ 
              background: 'var(--surface-soft)', 
              padding: '12px 18px', 
              borderRadius: 'var(--radius)', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: 'var(--text-strong)', 
              border: '1px solid var(--border-soft)',
              marginTop: '16px' 
            }}
          >
            <strong>Registered Role:</strong> {roleLabels[profile.role_id] || 'Member'} &nbsp;|&nbsp; <strong>Department:</strong> {departmentName}
          </div>
        </div>

        {status.message && <Notice tone={status.tone}>{status.message}</Notice>}

        {/* Profile Picture Control (Top Level) */}
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px', 
            marginBottom: '28px', 
            paddingBottom: '24px', 
            borderBottom: '1px solid var(--border-soft)' 
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-strong)' }}>Profile Picture</span>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div 
              style={{ 
                position: 'relative', 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                overflow: 'hidden', 
                border: '3px solid var(--primary-soft)', 
                background: '#f1f5f9', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
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

        {/* Form Grid: Personal Identity & Contact */}
        <form onSubmit={handleSubmit} className="proposal-form" style={{ gap: '24px' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', marginBottom: '16px' }}>
              <Icon name="users" /> Identity & Contact
            </h3>
            
            <div className="form-row">
              <label>
                <span>First Name</span>
                <input
                  name="first_name"
                  value={profile.first_name}
                  onChange={handleProfileChange}
                  required
                  placeholder="First Name"
                />
              </label>
              <label>
                <span>Last Name</span>
                <input
                  name="last_name"
                  value={profile.last_name}
                  onChange={handleProfileChange}
                  required
                  placeholder="Last Name"
                />
              </label>
            </div>

            <div className="form-row" style={{ marginTop: '16px' }}>
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

            <div className="form-row" style={{ marginTop: '16px' }}>
              <label>
                <span>Gender</span>
                <select name="gender" value={profile.gender} onChange={handleProfileChange} required>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              {/* Conditional Field: Student ID / Roll No */}
              {isStudentRole && (
                <label>
                  <span>Student ID / Roll No</span>
                  <input
                    name="student_id"
                    value={profile.student_id}
                    onChange={handleProfileChange}
                    placeholder="e.g. 21CS001"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Consolidated Action Bar (Footer) */}
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
              {status.loading ? 'Saving Changes...' : 'Save Profile Details'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default ProfilePage
