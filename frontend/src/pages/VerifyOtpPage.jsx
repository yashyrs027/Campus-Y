import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand'
import Button from '../components/Button'
import Notice from '../components/Notice'
import { api } from '../lib/api'

function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timeLeft, setTimeLeft] = useState(60)
  const [status, setStatus] = useState({ loading: false, message: '', tone: 'info' })
  const inputRefs = useRef([])

  // Protect route: Redirect if email is not present in history state
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true })
    }
  }, [email, navigate])

  // Auto focus first input on mount
  useEffect(() => {
    if (email && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [email])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const handleChange = (index, value) => {
    // Only accept numeric inputs
    if (value && !/^\d+$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1) // Keep only the last character entered
    setOtp(newOtp)

    // Move focus to next input if digit entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (!/^\d{6}$/.test(pastedData)) return

    const newOtp = pastedData.split('')
    setOtp(newOtp)
    inputRefs.current[5].focus() // Focus the last input
  }

  const handleResend = async () => {
    if (timeLeft > 0) return
    setStatus({ loading: true, message: '', tone: 'info' })

    try {
      await api.forgotPassword(email)
      setTimeLeft(60)
      setOtp(['', '', '', '', '', ''])
      setStatus({ loading: false, message: 'A new 6-digit OTP code has been sent.', tone: 'success' })
      if (inputRefs.current[0]) inputRefs.current[0].focus()
    } catch (err) {
      setStatus({ loading: false, message: err.message || 'Failed to resend OTP.', tone: 'danger' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setStatus({ loading: false, message: 'Please enter all 6 verification digits.', tone: 'danger' })
      return
    }

    setStatus({ loading: true, message: '', tone: 'info' })

    try {
      const response = await api.verifyOtp(email, otpCode)
      setStatus({ loading: false, message: 'OTP verified successfully.', tone: 'success' })
      
      // Delay transition for visual success confirmation
      setTimeout(() => {
        navigate('/reset-password', { state: { email, token: response.token } })
      }, 1000)
    } catch (err) {
      setStatus({ loading: false, message: err.message || 'Invalid verification code.', tone: 'danger' })
    }
  }

  if (!email) return null

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <Brand />
        <div>
          <h2>Enter Verification Code</h2>
          <p>We sent a 6-digit verification code to <strong>{email}</strong>.</p>
        </div>

        {status.message && <Notice tone={status.tone}>{status.message}</Notice>}

        <div 
          style={{ 
            display: 'flex', 
            gap: '8px', 
            justifyContent: 'center', 
            margin: '12px 0 24px' 
          }}
          onPaste={handlePaste}
        >
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              pattern="\d*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              style={{
                width: '46px',
                height: '52px',
                textAlign: 'center',
                fontSize: '20px',
                fontWeight: '700',
                border: '1px solid #bdc7dd',
                borderRadius: 'var(--radius)',
                outline: 'none',
              }}
              required
              disabled={status.loading}
            />
          ))}
        </div>

        <Button className="wide" disabled={status.loading} icon="arrowRight" type="submit">
          {status.loading ? 'Verifying OTP...' : 'Verify Code'}
        </Button>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
          {timeLeft > 0 ? (
            <span style={{ color: 'var(--muted)' }}>
              Resend verification code in <strong>{timeLeft}s</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={status.loading}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: '700',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Resend verification code
            </button>
          )}
        </div>

        <p className="auth-link">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            disabled={status.loading}
          >
            Back to Email Form
          </button>
        </p>
      </form>
    </main>
  )
}

export default VerifyOtpPage
