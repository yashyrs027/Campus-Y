import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import MetricCard from '../components/MetricCard'
import Notice from '../components/Notice'
import StatusBadge from '../components/StatusBadge'
import DashboardLayout from '../layouts/DashboardLayout'
import { adminNav } from '../data/navigation'
import { api, formatDateTime, getStoredUser, normalizeEvent, roleLabels } from '../lib/api'

function AdminDashboard() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])
  const [dashboard, setDashboard] = useState(null)
  const [proposals, setProposals] = useState([])
  const [events, setEvents] = useState([])
  const [clubs, setClubs] = useState([])
  const [status, setStatus] = useState({ loading: true, message: '', tone: 'info' })
  
  // Track active detail card expansion
  const [activeMetric, setActiveMetric] = useState(null)

  const load = () => {
    Promise.all([
      api.adminDashboard(),
      api.proposals(),
      api.events(),
      api.catalog()
    ])
      .then(([dashboardData, proposalData, eventsData, catalogData]) => {
        setDashboard(dashboardData)
        setProposals(proposalData)
        setEvents(eventsData.map(normalizeEvent))
        setClubs(catalogData.clubs || [])
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

    load()
  }, [navigate, user])

  const decideProposal = async (proposal, decision) => {
    setStatus({ loading: false, message: '', tone: 'info' })
    try {
      if (decision === 'approve') await api.approveProposal(proposal.proposal_id)
      if (decision === 'reject') {
        const reason = window.prompt('Enter the rejection reason:')
        if (!reason) return
        await api.rejectProposal(proposal.proposal_id, reason)
      }
      setStatus({ loading: false, message: `Proposal ${decision}d successfully.`, tone: 'success' })
      load()
    } catch (error) {
      setStatus({ loading: false, message: error.message, tone: 'danger' })
    }
  }

  // Calculations for detail views
  const usersStats = useMemo(() => {
    if (!dashboard) return { admin: 0, hod: 0, faculty: 0, student: 0, coordinator: 0 }
    const hod = Number(dashboard.total_hods || 0)
    const faculty = Number(dashboard.total_faculty || 0)
    const student = Number(dashboard.total_students || 0)
    const coordinator = Number(dashboard.total_club_coordinators || 0)
    const total = Number(dashboard.total_users || 0)
    const admin = Math.max(0, total - (hod + faculty + student + coordinator))
    return { admin, hod, faculty, student, coordinator }
  }, [dashboard])

  const eventsStats = useMemo(() => {
    const completed = events.filter((e) => e.computedStatus === 'Completed')
    const ongoing = events.filter((e) => e.computedStatus === 'Ongoing')
    const upcoming = events.filter((e) => e.computedStatus === 'Upcoming')
    return { completed, ongoing, upcoming }
  }, [events])

  const proposalsStats = useMemo(() => {
    const pending = proposals.filter((p) => ['Pending', 'Under Faculty Review', 'Under HOD Review'].includes(p.status))
    const approved = proposals.filter((p) => p.status === 'Approved')
    const rejected = proposals.filter((p) => p.status === 'Rejected')
    return { pending, approved, rejected }
  }, [proposals])

  const toggleMetric = (metric) => {
    setActiveMetric((curr) => (curr === metric ? null : metric))
  }

  return (
    <DashboardLayout
      sidebarTitle="Admin Central"
      sidebarSubtitle="University Portal"
      navItems={adminNav}
      topbarTitle="Admin"
      user={user ? `${user.first_name} ${user.last_name}` : 'Admin'}
      role={roleLabels[user?.role_id] || 'System Owner'}
    >
      {status.message && <Notice tone={status.tone}>{status.message}</Notice>}
      {status.loading && <Notice>Loading admin dashboard data...</Notice>}
      
      <section className="section-heading">
        <div>
          <h2>Executive Dashboard</h2>
          <p>Real-time overview of Campus-Y performance and student engagement. Click cards below to view breakdowns.</p>
        </div>
      </section>

      <div className="metrics-grid admin-metrics" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <div onClick={() => toggleMetric('users')} style={{ cursor: 'pointer' }}>
          <MetricCard 
            icon="users" 
            label="Total Users" 
            value={dashboard?.total_users || 0} 
            note="Click to expand list" 
            style={activeMetric === 'users' ? { border: '2px solid var(--primary)', background: '#f5f7ff' } : {}}
          />
        </div>
        <div onClick={() => toggleMetric('events')} style={{ cursor: 'pointer' }}>
          <MetricCard 
            icon="calendar" 
            label="Total Events" 
            value={events.length} 
            note="Click to check statuses" 
            style={activeMetric === 'events' ? { border: '2px solid var(--primary)', background: '#f5f7ff' } : {}}
          />
        </div>
        <div onClick={() => toggleMetric('proposals')} style={{ cursor: 'pointer' }}>
          <MetricCard 
            icon="check" 
            label="Proposal Requests" 
            value={proposals.length} 
            note="Click to see pending/rejected" 
            style={activeMetric === 'proposals' ? { border: '2px solid var(--primary)', background: '#f5f7ff' } : {}}
          />
        </div>
        <div onClick={() => toggleMetric('clubs')} style={{ cursor: 'pointer' }}>
          <MetricCard 
            icon="users" 
            label="Total Clubs" 
            value={clubs.length} 
            note="Click to view clubs list" 
            style={activeMetric === 'clubs' ? { border: '2px solid var(--primary)', background: '#f5f7ff' } : {}}
          />
        </div>
      </div>

      {/* Dynamic Expansion Panels */}
      {activeMetric && (
        <section className="panel" style={{ marginTop: '24px', background: '#fff', border: '1px solid var(--primary-soft)', padding: '24px' }}>
          {activeMetric === 'users' && (
            <div>
              <h3><span style={{ color: 'var(--primary)' }}>👤</span> Total Users Breakdown</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginTop: '20px', textAlign: 'center' }}>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
                  <strong>Admin</strong>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', marginTop: '6px' }}>{usersStats.admin}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
                  <strong>HOD</strong>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', marginTop: '6px' }}>{usersStats.hod}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
                  <strong>Faculty</strong>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', marginTop: '6px' }}>{usersStats.faculty}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
                  <strong>Club President / VP</strong>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', marginTop: '6px' }}>{usersStats.coordinator}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
                  <strong>Student</strong>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', marginTop: '6px' }}>{usersStats.student}</div>
                </div>
              </div>
            </div>
          )}

          {activeMetric === 'events' && (
            <div>
              <h3><span style={{ color: 'var(--primary)' }}>📅</span> Event Catalog by Status</h3>
              <div className="table-scroll" style={{ marginTop: '16px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Count</th>
                      <th>Events List</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>Ongoing</td>
                      <td>{eventsStats.ongoing.length}</td>
                      <td>{eventsStats.ongoing.map((e) => e.title).join(', ') || 'None'}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', color: 'var(--warning)' }}>Upcoming</td>
                      <td>{eventsStats.upcoming.length}</td>
                      <td>{eventsStats.upcoming.map((e) => e.title).join(', ') || 'None'}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', color: 'var(--muted)' }}>Completed</td>
                      <td>{eventsStats.completed.length}</td>
                      <td>{eventsStats.completed.map((e) => e.title).join(', ') || 'None'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMetric === 'proposals' && (
            <div>
              <h3><span style={{ color: 'var(--primary)' }}>📋</span> Proposal Status Summary</h3>
              <div className="table-scroll" style={{ marginTop: '16px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Status Category</th>
                      <th>Count</th>
                      <th>Proposal Titles</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 'bold', color: 'var(--warning)' }}>Pending Approval</td>
                      <td>{proposalsStats.pending.length}</td>
                      <td>{proposalsStats.pending.map((p) => p.title).join(', ') || 'None'}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>Approved Proposals</td>
                      <td>{proposalsStats.approved.length}</td>
                      <td>{proposalsStats.approved.map((p) => p.title).join(', ') || 'None'}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', color: 'var(--danger)' }}>Rejected Proposals</td>
                      <td>{proposalsStats.rejected.length}</td>
                      <td>{proposalsStats.rejected.map((p) => p.title).join(', ') || 'None'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMetric === 'clubs' && (
            <div>
              <h3><span style={{ color: 'var(--primary)' }}>🏫</span> Registered University Clubs</h3>
              <div className="table-scroll" style={{ marginTop: '16px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Club Name</th>
                      <th>Department</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubs.map((club) => (
                      <tr key={club.club_id}>
                        <td style={{ fontWeight: 'bold' }}>{club.club_name}</td>
                        <td>{club.department_name || 'General'}</td>
                        <td>
                          <span style={{ color: club.is_active ? 'var(--success)' : 'var(--muted)' }}>
                            {club.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!clubs.length && (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center' }}>No clubs registered.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      <div className="admin-grid" style={{ marginTop: '24px' }}>
        <section className="panel registrations-panel" style={{ gridColumn: 'span 2' }}>
          <div className="panel-heading">
            <h3>Recent Event Proposals (Awaiting Review)</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Venue</th>
                <th>Created</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => (
                <tr key={proposal.proposal_id}>
                  <td>{proposal.title}</td>
                  <td>{proposal.venue}</td>
                  <td>{formatDateTime(proposal.created_at)}</td>
                  <td><StatusBadge tone={proposal.status === 'Pending' ? 'warning' : 'success'}>{proposal.status}</StatusBadge></td>
                  <td>
                    {['Pending', 'Under Faculty Review', 'Under HOD Review'].includes(proposal.status) ? (
                      <div className="table-actions">
                        <Button onClick={() => decideProposal(proposal, 'approve')}>Approve</Button>
                        <Button onClick={() => decideProposal(proposal, 'reject')} variant="secondary">Reject</Button>
                      </div>
                    ) : 'Reviewed'}
                  </td>
                </tr>
              ))}
              {!proposals.length && (
                <tr>
                  <td colSpan="5">No proposals found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
