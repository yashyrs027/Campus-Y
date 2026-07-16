import { useNavigate } from 'react-router-dom'
import Brand from '../components/Brand'
import Button from '../components/Button'

function PasswordResetSuccessPage() {
  const navigate = useNavigate()

  return (
    <main className="login-page">
      <div className="login-card" style={{ maxWidth: '440px', textAlign: 'center', alignItems: 'center' }}>
        <Brand />
        
        {/* Success Icon */}
        <div 
          style={{ 
            width: '72px', 
            height: '72px', 
            borderRadius: '50%', 
            background: '#dcfce7', 
            color: '#10b981', 
            display: 'grid', 
            placeItems: 'center', 
            fontSize: '36px',
            margin: '24px 0 12px'
          }}
        >
          ✓
        </div>

        <div>
          <h2>Password Reset Complete</h2>
          <p style={{ color: 'var(--muted)', marginTop: '8px', lineHeight: '1.6' }}>
            Your account password has been successfully updated. You can now safely sign in using your new credentials.
          </p>
        </div>

        <Button 
          className="wide" 
          onClick={() => navigate('/login', { replace: true })}
          icon="arrowRight"
          style={{ marginTop: '12px' }}
        >
          Back to Login
        </Button>
      </div>
    </main>
  )
}

export default PasswordResetSuccessPage
