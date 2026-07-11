import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Notice from '../components/Notice'
import StatusBadge from '../components/StatusBadge'
import DashboardLayout from '../layouts/DashboardLayout'
import { adminNav } from '../data/navigation'
import { api, getStoredUser, roleLabels } from '../lib/api'

function ManageClubsPage() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])

  const [clubs, setClubs] = useState([])
  const [departments, setDepartments] = useState([])
  const [status, setStatus] = useState({ loading: true, message: '', tone: 'info' })

  // Form State
  const [form, setForm] = useState({
    club_id: '',
    club_name: '',
    description: '',
    department_id: '',
    is_active: true
  })
  
  const [isEditing, setIsEditing] = useState(false)

  const loadData = () => {
    Promise.all([api.catalog(), api.clubs()])
      .then(([catalogData, clubsData]) => {
        setClubs(clubsData || catalogData.clubs || [])
        setDepartments(catalogData.departments || [])
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

  const updateField = (event) => {
    const val = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((current) => ({ ...current, [event.target.name]: val }))
  }

  const handleEdit = (club) => {
    setForm({
      club_id: club.club_id,
      club_name: club.club_name,
      description: club.description || '',
      department_id: club.department_id || '',
      is_active: club.is_active
    })
    setIsEditing(true)
    setStatus({ loading: false, message: '', tone: 'info' })
  }

  const handleCancel = () => {
    setForm({
      club_id: '',
      club_name: '',
      description: '',
      department_id: '',
      is_active: true
    })
    setIsEditing(false)
    setStatus({ loading: false, message: '', tone: 'info' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ loading: true, message: '', tone: 'info' })

    const payload = {
      club_name: form.club_name,
      description: form.description,
      department_id: Number(form.department_id),
      is_active: form.is_active
    }

    try {
      if (isEditing) {
        await api.updateClub(form.club_id, payload)
        setStatus({ loading: false, message: 'Club details updated successfully.', tone: 'success' })
      } else {
        await api.createClub(payload)
        setStatus({ loading: false, message: 'New club added successfully.', tone: 'success' })
      }
      handleCancel()
      loadData()
    } catch (error) {
      setStatus({ loading: false, message: error.message, tone: 'danger' })
    }
  }

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Admin'

  return (
    <DashboardLayout
      sidebarTitle="Campus-Y"
      navItems={adminNav}
      topbarTitle="Manage Clubs"
      user={displayName}
      role={roleLabels[user?.role_id] || 'System Owner'}
    >
      {status.message && <Notice tone={status.tone}>{status.message}</Notice>}
      {status.loading && <Notice>Loading clubs catalog...</Notice>}

      <section className="section-heading">
        <div>
          <h2>Manage Clubs & Student Organizations</h2>
          <p>Total Clubs Registered: <strong>{clubs.length}</strong>. Create new clubs or edit details.</p>
        </div>
      </section>

      <div className="proposal-grid" style={{ gap: '24px' }}>
        {/* Clubs Directory Table */}
        <div className="panel">
          <h3>Registered Clubs Directory</h3>
          <div className="table-scroll" style={{ marginTop: '16px' }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Club Name</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {clubs.map((club) => (
                  <tr key={club.club_id}>
                    <td>#{club.club_id}</td>
                    <td style={{ fontWeight: 'bold' }}>{club.club_name}</td>
                    <td>{club.department_name || 'General'}</td>
                    <td>
                      <StatusBadge tone={club.is_active ? 'success' : 'muted'}>
                        {club.is_active ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </td>
                    <td>
                      <Button onClick={() => handleEdit(club)} variant="secondary" style={{ padding: '4px 10px', minHeight: 'auto' }}>
                        Edit Details
                      </Button>
                    </td>
                  </tr>
                ))}
                {!clubs.length && !status.loading && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>No clubs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Club Modification Form */}
        <div className="panel" style={{ height: 'fit-content' }}>
          <h3>{isEditing ? 'Edit Club Details' : 'Add New Club'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', marginTop: '16px' }}>
            <label>
              <span>Club Name</span>
              <br />
              <input
                name="club_name"
                onChange={updateField}
                placeholder="e.g. Robotics Club"
                required
                value={form.club_name}
              />
            </label>

            <label>
              <span>Department Assignee</span>
              <select name="department_id" onChange={updateField} required value={form.department_id}>
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Club Description</span>
              <textarea
                name="description"
                onChange={updateField}
                placeholder="Brief summary of the club's focus and activities..."
                value={form.description}
                style={{ height: '100px', width: '100%' }}
              />
            </label>

            {isEditing && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  name="is_active"
                  onChange={updateField}
                  type="checkbox"
                  checked={form.is_active}
                  style={{ width: 'auto' }}
                />
                <span>Club is Active</span>
              </label>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              {isEditing && (
                <Button onClick={handleCancel} type="button" variant="secondary">
                  Cancel
                </Button>
              )}
              <Button type="submit">
                {isEditing ? 'Save Changes' : 'Create Club'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ManageClubsPage
