import Button from '../components/Button'
import EventCard from '../components/EventCard'
import Icon from '../components/Icon'
import MarketingLayout from '../layouts/MarketingLayout'
import { events } from '../data/events'

function LandingPage() {
  return (
    <MarketingLayout>
      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">Next-gen campus management</span>
            <h1>Manage College Events Smarter.</h1>
            <p>Plan, approve, publish, and participate in college events from one centralized platform.</p>
            <div className="hero-actions">
              <Button to="/events">Explore Events</Button>
              <Button to="/login" variant="secondary">Get Started</Button>
            </div>
          </div>
          <div className="hero-visual" aria-label="Campus-Y dashboard preview">
          
          </div>
        </section>

        <section className="stats-strip" aria-label="Campus-Y statistics">
          <strong>150+<span>Faculties</span></strong>
          <strong>2000+<span>Events</span></strong>
          <strong>50K+<span>Students</span></strong>
          <strong>95%<span>Satisfaction</span></strong>
        </section>

        <section className="landing-section" id="events">
          <div className="center-heading">
            <h2>Trending Events</h2>
            <p>Discover high-interest activities happening across campus today.</p>
          </div>
          <div className="event-grid compact">
            {events.slice(0, 3).map((event) => (
              <EventCard key={event.title} event={event} />
            ))}
          </div>
        </section>

        <section className="landing-section soft" id="features">
          <div className="center-heading">
            <h2>Powerful Features for Modern Campuses</h2>
            <p>Everything needed to streamline event logistics and participation.</p>
          </div>
          <div className="feature-grid">
            {[
              ['calendar', 'Event Management', 'Create, manage, and schedule diverse campus activities.'],
              ['check', 'Approval Workflow', 'Multi-level review keeps every event compliant.'],
              ['users', 'Instant Registration', 'One-click registration with automated waitlist management.']
             
            ].map(([icon, title, text]) => (
              <article className="feature-card" key={title}>
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
            <p>Four clear steps to take events from idea to registration.</p>
          </div>
          <div className="workflow-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            {['Create Proposal', 'Faculty Approval', 'HOD Approval', 'Admin Approval', 'Publish Event', 'Registration'].map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
        </section>
      </main>
    </MarketingLayout>
  )
}

export default LandingPage
