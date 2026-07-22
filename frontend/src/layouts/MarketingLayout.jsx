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
          <a href="#about">About</a>
        </nav>
        <div className="header-actions">
          <Button to="/login">Login</Button>
        </div>
      </header>
      {children}
      <footer className="marketing-footer">
        <div className="footer-inner" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <p>© {new Date().getFullYear()} Campus-Y. Smart College Event Management Platform. All Rights Reserved. | Developed by Yash Gupta</p>
        </div>
      </footer>
    </div>
  )
}

export default MarketingLayout
