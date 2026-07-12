import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Icon from '../components/Icon'
import Notice from '../components/Notice'
import SearchBar from '../components/SearchBar'
import StatusBadge from '../components/StatusBadge'
import DashboardLayout from '../layouts/DashboardLayout'
import { clubNav } from '../data/navigation'
import { api, formatDateTime, getStoredUser, roleLabels } from '../lib/api'

// Helper functions for date formatting to fit HTML inputs
const formatForDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  const pad = (num) => String(num).padStart(2, '0')
  const yyyy = date.getFullYear()
  const MM = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  return `${yyyy}-${MM}-${dd}`
}

const formatForDateTimeLocal = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  const pad = (num) => String(num).padStart(2, '0')
  const yyyy = date.getFullYear()
  const MM = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const hh = pad(date.getHours())
  const mm = pad(date.getMinutes())
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`
}

function TrackProposalsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useMemo(() => getStoredUser(), [])

  // Retrieve initial filter state if redirected from dashboard metric cards
  const preSelectedFilter = useMemo(() => {
    return location.state?.filter || 'All'
  }, [location.state])

  const [proposals, setProposals] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(preSelectedFilter)
  const [expandedProposalId, setExpandedProposalId] = useState(null)
  
  // Edit form states
  const [editingProposal, setEditingProposal] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '',
    venue: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    registration_deadline: '',
    expected_participants: '',
  })

  const [status, setStatus] = useState({ loading: true, message: '', tone: 'info' })
  const [editStatus, setEditStatus] = useState({ loading: false, message: '', tone: 'info' })

  const loadProposals = () => {
    setStatus({ loading: true, message: '', tone: 'info' })
    api.proposals()
      .then((data) => {
        setProposals(data)
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
    loadProposals()
  }, [navigate, user])

  // Update status filter if preSelectedFilter changes
  useEffect(() => {
    if (preSelectedFilter) {
      setStatusFilter(preSelectedFilter)
    }
  }, [preSelectedFilter])

  // Filtered proposals based on search query and status dropdown/buttons
  const filteredProposals = useMemo(() => {
    return proposals.filter((proposal) => {
      // 1. Search Query filter (matches Title or Venue)
      const matchesSearch =
        proposal.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.venue?.toLowerCase().includes(searchQuery.toLowerCase())

      // 2. Status filter mapping
      let matchesStatus = true
      if (statusFilter !== 'All') {
        const propStatus = proposal.status
        if (statusFilter === 'Pending') {
          // A proposal is pending if it's awaiting reviews
          matchesStatus = ['Under Faculty Review', 'Under HOD Review', 'Pending'].includes(propStatus)
        } else {
          matchesStatus = propStatus === statusFilter
        }
      }

      return matchesSearch && matchesStatus
    })
  }, [proposals, searchQuery, statusFilter])

  const toggleExpand = (proposalId) => {
    setExpandedProposalId((prev) => (prev === proposalId ? null : proposalId))
  }

  // Open edit modal & populate edit fields
  const handleOpenEdit = (e, proposal) => {
    e.stopPropagation() // Prevent row expansion when clicking edit
    setEditingProposal(proposal)
    setEditStatus({ loading: false, message: '', tone: 'info' })
    setEditForm({
      title: proposal.title || '',
      venue: proposal.venue || '',
      start_date: formatForDate(proposal.start_date),
      end_date: formatForDate(proposal.end_date),
      start_time: proposal.start_time ? proposal.start_time.substring(0, 5) : '',
      end_time: proposal.end_time ? proposal.end_time.substring(0, 5) : '',
      registration_deadline: formatForDateTimeLocal(proposal.registration_deadline),
      expected_participants: proposal.expected_participants || '',
    })
  }

  const handleCloseEdit = () => {
    setEditingProposal(null)
  }

  const handleEditChange = (e) => {
    setEditForm((current) => ({ ...current, [e.target.name]: e.target.value }))
  }

  const validateEditSchedule = () => {
    if (editForm.end_date < editForm.start_date) {
      return 'End date cannot be before start date.'
    }

    if (editForm.end_time <= editForm.start_time && editForm.start_date === editForm.end_date) {
      return 'End time must be after start time on the same day.'
    }

    const eventStart = new Date(`${editForm.start_date}T${editForm.start_time}`)
    const eventEnd = new Date(`${editForm.end_date}T${editForm.end_time}`)
    const registrationDeadline = new Date(editForm.registration_deadline)

    if (Number.isNaN(eventStart.getTime()) || Number.isNaN(eventEnd.getTime()) || Number.isNaN(registrationDeadline.getTime())) {
      return 'Please enter valid event dates, times, and registration deadline.'
    }

    if (eventEnd <= eventStart) {
      return 'Event end must be after event start.'
    }

    if (registrationDeadline.getTime() > eventStart.getTime()) {
      return 'Registration deadline must be on or before the event start time.'
    }

    return null
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditStatus({ loading: true, message: '', tone: 'info' })

    const scheduleError = validateEditSchedule()
    if (scheduleError) {
      setEditStatus({ loading: false, message: scheduleError, tone: 'danger' })
      return
    }

    try {
      const parsedParticipants = Math.max(1, parseInt(editForm.expected_participants, 10) || 0)

      await api.updateProposal(editingProposal.proposal_id, {
        title: editForm.title.trim(),
        venue: editForm.venue.trim(),
        start_date: editForm.start_date,
        end_date: editForm.end_date,
        start_time: editForm.start_time,
        end_time: editForm.end_time,
        registration_deadline: new Date(editForm.registration_deadline).toISOString(),
        expected_participants: parsedParticipants,
      })

      setEditingProposal(null)
      loadProposals() // reload list
    } catch (error) {
      setEditStatus({ loading: false, message: error.message, tone: 'danger' })
    }
  }

  const renderTimeline = (proposal) => {
    const proposalStatus = proposal.status
    const stages = [
      { name: 'Submitted', key: 'submit', state: 'done' },
      { name: 'Faculty Review', key: 'faculty', state: 'upcoming' },
      { name: 'HOD Review', key: 'hod', state: 'upcoming' },
      { name: 'Admin Verification', key: 'admin', state: 'upcoming' },
      { name: 'Published', key: 'publish', state: 'upcoming' },
    ]

    if (proposalStatus === 'Under Faculty Review') {
      stages[1].state = 'pending'
    } else if (proposalStatus === 'Under HOD Review') {
      stages[1].state = 'done'
      stages[2].state = 'pending'
    } else if (proposalStatus === 'Pending') {
      stages[1].state = 'done'
      stages[2].state = 'done'
      stages[3].state = 'pending'
    } else if (proposalStatus === 'Approved') {
      stages[1].state = 'done'
      stages[2].state = 'done'
      stages[3].state = 'done'
      stages[4].state = 'done'
    } else if (proposalStatus === 'Rejected') {
      const rejectedBy = Number(proposal.rejected_by_role)
      if (rejectedBy === 3) {
        stages[1].state = 'rejected'
      } else if (rejectedBy === 2) {
        stages[1].state = 'done'
        stages[2].state = 'rejected'
      } else if (rejectedBy === 1) {
        stages[1].state = 'done'
        stages[2].state = 'done'
        stages[3].state = 'rejected'
      } else {
        stages[1].state = 'rejected'
      }
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
      sidebarTitle="Campus-Y"
      navItems={clubNav}
      user={displayName}
      role={roleLabels[user?.role_id] || 'Club President'}
      topbarTitle="Track Proposals"
    >
      <section className="welcome-panel">
        <h2>Track Proposals</h2>
        <p>Monitor your submitted event proposals, view approval progression in real time, and edit details if currently awaiting faculty review.</p>
      </section>

      {status.message && <Notice tone={status.tone}>{status.message}</Notice>}

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: '1', minWidth: '280px', maxWidth: '400px' }}>
          <SearchBar
            placeholder="Search proposals by title or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Pending', 'Approved', 'Rejected'].map((opt) => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid var(--border-soft)',
                background: statusFilter === opt ? 'var(--primary)' : '#fff',
                color: statusFilter === opt ? '#fff' : 'var(--text)',
                cursor: 'pointer',
                fontWeight: statusFilter === opt ? '6px' : 'normal',
                transition: 'all 0.15s ease'
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {status.loading && <Notice>Loading proposals...</Notice>}

      {!status.loading && (
        <section className="panel">
          <div className="table-scroll">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }} />
                  <th>Proposal Title</th>
                  <th>Venue</th>
                  <th>Submitted On</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.map((proposal) => {
                  const isExpanded = expandedProposalId === proposal.proposal_id
                  const isEditable = proposal.status === 'Under Faculty Review'
                  
                  return (
                    <React.Fragment key={proposal.proposal_id}>
                      <tr 
                        onClick={() => toggleExpand(proposal.proposal_id)}
                        style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                        className="hover-row"
                      >
                        <td>
                          <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s ease' }}>
                            ▶
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--primary-strong)' }}>{proposal.title}</td>
                        <td>{proposal.venue}</td>
                        <td>{formatDateTime(proposal.created_at)}</td>
                        <td>
                          <StatusBadge tone={
                            proposal.status === 'Approved' ? 'success' :
                            proposal.status === 'Rejected' ? 'danger' : 'warning'
                          }>
                            {proposal.status}
                          </StatusBadge>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {isEditable && (
                              <Button 
                                onClick={(e) => handleOpenEdit(e, proposal)}
                                variant="secondary"
                                style={{ padding: '4px 10px', fontSize: '12px' }}
                              >
                                Edit
                              </Button>
                            )}
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '12px', border: '1px solid var(--border-soft)', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              {isExpanded ? 'Hide' : 'Track'}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="6" style={{ background: '#fcfdfe', padding: '20px 24px', borderTop: 'none' }}>
                            <div style={{ display: 'grid', gap: '14px' }}>
                              <p style={{ margin: 0, fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                                <strong>Description:</strong> {proposal.description || 'No description provided.'}
                              </p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 40px', fontSize: '14px' }}>
                                <span><strong>Scheduled Date:</strong> {formatForDate(proposal.start_date)} to {formatForDate(proposal.end_date)}</span>
                                <span><strong>Time:</strong> {proposal.start_time?.substring(0, 5)} - {proposal.end_time?.substring(0, 5)}</span>
                                <span><strong>Registration Deadline:</strong> {formatDateTime(proposal.registration_deadline)}</span>
                                <span><strong>Expected Capacity:</strong> {proposal.expected_participants}</span>
                              </div>
                              {renderTimeline(proposal)}
                              {proposal.status === 'Rejected' && proposal.rejection_reason && (
                                <div style={{ background: '#fee2e2', borderLeft: '4px solid var(--danger)', padding: '10px 14px', borderRadius: '4px', marginTop: '4px' }}>
                                  <strong style={{ color: '#991b1b', fontSize: '13px', display: 'block' }}>Rejection Reason:</strong>
                                  <span style={{ color: '#7f1d1d', fontSize: '13px' }}>{proposal.rejection_reason}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}

                {!filteredProposals.length && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                      <Notice tone="info">No proposals found matching your filter.</Notice>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* RESTRICTIVE EDIT MODAL */}
      {editingProposal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary-strong)' }}>Edit Event Proposal</h3>
              <button 
                onClick={handleCloseEdit}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--muted)' }}
              >
                &times;
              </button>
            </div>

            {editStatus.message && <Notice tone={editStatus.tone}>{editStatus.message}</Notice>}

            <form onSubmit={handleEditSubmit} className="proposal-form" style={{ display: 'grid', gap: '20px' }}>
              
              {/* RESTRICTION NOTICE */}
              <div style={{ background: '#f0f7ff', borderLeft: '4px solid var(--primary)', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', color: '#1e40af' }}>
                <strong>Note:</strong> You can only edit the Event Name, Schedule, Venue, and Registration Limits. Club origin, Category, and Description are locked.
              </div>

              <label>
                <span>Event Name / Title</span>
                <input
                  name="title"
                  required
                  value={editForm.title}
                  onChange={handleEditChange}
                />
              </label>

              <label>
                <span>Venue</span>
                <input
                  name="venue"
                  required
                  value={editForm.venue}
                  onChange={handleEditChange}
                />
              </label>

              <div className="form-row">
                <label>
                  <span>Start Date</span>
                  <input
                    name="start_date"
                    type="date"
                    required
                    value={editForm.start_date}
                    onChange={handleEditChange}
                  />
                </label>
                <label>
                  <span>End Date</span>
                  <input
                    name="end_date"
                    type="date"
                    required
                    value={editForm.end_date}
                    onChange={handleEditChange}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  <span>Start Time</span>
                  <input
                    name="start_time"
                    type="time"
                    required
                    value={editForm.start_time}
                    onChange={handleEditChange}
                  />
                </label>
                <label>
                  <span>End Time</span>
                  <input
                    name="end_time"
                    type="time"
                    required
                    value={editForm.end_time}
                    onChange={handleEditChange}
                  />
                </label>
              </div>

              <label>
                <span>Registration Deadline</span>
                <input
                  name="registration_deadline"
                  type="datetime-local"
                  required
                  value={editForm.registration_deadline}
                  onChange={handleEditChange}
                />
              </label>

              <label>
                <span>Expected Participants</span>
                <input
                  name="expected_participants"
                  type="number"
                  min="1"
                  required
                  value={editForm.expected_participants}
                  onChange={handleEditChange}
                />
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid var(--border-soft)', paddingTop: '16px' }}>
                <Button type="button" variant="secondary" onClick={handleCloseEdit}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editStatus.loading}>
                  {editStatus.loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default TrackProposalsPage
