import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import MetricCard from '../components/MetricCard'
import Notice from '../components/Notice'
import StatusBadge from '../components/StatusBadge'
import DashboardLayout from '../layouts/DashboardLayout'
import { reviewerNav } from '../data/navigation'
import { api, formatDateTime, getStoredUser, roleLabels } from '../lib/api'

function ReviewDashboard() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])
  const [proposals, setProposals] = useState([])
  const [status, setStatus] = useState({ loading: true, message: '', tone: 'info' })

  const load = () => {
    api.proposals()
      .then((data) => {
        setProposals(data)
        setStatus({ loading: false, message: '', tone: 'info' })
      })
      .catch((error) => setStatus({ loading: false, message: error.message, tone: 'danger' }))
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    load()
  }, [navigate, user])

  const canReview = (proposal) => {
    const roleId = Number(user?.role_id)
    if (roleId === 1) return ['Pending', 'Under Faculty Review', 'Under HOD Review'].includes(proposal.status)
    if (roleId === 3) return ['Pending', 'Under Faculty Review'].includes(proposal.status)
    if (roleId === 2) return proposal.status === 'Under HOD Review'
    return false
  }

  const decide = async (proposal, decision) => {
    try {
      if (decision === 'approve') {
        await api.approveProposal(proposal.proposal_id)
      } else {
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

  const pending = proposals.filter((proposal) => canReview(proposal)).length
  const approved = proposals.filter((proposal) => proposal.status === 'Approved').length
  const rejected = proposals.filter((proposal) => proposal.status === 'Rejected').length

  return (
    <DashboardLayout
      navItems={reviewerNav}
      role={roleLabels[user?.role_id] || 'Reviewer'}
      sidebarSubtitle="Approval Workspace"
      sidebarTitle="Campus-Y Review"
      user={user ? `${user.first_name} ${user.last_name}` : 'Reviewer'}
    >
      {status.message && <Notice tone={status.tone}>{status.message}</Notice>}
      {status.loading && <Notice>Loading proposals from PostgreSQL...</Notice>}

      <section className="section-heading">
        <div>
          <h2>Proposal Review</h2>
          <p>Review the queue assigned to your approval level.</p>
        </div>
      </section>

      <section className="metrics-grid admin-metrics">
        <MetricCard icon="check" label="Awaiting Your Review" note="Action required" value={pending} />
        <MetricCard icon="calendar" label="Approved" note="Final approval" value={approved} />
        <MetricCard icon="activity" label="Rejected" note="Recorded decisions" value={rejected} />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h3>Proposal Queue</h3>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Venue</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => (
                <tr key={proposal.proposal_id}>
                  <td>{proposal.title}</td>
                  <td>{proposal.venue}</td>
                  <td>{formatDateTime(proposal.start_date)}</td>
                  <td>
                    <StatusBadge tone={proposal.status === 'Rejected' ? 'warning' : 'success'}>
                      {proposal.status}
                    </StatusBadge>
                  </td>
                  <td>
                    {canReview(proposal) ? (
                      <div className="table-actions">
                        <Button onClick={() => decide(proposal, 'approve')}>Approve</Button>
                        <Button onClick={() => decide(proposal, 'reject')} variant="secondary">Reject</Button>
                      </div>
                    ) : 'No action'}
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
        </div>
      </section>
    </DashboardLayout>
  )
}

export default ReviewDashboard
