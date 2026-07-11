import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Notice from '../components/Notice'
import StatusBadge from '../components/StatusBadge'
import DashboardLayout from '../layouts/DashboardLayout'
import { adminNav } from '../data/navigation'
import { api, formatDateTime, getStoredUser, roleLabels } from '../lib/api'

function AdminProposalsPage() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])

  const [proposals, setProposals] = useState([])
  const [catalog, setCatalog] = useState({ clubs: [], event_categories: [] })
  const [status, setStatus] = useState({ loading: true, message: '', tone: 'info' })
  const [activeTab, setActiveTab] = useState('All') // 'All' | 'Pending' | 'Approved' | 'Rejected'

  const loadData = () => {
    setStatus({ loading: true, message: '', tone: 'info' })
    Promise.all([api.proposals(), api.catalog()])
      .then(([proposalData, catalogData]) => {
        setProposals(proposalData)
        setCatalog(catalogData)
        setStatus({ loading: false, message: '', tone: 'info' })
      })
      .catch((error) => {
        setStatus({ loading: false, message: error.message, tone: 'danger' })
      })
  }

  useEffect(() => {
    if (!user || Number(user.role_id) !== 1) {
      navigate('/login')
      return
    }
    loadData()
  }, [navigate, user])

  const getClubName = (clubId) => {
    const club = catalog.clubs.find((c) => Number(c.club_id) === Number(clubId))
    return club ? club.club_name : `Club #${clubId}`
  }

  const decideProposal = async (proposal, decision) => {
    try {
      setStatus({ loading: false, message: '', tone: 'info' })
      if (decision === 'approve') {
        await api.approveProposal(proposal.proposal_id)
        setStatus({ loading: false, message: 'Proposal approved and event published successfully.', tone: 'success' })
      } else {
        const reason = window.prompt('Enter rejection reason:')
        if (reason === null) return // Canceled
        if (!reason.trim()) {
          setStatus({ loading: false, message: 'Rejection reason is required.', tone: 'danger' })
          return
        }
        await api.rejectProposal(proposal.proposal_id, reason)
        setStatus({ loading: false, message: 'Proposal rejected successfully.', tone: 'success' })
      }
      loadData()
    } catch (error) {
      setStatus({ loading: false, message: error.message, tone: 'danger' })
    }
  }

  // Filter proposals based on active tab
  const filteredProposals = useMemo(() => {
    if (activeTab === 'All') return proposals
    if (activeTab === 'Pending') {
      return proposals.filter((p) => p.status === 'Pending')
    }
    return proposals.filter((p) => p.status === activeTab)
  }, [proposals, activeTab])

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Admin User'

  return (
    <DashboardLayout
      sidebarTitle="Campus-Y"
      navItems={adminNav}
      user={displayName}
      role={roleLabels[user?.role_id] || 'Admin'}
      topbarTitle="Event Proposals"
    >
      <section className="welcome-panel">
        <h2>Event Proposal Request</h2>
        <p>Review and verify incoming event proposals from all student clubs. Approved events are automatically published.</p>
      </section>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '14px' }}>
        {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius)',
              border: 'none',
              background: activeTab === tab ? 'var(--primary)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'var(--text-muted)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab === 'All' ? 'All Requests' : tab}
          </button>
        ))}
      </div>

      {status.message && <Notice tone={status.tone}>{status.message}</Notice>}
      {status.loading && <Notice>Loading proposal data...</Notice>}

      {!status.loading && (
        <section className="panel">
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Organizing Club</th>
                  <th>Venue</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.map((proposal) => (
                  <tr key={proposal.proposal_id}>
                    <td style={{ fontWeight: '600' }}>{proposal.title}</td>
                    <td>{getClubName(proposal.club_id)}</td>
                    <td>{proposal.venue}</td>
                    <td>{formatDateTime(proposal.start_date)}</td>
                    <td>
                      <StatusBadge tone={
                        proposal.status === 'Approved' ? 'success' :
                        proposal.status === 'Rejected' ? 'danger' : 'warning'
                      }>
                        {proposal.status}
                      </StatusBadge>
                    </td>
                    <td>
                      {proposal.status === 'Pending' ? (
                        <div className="table-actions">
                          <Button onClick={() => decideProposal(proposal, 'approve')}>Approve</Button>
                          <Button onClick={() => decideProposal(proposal, 'reject')} variant="secondary">Reject</Button>
                        </div>
                      ) : 'Reviewed'}
                    </td>
                  </tr>
                ))}
                {filteredProposals.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                      No event proposals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </DashboardLayout>
  )
}

export default AdminProposalsPage
