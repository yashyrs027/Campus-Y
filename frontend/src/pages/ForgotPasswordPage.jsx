import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Brand from '../components/Brand'
import Button from '../components/Button'
import Notice from '../components/Notice'
import { api } from '../lib/api'

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ loading: false, message: '', tone: 'info' })
  const [error, setError] = useState('')

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    setError('')
  }

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!value) {
      return 'Email address is required'
    }
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    setStatus({ loading: true, message: '', tone: 'info' })

    try {
      const response = await api.forgotPassword(email.trim())
      setStatus({
        loading: false,
        message: response.message || 'OTP sent successfully.',
        tone: 'success',
      })
      
      // Delay navigation slightly so user sees success notice
      setTimeout(() => {
        navigate('/verify-otp', { state: { email: email.trim() } })
      }, 1000)
    } catch (err) {
      setStatus({
        loading: false,
        message: err.message || 'An error occurred. Please try again.',
        tone: 'danger',
      })
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <Brand />
        <div>
          <h2>Forgot Password</h2>
          <p>Enter your registered email address to request a 6-digit verification code.</p>
        </div>

        {status.message && <Notice tone={status.tone}>{status.message}</Notice>}

        <label>
          <span>Email Address</span>
          <input
            name="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="name@university.edu"
            required
            disabled={status.loading}
            style={error ? { borderColor: 'var(--danger)' } : {}}
          />
          {error && <span style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{error}</span>}
        </label>

        <Button className="wide" disabled={status.loading} icon="arrowRight" type="submit">
          {status.loading ? 'Sending OTP...' : 'Send Verification OTP'}
        </Button>

        <p className="auth-link">
          <button
            type="button"
            onClick={() => navigate('/login')}
            disabled={status.loading}
          >
            Back to Sign In
          </button>
        </p>
      </form>
    </main>
  )
}

export default ForgotPasswordPage
