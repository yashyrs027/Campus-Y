import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Brand from '../components/Brand'
import Button from '../components/Button'
import Icon from '../components/Icon'
import Notice from '../components/Notice'
import { api, dashboardPathForRole, saveSession } from '../lib/api'

const roleOptions = [
  ['Student', 6],
  ['Club Pres.', 4],
  ['Faculty', 3],
  ['HOD', 2],
  ['Admin', 1],
]

function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [selectedRole, setSelectedRole] = useState(6)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    department_id: '',
    phone: '',
    gender: '',
  })
  const [departments, setDepartments] = useState([])
  const [status, setStatus] = useState({ loading: false, message: '', tone: 'info' })

  useEffect(() => {
    api.catalog()
      .then((catalog) => setDepartments(catalog.departments))
      .catch(() => setDepartments([]))
  }, [])

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setStatus({ loading: true, message: '', tone: 'info' })

    try {
      if (mode === 'register') {
        await api.register({
          ...form,
          department_id: Number(form.department_id),
          role_id: selectedRole,
        })
      }

      const session = await api.login({ email: form.email, password: form.password })

      if (mode === 'login' && Number(session.user.role_id) !== selectedRole) {
        throw new Error(`This account belongs to the ${roleOptions.find(([, id]) => id === Number(session.user.role_id))?.[0] || 'selected'} role.`)
      }

      saveSession(session)
      navigate(dashboardPathForRole(session.user.role_id))
    } catch (error) {
      setStatus({ loading: false, message: error.message, tone: 'danger' })
    }
  }

  return (
    <main className="login-page">
      <section className="login-art">
        <div className="campus-illustration">
          <span />
          <span />
          <span />
        </div>
        <h1>The pulse of <strong>Campus Life.</strong></h1>
        <p>Join the most active student ecosystem to discover clubs, manage schedules, and coordinate with faculty.</p>
      </section>

      <form className="login-card" onSubmit={submit}>
        <Brand />
        <div>
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{mode === 'login' ? 'Log in to your account to continue' : 'Register with the role approved by your college'}</p>
        </div>
        {mode === 'login' ? (
          <div className="role-grid">
            {roleOptions.map(([role, id]) => (
              <button
                className={selectedRole === id ? 'selected' : ''}
                key={role}
                onClick={() => setSelectedRole(id)}
                type="button"
              >
                {role}
              </button>
            ))}
          </div>
        ) : (
          <Notice>New accounts are created as students. An administrator can assign staff roles later.</Notice>
        )}
        {status.message && <Notice tone={status.tone}>{status.message}</Notice>}
        {mode === 'register' && (
          <>
            <div className="form-row">
              <label>
                <span>First Name</span>
                <input name="first_name" onChange={updateField} placeholder="Alex" required value={form.first_name} />
              </label>
              <label>
                <span>Last Name</span>
                <input name="last_name" onChange={updateField} placeholder="Rivera" required value={form.last_name} />
              </label>
            </div>
            <label>
              <span>Department</span>
              <select name="department_id" onChange={updateField} required value={form.department_id}>
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department.department_id} value={department.department_id}>
                    {department.department_name} ({department.department_code})
                  </option>
                ))}
              </select>
            </label>
            <div className="form-row">
              <label>
                <span>Gender</span>
                <select name="gender" onChange={updateField} required value={form.gender}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label>
                <span>Phone</span>
                <input name="phone" onChange={updateField} placeholder="Optional phone number" value={form.phone} />
              </label>
            </div>
          </>
        )}
        <label>
          <span>Email Address</span>
          <input name="email" onChange={updateField} placeholder="name@university.edu" required type="email" value={form.email} />
        </label>
        <label>
          <span>Password</span>
          <input minLength="8" name="password" onChange={updateField} placeholder="Password" required type="password" value={form.password} />
        </label>
        <label className="remember-row">
          <input type="checkbox" />
          Remember this device
        </label>
        <Button className="wide" disabled={status.loading} icon="arrowRight" type="submit">
          {status.loading ? 'Working...' : mode === 'login' ? 'Sign In to Campus-Y' : 'Create and Sign In'}
        </Button>
        <button className="google-button" type="button">
          <Icon name="building" />
          Continue with Google
        </button>
        <p className="auth-link">
          {mode === 'login' ? 'Do not have an account?' : 'Already registered?'}{' '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setSelectedRole(6)
            }}
            type="button"
          >
            {mode === 'login' ? 'Create Account' : 'Sign In'}
          </button>
        </p>
      </form>
    </main>
  )
}

export default LoginPage
