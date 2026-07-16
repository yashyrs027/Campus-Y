import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand'
import Button from '../components/Button'
import Notice from '../components/Notice'
import Icon from '../components/Icon'
import { api } from '../lib/api'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email
  const token = location.state?.token

  const [form, setForm] = useState({
    password: '',
    confirm_password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState({ loading: false, message: '', tone: 'info' })
  const [errors, setErrors] = useState({ password: '', confirm_password: '' })

  // Route protection
  useEffect(() => {
    if (!email || !token) {
      navigate('/forgot-password', { replace: true })
    }
  }, [email, token, navigate])

  const updateField = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  // Live password complexity evaluations
  const pass = form.password
  const checks = {
    length: pass.length >= 8,
    upper: /[A-Z]/.test(pass),
    lower: /[a-z]/.test(pass),
    number: /[0-9]/.test(pass),
    special: /[@$!%*?&#]/.test(pass),
  }

  const strengthCount = Object.values(checks).filter(Boolean).length
  const getStrengthLabel = () => {
    if (!pass) return { text: '', color: 'transparent' }
    if (strengthCount <= 2) return { text: 'Weak', color: '#ef4444' }
    if (strengthCount <= 4) return { text: 'Medium', color: '#f59e0b' }
    return { text: 'Strong', color: '#10b981' }
  }
  const strength = getStrengthLabel()

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Run final validation check
    let passErr = ''
    let confErr = ''

    if (strengthCount < 5) {
      passErr = 'Password does not meet all complexity requirements.'
    }
    if (form.password !== form.confirm_password) {
      confErr = 'Passwords do not match.'
    }

    if (passErr || confErr) {
      setErrors({ password: passErr, confirm_password: confErr })
      return
    }

    setStatus({ loading: true, message: '', tone: 'info' })

    try {
      await api.resetPassword(token, form.password)
      setStatus({ loading: false, message: 'Password updated successfully.', tone: 'success' })

      setTimeout(() => {
        navigate('/reset-success', { replace: true })
      }, 1000)
    } catch (err) {
      setStatus({ loading: false, message: err.message || 'Failed to reset password.', tone: 'danger' })
    }
  }

  if (!email || !token) return null

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit} style={{ maxWidth: '480px' }}>
        <Brand />
        <div>
          <h2>Reset Your Password</h2>
          <p>Please define a strong and secure new password for <strong>{email}</strong>.</p>
        </div>

        {status.message && <Notice tone={status.tone}>{status.message}</Notice>}

        {/* New Password field */}
        <label style={{ position: 'relative' }}>
          <span style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>New Password</span>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {showPassword ? 'Hide Password' : 'Show Password'}
            </button>
          </span>
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={updateField}
            placeholder="New Secure Password"
            required
            disabled={status.loading}
            style={errors.password ? { borderColor: 'var(--danger)' } : {}}
          />
          {errors.password && <span style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{errors.password}</span>}
        </label>

        {/* Live Strength Indicators */}
        {pass && (
          <div style={{ marginTop: '-10px', display: 'grid', gap: '8px', fontSize: '13px' }}>
            {/* Strength label and progress bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--muted)' }}>Password Strength:</span>
              <strong style={{ color: strength.color }}>{strength.text}</strong>
            </div>
            <div style={{ background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  background: strength.color, 
                  height: '100%', 
                  width: `${(strengthCount / 5) * 100}%`,
                  transition: 'width 0.3s ease-in-out'
                }} 
              />
            </div>

            {/* Checklist */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: checks.length ? '#10b981' : 'var(--muted)' }}>
                <span>{checks.length ? '✅' : '⚪'}</span> At least 8 characters
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: checks.upper ? '#10b981' : 'var(--muted)' }}>
                <span>{checks.upper ? '✅' : '⚪'}</span> One uppercase letter
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: checks.lower ? '#10b981' : 'var(--muted)' }}>
                <span>{checks.lower ? '✅' : '⚪'}</span> One lowercase letter
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: checks.number ? '#10b981' : 'var(--muted)' }}>
                <span>{checks.number ? '✅' : '⚪'}</span> One numeric digit
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: checks.special ? '#10b981' : 'var(--muted)' }}>
                <span>{checks.special ? '✅' : '⚪'}</span> Special mark (@$!%*?&#)
              </div>
            </div>
          </div>
        )}

        {/* Confirm Password field */}
        <label>
          <span>Confirm Password</span>
          <input
            name="confirm_password"
            type="password"
            value={form.confirm_password}
            onChange={updateField}
            placeholder="Re-enter New Password"
            required
            disabled={status.loading}
            style={errors.confirm_password ? { borderColor: 'var(--danger)' } : {}}
          />
          {errors.confirm_password && <span style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{errors.confirm_password}</span>}
        </label>

        <Button className="wide" disabled={status.loading} icon="arrowRight" type="submit">
          {status.loading ? 'Updating Password...' : 'Reset Password'}
        </Button>

        <p className="auth-link">
          <button
            type="button"
            onClick={() => navigate('/login')}
            disabled={status.loading}
          >
            Cancel and Return
          </button>
        </p>
      </form>
    </main>
  )
}

export default ResetPasswordPage
