import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Icon from '../components/Icon'
import Notice from '../components/Notice'
import DashboardLayout from '../layouts/DashboardLayout'
import { studentNav, clubNav, adminNav, reviewerNav } from '../data/navigation'
import { api, formatDateTime, getStoredUser, roleLabels } from '../lib/api'

function ProposalPage() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])
  
  // Dynamic Navigation menu config
  const navConfig = useMemo(() => {
    if (!user) return { navItems: [], title: 'Campus-Y' }
    const roleId = Number(user.role_id)
    if (roleId === 1) {
      return { navItems: adminNav, title: 'Campus-Y' }
    } else if (roleId === 2 || roleId === 3) {
      return { navItems: reviewerNav, title: 'Campus-Y ' }
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

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    club_id: '',
    category_id: '',
    title: '',
    description: '',
    venue: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    registration_deadline: '',
    expected_participants: '',
    banner: '',
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
    const val = Number(form.expected_participants.trim())
    return form.venue.trim() !== '' &&
      form.start_date !== '' &&
      form.end_date !== '' &&
      form.start_time !== '' &&
      form.end_time !== '' &&
      form.registration_deadline !== '' &&
      form.expected_participants.trim() !== '' &&
      !isNaN(val) &&
      val > 0
  }

  const getEventStartDateTime = () => new Date(`${form.start_date}T${form.start_time}`)
  const getEventEndDateTime = () => new Date(`${form.end_date}T${form.end_time}`)

  const validateSchedule = () => {
    if (form.end_date < form.start_date) {
      return 'End date cannot be before start date.'
    }

    if (form.end_time <= form.start_time) {
      return 'End time must be after start time.'
    }

    const eventStart = getEventStartDateTime()
    const eventEnd = getEventEndDateTime()
    const registrationDeadline = new Date(form.registration_deadline)

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

  const handleNext = () => {
    if (step === 1 && !isStep1Valid()) {
      setStatus({ loading: false, message: 'Please fill in all Basic Information fields before continuing.', tone: 'danger' })
      return
    }
    if (step === 2) {
      if (!isStep2Valid()) {
        const val = Number(form.expected_participants.trim())
        const isNumValid = form.expected_participants.trim() !== '' && !isNaN(val) && val > 0
        if (!isNumValid) {
          setStatus({ loading: false, message: 'Expected participants must be a positive number.', tone: 'danger' })
        } else {
          setStatus({ loading: false, message: 'Please fill in all Event Details fields before continuing.', tone: 'danger' })
        }
        return
      }
    }
    
    if (step === 2) {
      const scheduleError = validateSchedule()
      if (scheduleError) {
        setStatus({ loading: false, message: scheduleError, tone: 'danger' })
        return
      }
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
    const parsedParticipants = Math.max(1, parseInt(form.expected_participants.trim(), 10) || 0)

    try {
      const scheduleError = validateSchedule()
      if (scheduleError) {
        setStatus({ loading: false, message: scheduleError, tone: 'danger' })
        return
      }

      await api.createProposal({
        ...form,
        club_id: Number(form.club_id),
        category_id: Number(form.category_id),
        expected_participants: parsedParticipants,
        registration_deadline: new Date(form.registration_deadline).toISOString(),
      })
      
      setForm({
        club_id: '',
        category_id: '',
        title: '',
        description: '',
        venue: '',
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        registration_deadline: '',
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

      <div style={{ width: '100%' }}>
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

              <div className="form-row">
                <label>
                  <span>Starting Time</span>
                  <input
                    name="start_time"
                    onChange={updateField}
                    required
                    type="time"
                    value={form.start_time}
                  />
                </label>
                <label>
                  <span>Ending Time</span>
                  <input
                    name="end_time"
                    onChange={updateField}
                    required
                    type="time"
                    value={form.end_time}
                  />
                </label>
                <small style={{ color: 'var(--muted)', marginTop: '-8px' }}>
                  End time must be later than start time (same rule as the database).
                </small>
              </div>

              <label>
                <span>Registration Deadline</span>
                <input
                  name="registration_deadline"
                  onChange={updateField}
                  required
                  type="datetime-local"
                  value={form.registration_deadline}
                />
                <small style={{ color: 'var(--muted)', marginTop: '-8px' }}>
                  Last date and time students can register for this event.
                </small>
              </label>

              <label>
                <span>Expected Participants</span>
                <input
                  name="expected_participants"
                  onChange={updateField}
                  placeholder="e.g. 150"
                  required
                  type="number"
                  min="1"
                  value={form.expected_participants}
                />
                <small style={{ color: 'var(--muted)', marginTop: '-8px' }}>
                  Enter the expected number of participants (positive number).
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
                    <td style={{ fontWeight: 'bold' }}>Time</td>
                    <td>{form.start_time} to {form.end_time}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Registration Deadline</td>
                    <td>{formatDateTime(form.registration_deadline)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Expected Participants</td>
                    <td>
                      {form.expected_participants}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Description</td>
                    <td style={{ whiteSpace: 'pre-wrap' }}>{form.description}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Event Banner / Poster</td>
                    <td>
                      {form.banner ? (
                        <span style={{ color: 'var(--success)', fontWeight: '600' }}>✓ Custom Poster Uploaded</span>
                      ) : (
                        <span style={{ color: 'var(--muted)', italic: 'true' }}>None (Default System Graphic will be used)</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Event Banner / Poster Upload Section (Optional) */}
              <div style={{ marginTop: '16px', padding: '20px', background: 'var(--surface-soft)', borderRadius: 'var(--radius)', border: '1px solid var(--border-soft)' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 6px 0', color: 'var(--text-strong)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="bookmark" /> Event Poster / Banner (Optional)
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 16px 0' }}>
                  Upload an official poster or banner image (PNG/JPG). If left empty, a stylized system default graphic will be generated automatically.
                </p>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    accept="image/*"
                    id="proposal-banner-input"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (!file) return
                      if (!file.type.startsWith('image/')) {
                        setStatus({ loading: false, message: 'Please select a valid image file (PNG/JPG).', tone: 'danger' })
                        return
                      }
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        setForm((current) => ({ ...current, banner: event.target.result }))
                      }
                      reader.readAsDataURL(file)
                    }}
                  />
                  
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => document.getElementById('proposal-banner-input')?.click()}
                  >
                    {form.banner ? 'Change Poster Image' : 'Upload Banner / Poster'}
                  </Button>

                  {form.banner && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setForm((current) => ({ ...current, banner: '' }))}
                      style={{ color: 'var(--danger)' }}
                    >
                      Remove Poster
                    </Button>
                  )}
                </div>

                {form.banner && (
                  <div style={{ marginTop: '16px', width: '100%', maxHeight: '200px', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border-soft)' }}>
                    <img src={form.banner} alt="Event Banner Preview" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

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
      </div>
    </DashboardLayout>
  )
}

export default ProposalPage
