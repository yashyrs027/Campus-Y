import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Notice from '../components/Notice'
import DashboardLayout from '../layouts/DashboardLayout'
import { adminNav } from '../data/navigation'
import { api, getStoredUser, roleLabels } from '../lib/api'

function AssignRolesPage() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])

  const [usersList, setUsersList] = useState([])
  const [status, setStatus] = useState({ loading: true, message: '', tone: 'info' })

  // Form State
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState('')

  const loadData = () => {
    api.users()
      .then((data) => {
        setUsersList(data || [])
        setStatus({ loading: false, message: '', tone: 'info' })
      })
      .catch((error) => {
        setStatus({ loading: false, message: error.message, tone: 'danger' })
      })
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadData()
  }, [navigate, user])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ loading: true, message: '', tone: 'info' })

    try {
      await api.assignRole({
        email: email.trim(),
        role_id: Number(roleId)
      })
      
      setStatus({ 
        loading: false, 
        message: `Role assigned successfully to ${email}.`, 
        tone: 'success' 
      })
      
      setEmail('')
      setRoleId('')
      loadData() // Refresh list to show updated role
    } catch (error) {
      setStatus({ loading: false, message: error.message, tone: 'danger' })
    }
  }

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Admin'

  return (
    <DashboardLayout
      sidebarTitle="Campus-Y"
      
      navItems={adminNav}
      topbarTitle="Assign Roles"
      user={displayName}
      role={roleLabels[user?.role_id] || 'System Owner'}
    >
      {status.message && <Notice tone={status.tone}>{status.message}</Notice>}
      {status.loading && <Notice>Loading users registry...</Notice>}

      <section className="section-heading">
        <div>
          <h2>Assign Roles & Permissions</h2>
          <p>Assign administrative or coordinator access to users using their email address.</p>
        </div>
      </section>

      <div className="proposal-grid" style={{ gap: '24px' }}>
        {/* Users registry list */}
        <div className="panel">
          <h3>Registered Users Directory</h3>
          <div className="table-scroll" style={{ marginTop: '16px' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((usr) => (
                  <tr key={usr.user_id}>
                    <td style={{ fontWeight: 'bold' }}>{usr.first_name} {usr.last_name}</td>
                    <td>{usr.email}</td>
                    <td>
                      <span className="chip" style={{ background: 'var(--primary-soft)', color: 'var(--primary-strong)', padding: '4px 10px' }}>
                        {roleLabels[usr.role_id] || 'Student'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: usr.is_active ? 'var(--success)' : 'var(--muted)' }}>
                        {usr.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
                {!usersList.length && !status.loading && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>No users found in directory.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Assignment Form */}
        <div className="panel" style={{ height: 'fit-content' }}>
          <h3>Modify Access Level</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', marginTop: '16px' }}>
            <label>
              <span>User Email Address</span>
              <br />
              <input
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. professor@university.edu"
                required
                type="email"
                value={email}
              />
            </label>

            <label>
              <span>Assign Access Role</span>
              <select name="roleId" onChange={(e) => setRoleId(e.target.value)} required value={roleId}>
                <option value="">Select target role</option>
                <option value="2">Head of Department (HOD)</option>
                <option value="3">Faculty Coordinator</option>
                <option value="4">Club Coordinator / President</option>
                <option value="6">Student</option>
              </select>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button type="submit">
                Update Permission Access
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AssignRolesPage
