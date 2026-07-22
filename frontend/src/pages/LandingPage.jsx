import { useEffect } from 'react'
import Button from '../components/Button'
import EventCard from '../components/EventCard'
import Icon from '../components/Icon'
import MarketingLayout from '../layouts/MarketingLayout'
import { events } from '../data/events'

const STATS = [
  { icon: 'users',     value: '10K+', label: 'Students Enrolled' },
  { icon: 'calendar',  value: '200+', label: 'Events Hosted' },
  { icon: 'building',  value: '100+', label: 'Faculty Members' },
  { icon: 'award',     value: '95%',  label: 'Satisfaction Rate' },
]

const FEATURES = [
  ['calendar', 'Event Management', 'Create, manage, and schedule diverse campus activities.'],
  ['check', 'Approval Workflow', 'Multi-level review keeps every event compliant.'],
  ['users', 'Instant Registration', 'One-click registration with automated waitlist management.'],
  ['bell', 'Smart Notifications', 'Stay updated with real-time alerts for events and approvals.'],
  ['bar-chart', 'Analytics Dashboard', 'Track participation, club performance, and event trends.'],
  ['award', 'Certificates', 'Auto-generate and distribute participation certificates.'],
]

const WORKFLOW_STEPS = [
  'Create Proposal',
  'Faculty Approval',
  'HOD Approval',
  'Admin Approval',
  'Publish Event',
  'Registration',
]

function LandingPage() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.15 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <MarketingLayout>
      <main>
        <section className="hero-section" id="hero">
          <div className="hero-copy">
            <span className="eyebrow">Next-gen campus management</span>
            <h1>Manage College Events Smarter.</h1>
            <p>Plan, approve, publish, and participate in college events from one centralized platform.</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#events">Explore Events</a>
              <Button to="/login" variant="secondary">Get Started</Button>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hv-card">
              <div className="hv-topbar">
                <span /><span /><span />
              </div>
              <div className="hv-stats">
                <div className="hv-stat"><strong>128</strong><small>Events Live</small></div>
                <div className="hv-stat"><strong>4.2K</strong><small>Registered</small></div>
                <div className="hv-stat"><strong>98%</strong><small>Approved</small></div>
              </div>
              <div className="hv-bars">
                <span style={{ '--h': '55%' }} />
                <span style={{ '--h': '80%' }} />
                <span style={{ '--h': '40%' }} />
                <span style={{ '--h': '90%' }} />
                <span style={{ '--h': '65%' }} />
                <span style={{ '--h': '75%' }} />
              </div>
              <div className="hv-rows">
                <div className="hv-row"><span className="hv-dot green" />Annual Hackathon 2026<em>Approved</em></div>
                <div className="hv-row"><span className="hv-dot blue" />Autumn Jazz Night<em>Live</em></div>
                <div className="hv-row"><span className="hv-dot yellow" />Leadership Summit<em>Pending</em></div>
              </div>
            </div>
            <div className="hv-badge">
              <Icon name="check" />
              <span>Event Published!</span>
            </div>
          </div>
        </section>

        <section className="stats-strip" aria-label="Campus-Y statistics">
          {STATS.map(({ icon, value, label }, i) => (
            <div key={label} className={`stat-item reveal reveal-delay-${i + 1}`}>
              <span className="stat-icon"><Icon name={icon} /></span>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section className="landing-section" id="events">
          <div className="center-heading">
            <h2>Trending Events</h2>
            <p>Discover high-interest activities happening across campus today.</p>
          </div>
          <div className="event-grid compact">
            {events.slice(0, 3).map((event, i) => (
              <div key={event.title} className={`reveal reveal-delay-${i + 1}`}>
                <EventCard event={event} />
              </div>
            ))}
          </div>
          <div className="center-heading" style={{ marginTop: '2rem' }}>
            <Button to="/login" variant="secondary">View All Events</Button>
          </div>
        </section>

        <section className="landing-section soft" id="features">
          <div className="center-heading">
            <h2>Powerful Features for Modern Campuses</h2>
            <p>Everything needed to streamline event logistics and participation.</p>
          </div>
          <div className="feature-grid">
            {FEATURES.map(([icon, title, text], i) => (
              <article className={`feature-card reveal reveal-delay-${i + 1}`} key={title}>
                <Icon name={icon} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section" id="workflow">
          <div className="center-heading">
            <h2>Seamless Experience for Everyone</h2>
            <p>Six steps to take events from idea to registration.</p>
          </div>
          <div className="workflow-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            {WORKFLOW_STEPS.map((step, i) => (
              <span key={step} className={`reveal reveal-delay-${i + 1}`}><em>{i + 1}</em>{step}</span>
            ))}
          </div>
        </section>

        <section className="landing-section about-section" id="about">
          <div className="about-grid">
            <div className="about-left reveal">
              <span className="eyebrow">About Campus-Y</span>
              <h2>Built for Every Student, Club &amp; Faculty</h2>
              <p>Campus-Y was created to eliminate the chaos of scattered WhatsApp groups, notice boards, and email chains. We bring every stakeholder — students, clubs, faculty, HODs, and admins — into one seamless digital ecosystem.</p>
              <p>From proposal to certificate, every step of the event lifecycle is tracked, approved, and celebrated on one platform.</p>
              <div className="hero-actions" style={{ marginTop: '28px' }}>
                <Button to="/login">Join Campus-Y</Button>
                <a className="btn btn-secondary" href="#features">See Features</a>
              </div>
            </div>
            <div className="about-right">
              {[
                ['building', 'For Students',     'Browse, register, and track events. Download certificates and never miss a campus activity.'],
                ['users',    'For Clubs',         'Create proposals, manage members, and run events end-to-end with full visibility.'],
                ['check',    'For Faculty & HOD', 'Review and approve proposals in one click. Monitor budgets and event compliance.'],
                ['settings', 'For Admins',        'Full platform control — manage users, clubs, workflows, and generate reports.'],
              ].map(([icon, title, text], i) => (
                <div className={`about-card reveal reveal-delay-${i + 1}`} key={title}>
                  <span className="about-icon"><Icon name={icon} /></span>
                  <div>
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </MarketingLayout>
  )
}

export default LandingPage
