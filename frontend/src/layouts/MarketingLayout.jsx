import Brand from '../components/Brand'
import Button from '../components/Button'

function MarketingLayout({ children }) {
  return (
    <div className="marketing-shell">
      <header className="marketing-header">
        <Brand />
        <nav aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#events">Events</a>
          <a href="#workflow">Workflow</a>
        </nav>
        <div className="header-actions">
          <Button to="/login" >Login</Button>
        </div>
      </header>
      {children}
    </div>
  )
}

export default MarketingLayout
