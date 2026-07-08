import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import MetricCard from '../components/MetricCard'
import Notice from '../components/Notice'
import StatusBadge from '../components/StatusBadge'
import DashboardLayout from '../layouts/DashboardLayout'
import { clubNav } from '../data/navigation'
import { api, formatDateTime, getStoredUser, roleLabels } from '../lib/api'

function ClubDashboard() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])

  const [dashboard, setDashboard] = useState(null)
  const [proposals, setProposals] = useState([])
  const [status, setStatus] = useState({ loading: true, message: '', tone: 'info' })

  const load = () => {
    Promise.all([api.clubDashboard(), api.proposals()])
      .then(([dashboardData, proposalData]) => {
        setDashboard(dashboardData)
        setProposals(proposalData)
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

  const renderTimeline = (proposalStatus) => {
    // 4 stages: Submitted -> Faculty Review -> HOD Review -> Published
    const stages = [
      { name: 'Submitted', key: 'submit', label: 'Proposal Submitted', state: 'done' },
      { name: 'Faculty Approval', key: 'faculty', label: 'Faculty Coordinator Approval', state: 'upcoming' },
      { name: 'HOD Approval', key: 'hod', label: 'HOD Approval', state: 'upcoming' },
      { name: 'Published', key: 'publish', label: 'Event Published', state: 'upcoming' }
    ]

    if (proposalStatus === 'Pending' || proposalStatus === 'Under Faculty Review') {
      stages[1].state = 'pending' // Faculty is currently reviewing
    } else if (proposalStatus === 'Under HOD Review') {
      stages[1].state = 'done'
      stages[2].state = 'pending' // HOD is currently reviewing
    } else if (proposalStatus === 'Approved') {
      stages[1].state = 'done'
      stages[2].state = 'done'
      stages[3].state = 'done' // Event is fully approved and published
    } else if (proposalStatus === 'Rejected') {
      // Rejection could occur at HOD or Faculty level. 
      // Let's assume it was rejected at HOD level if it reached HOD review, else Faculty.
      stages[1].state = 'done'
      stages[2].state = 'rejected'
    }

    return (
      <div className="proposal-timeline" style={{ marginTop: '14px', borderTop: '1px solid var(--border-soft)', paddingTop: '12px' }}>
        <small style={{ color: 'var(--muted)', display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approval Timeline</small>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', alignItems: 'center' }}>
          {stages.map((stage, idx) => {
            let badgeBg = '#eef2f6'
            let badgeColor = '#5e6475'
            let bulletColor = '#bdc7dd'
            let textWeight = 'normal'

            if (stage.state === 'done') {
              badgeBg = '#dcfce7'
              badgeColor = '#047857'
              bulletColor = '#0f9f6e'
            } else if (stage.state === 'pending') {
              badgeBg = '#fff4d6'
              badgeColor = '#a16207'
              bulletColor = '#d98a11'
              textWeight = 'bold'
            } else if (stage.state === 'rejected') {
              badgeBg = '#fee2e2'
              badgeColor = '#991b1b'
              bulletColor = '#c81e1e'
              textWeight = 'bold'
            }

            return (
              <div key={stage.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', background: badgeBg, color: badgeColor, padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: textWeight }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: bulletColor, marginRight: '6px' }} />
                  {stage.name}
                  {stage.state === 'pending' && <small style={{ marginLeft: '4px', fontSize: '9px', textTransform: 'uppercase' }}>(Pending)</small>}
                </span>
                {idx < stages.length - 1 && <span style={{ color: '#bdc7dd', fontSize: '12px' }}>➔</span>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Club President'

  return (
    <DashboardLayout
      sidebarTitle="Club Management"
      sidebarSubtitle="President Portal"
      navItems={clubNav}
      user={displayName}
      role={roleLabels[user?.role_id] || 'Club President'}
      action={{ label: 'New Proposal', icon: 'plus', to: '/proposal/new' }}
      topbarTitle="Club Dashboard"
    >
      {status.message && <Notice tone={status.tone}>{status.message}</Notice>}
      {status.loading && <Notice>Loading club dashboard data...</Notice>}

      <section className="welcome-panel">
        <h2>Welcome back, {user?.first_name || 'Coordinator'}!</h2>
        <p>Manage your club's proposals, track event approvals in real time, and monitor student registrations.</p>
      </section>

      <div className="metrics-grid">
        <MetricCard icon="activity" label="Pending Proposals" value={dashboard?.proposal_status?.pending || 0} note="Awaiting review" />
        <MetricCard icon="check" label="Approved Proposals" value={dashboard?.proposal_status?.approved || 0} note="Ready/Active" />
        <MetricCard icon="activity" label="Rejected Proposals" value={dashboard?.proposal_status?.rejected || 0} note="Revisions needed" />
        <MetricCard icon="users" label="Total Participants" value={dashboard?.student_registrations || 0} note="Enrolled in events" />
      </div>

      <div className="student-grid" style={{ gridTemplateColumns: '1fr' }}>
        <section className="panel">
          <div className="panel-heading">
            <h3>Recent Event Proposals</h3>
            <Button to="/proposal/new" icon="plus">Submit New</Button>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            {proposals.map((proposal) => (
              <div key={proposal.proposal_id} style={{ border: '1px solid var(--border-soft)', borderRadius: 'var(--radius)', padding: '20px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', color: 'var(--primary-strong)' }}>{proposal.title}</h4>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--muted)' }}>
                      Venue: <strong>{proposal.venue}</strong> | Category ID: <strong>{proposal.category_id}</strong>
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
                      Expected Participants: <strong>{Number(proposal.expected_participants) === 0 ? 'Open to All' : proposal.expected_participants}</strong>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StatusBadge tone={
                      proposal.status === 'Approved' ? 'success' :
                      proposal.status === 'Rejected' ? 'danger' : 'warning'
                    }>
                      {proposal.status}
                    </StatusBadge>
                    <small style={{ display: 'block', marginTop: '6px', color: 'var(--muted-2)' }}>
                      Submitted: {formatDateTime(proposal.created_at)}
                    </small>
                  </div>
                </div>
                {renderTimeline(proposal.status)}
                {proposal.status === 'Rejected' && proposal.rejection_reason && (
                  <div style={{ background: '#fee2e2', borderLeft: '4px solid var(--danger)', padding: '10px 14px', borderRadius: '4px', marginTop: '12px' }}>
                    <strong style={{ color: '#991b1b', fontSize: '13px', display: 'block' }}>Rejection Reason:</strong>
                    <span style={{ color: '#7f1d1d', fontSize: '13px' }}>{proposal.rejection_reason}</span>
                  </div>
                )}
              </div>
            ))}

            {!proposals.length && !status.loading && (
              <Notice tone="info">No event proposals submitted yet. Click "Submit New" to draft your first proposal.</Notice>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default ClubDashboard
