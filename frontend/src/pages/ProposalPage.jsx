import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Icon from '../components/Icon'
import Notice from '../components/Notice'
import DashboardLayout from '../layouts/DashboardLayout'
import { studentNav, clubNav, adminNav, reviewerNav } from '../data/navigation'
import { api, getStoredUser, roleLabels } from '../lib/api'

function ProposalPage() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])
  
  // Dynamic Navigation menu config
  const navConfig = useMemo(() => {
    if (!user) return { navItems: [], title: 'CampusPulse', subtitle: 'University Hub' }
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
      return { navItems: studentNav, title: 'CampusPulse', subtitle: 'University Hub' }
    }
  }, [user])

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    club_id: '',
    category_id: '',
    title: '',
    description: '',
    venue: '',
    start_date: '',
    end_date: '',
    expected_participants: '',
  })
  
  const [catalog, setCatalog] = useState({ clubs: [], event_categories: [] })
  const [status, setStatus] = useState({ loading: false, message: '', tone: 'info' })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    api.catalog()
      .then(setCatalog)
      .catch((error) => setStatus({ loading: false, message: error.message, tone: 'danger' }))
  }, [navigate, user])

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  // Step validation helpers
  const isStep1Valid = () => {
    return form.title.trim() !== '' &&
      form.description.trim() !== '' &&
      form.category_id !== '' &&
      form.club_id !== ''
  }

  const isStep2Valid = () => {
    return form.venue.trim() !== '' &&
      form.start_date !== '' &&
      form.end_date !== '' &&
      form.expected_participants.trim() !== ''
  }

  const handleNext = () => {
    if (step === 1 && !isStep1Valid()) {
      setStatus({ loading: false, message: 'Please fill in all Basic Information fields before continuing.', tone: 'danger' })
      return
    }
    if (step === 2 && !isStep2Valid()) {
      setStatus({ loading: false, message: 'Please fill in all Event Details fields before continuing.', tone: 'danger' })
      return
    }
    
    // Check end date is after start date
    if (step === 2 && new Date(form.end_date) < new Date(form.start_date)) {
      setStatus({ loading: false, message: 'End date cannot be earlier than start date.', tone: 'danger' })
      return
    }

    setStatus({ loading: false, message: '', tone: 'info' })
    setStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setStatus({ loading: false, message: '', tone: 'info' })
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const submit = async (event) => {
    event.preventDefault()
    setStatus({ loading: true, message: '', tone: 'info' })
    
    // Parse expected participants
    const rawVal = form.expected_participants.trim().toLowerCase()
    let parsedParticipants = 0
    if (rawVal !== 'open to all' && rawVal !== 'open' && rawVal !== 'all' && !isNaN(Number(rawVal))) {
      parsedParticipants = Math.max(0, parseInt(rawVal, 10))
    }

    try {
      await api.createProposal({
        ...form,
        club_id: Number(form.club_id),
        category_id: Number(form.category_id),
        expected_participants: parsedParticipants,
      })
      
      setForm({
        club_id: '',
        category_id: '',
        title: '',
        description: '',
        venue: '',
        start_date: '',
        end_date: '',
        expected_participants: '',
      })
      
      setStatus({ loading: false, message: 'Proposal submitted successfully.', tone: 'success' })
      setStep(4) // Move to success step
    } catch (error) {
      setStatus({ loading: false, message: error.message, tone: 'danger' })
    }
  }

  const getCategoryName = (id) => {
    const cat = catalog.event_categories.find((c) => Number(c.category_id) === Number(id))
    return cat ? cat.category_name : ''
  }

  const getClubName = (id) => {
    const club = catalog.clubs.find((c) => Number(c.club_id) === Number(id))
    return club ? club.club_name : ''
  }

  return (
    <DashboardLayout
      sidebarTitle={navConfig.title}
      sidebarSubtitle={navConfig.subtitle}
      navItems={navConfig.navItems}
      action={navConfig.action}
      user={user ? `${user.first_name} ${user.last_name}` : 'Club Coordinator'}
      role={roleLabels[user?.role_id] || 'Club President'}
    >
      <section className="proposal-heading">
        <div>
          <p>Dashboard / Event Proposals / New Proposal</p>
          <h2>Create Event Proposal</h2>
        </div>
      </section>

      {status.message && <Notice tone={status.tone}>{status.message}</Notice>}

      <section className="stepper">
        {['Basic Info', 'Details', 'Review', 'Submit'].map((stepName, index) => {
          let stepClass = ''
          if (index + 1 === step) stepClass = 'active'
          else if (index + 1 < step) stepClass = 'completed' // Custom class
          
          return (
            <span className={stepClass} key={stepName} style={{ opacity: index + 1 > step ? 0.6 : 1 }}>
              <b style={{
                background: index + 1 < step ? 'var(--success)' : index + 1 === step ? 'var(--primary)' : '#e7ecfb',
                color: index + 1 <= step ? '#fff' : 'var(--text)'
              }}>
                {index + 1 < step ? '✓' : index + 1}
              </b>
              {stepName}
            </span>
          )
        })}
      </section>

      <div className="proposal-grid">
        <div className="panel">
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="proposal-form" style={{ display: 'grid', gap: '24px' }}>
              <h3><Icon name="calendar" /> Step 1: Basic Information</h3>
              <label>
                <span>Event Title</span>
                <input
                  name="title"
                  onChange={updateField}
                  placeholder="e.g. Annual Tech Symposium 2026"
                  required
                  value={form.title}
                />
              </label>
              
              <div className="form-row">
                <label>
                  <span>Category</span>
                  <select name="category_id" onChange={updateField} required value={form.category_id}>
                    <option value="">Select category</option>
                    {catalog.event_categories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>{category.category_name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Club</span>
                  <select name="club_id" onChange={updateField} required value={form.club_id}>
                    <option value="">Select club</option>
                    {catalog.clubs.map((club) => (
                      <option key={club.club_id} value={club.club_id}>{club.club_name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                <span>Event Description</span>
                <textarea
                  name="description"
                  onChange={updateField}
                  placeholder="Briefly describe the purpose and goals of this event..."
                  required
                  value={form.description}
                />
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <Button type="submit">Next: Details <Icon name="arrowRight" /></Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="proposal-form" style={{ display: 'grid', gap: '24px' }}>
              <h3><Icon name="settings" /> Step 2: Event Details</h3>
              <label>
                <span>Venue</span>
                <input
                  name="venue"
                  onChange={updateField}
                  placeholder="Search campus locations or classrooms..."
                  required
                  value={form.venue}
                />
              </label>

              <div className="form-row">
                <label>
                  <span>Start Date</span>
                  <input
                    name="start_date"
                    onChange={updateField}
                    required
                    type="date"
                    value={form.start_date}
                  />
                </label>
                <label>
                  <span>End Date</span>
                  <input
                    name="end_date"
                    onChange={updateField}
                    required
                    type="date"
                    value={form.end_date}
                  />
                </label>
              </div>

              <label>
                <span>Expected Participants</span>
                <input
                  name="expected_participants"
                  onChange={updateField}
                  placeholder="e.g. 150 or Open to All"
                  required
                  type="text"
                  value={form.expected_participants}
                />
                <small style={{ color: 'var(--muted)', marginTop: '-8px' }}>
                  Enter a number (e.g. 100) or write <strong>Open to All</strong> for open participation.
                </small>
              </label>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <Button onClick={handleBack} variant="secondary"><Icon name="arrowRight" style={{ transform: 'rotate(180deg)' }} /> Back</Button>
                <Button type="submit">Next: Review <Icon name="arrowRight" /></Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="proposal-form" style={{ display: 'grid', gap: '24px' }}>
              <h3><Icon name="check" /> Step 3: Review Proposal</h3>
              <p style={{ color: 'var(--muted)' }}>Please review all details before submitting for approval.</p>
              
              <table style={{ border: 'none', width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%', borderTop: 'none' }}>Event Title</td>
                    <td style={{ borderTop: 'none' }}>{form.title}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Category</td>
                    <td>{getCategoryName(form.category_id)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Club</td>
                    <td>{getClubName(form.club_id)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Venue</td>
                    <td>{form.venue}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Dates</td>
                    <td>{form.start_date} to {form.end_date}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Expected Participants</td>
                    <td>
                      {['open to all', 'open', 'all'].includes(form.expected_participants.trim().toLowerCase()) || isNaN(Number(form.expected_participants.trim()))
                        ? 'Open to All'
                        : form.expected_participants}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Description</td>
                    <td style={{ whiteSpace: 'pre-wrap' }}>{form.description}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <Button onClick={handleBack} variant="secondary">Back</Button>
                <Button onClick={submit} disabled={status.loading}>
                  {status.loading ? 'Submitting...' : 'Submit Proposal'} <Icon name="check" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="proposal-form" style={{ display: 'grid', gap: '24px', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ display: 'inline-flex', alignSelf: 'center', background: '#dcfce7', color: '#0f9f6e', borderRadius: '50%', width: '80px', height: '80px', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 20px' }}>
                ✓
              </div>
              <h3>Proposal Submitted Successfully!</h3>
              <p style={{ color: 'var(--muted)', maxWidth: '480px', margin: '0 auto' }}>
                Your proposal has been entered into the approval queue. It will go through review by Faculty Coordinators and HOD approvals. You can check the current status in your Dashboard.
              </p>
              <div style={{ marginTop: '24px', display: 'flex', gap: '14px', justifyContent: 'center' }}>
                <Button to="/club">Go to Dashboard</Button>
                <Button variant="secondary" onClick={() => { setStep(1); setStatus({ loading: false, message: '', tone: 'info' }); }}>Create Another Proposal</Button>
              </div>
            </div>
          )}
        </div>

        <aside className="proposal-side">
          <section className="panel upload-panel">
            <h3><Icon name="upload" /> Event Banner</h3>
            <div>
              <Icon name="upload" />
              <strong>Drag and drop banner</strong>
              <span>JPG, PNG, or GIF up to 5MB</span>
            </div>
          </section>
          <section className="panel tip-panel">
            <h3>President's Tip</h3>
            <p>Proposals with a detailed budget and at least two weeks lead time have a higher approval rate.</p>
          </section>
        </aside>
      </div>
    </DashboardLayout>
  )
}

export default ProposalPage
