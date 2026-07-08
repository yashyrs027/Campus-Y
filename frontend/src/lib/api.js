const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const TOKEN_KEY = 'campus_y_token'
const USER_KEY = 'campus_y_user'

export const roleLabels = {
  1: 'Admin',
  2: 'HOD',
  3: 'Faculty',
  4: 'Club Coordinator',
  5: 'Vice President',
  6: 'Student',
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function saveSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function dashboardPathForRole(roleId) {
  if (Number(roleId) === 1) return '/admin'
  if (Number(roleId) === 2 || Number(roleId) === 3) return '/review'
  if (Number(roleId) === 4 || Number(roleId) === 5) return '/club'
  return '/student'
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok || payload.success === false) {
    const message = payload.message || payload.errors?.[0]?.msg || 'Request failed'
    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload.data ?? payload
}

export const api = {
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/auth/me'),
  profile: () => request('/api/auth/profile'),
  updateProfile: (body) => request('/api/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body) => request('/api/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  catalog: () => request('/api/catalog'),
  events: () => request('/api/events'),
  registerForEvent: (eventId) => request(`/api/events/${eventId}/register`, { method: 'POST' }),
  myRegistrations: () => request('/api/registrations/my'),
  adminDashboard: () => request('/api/dashboard/admin'),
  studentDashboard: () => request('/api/dashboard/student'),
  clubDashboard: () => request('/api/dashboard/club'),
  proposals: () => request('/api/proposals'),
  createProposal: (body) => request('/api/proposals', { method: 'POST', body: JSON.stringify(body) }),
  approveProposal: (id) => request(`/api/proposals/${id}/approve`, { method: 'PUT' }),
  rejectProposal: (id, rejection_reason) =>
    request(`/api/proposals/${id}/reject`, { method: 'PUT', body: JSON.stringify({ rejection_reason }) }),
  users: () => request('/api/users'),
  assignRole: (body) => request('/api/users/assign-role', { method: 'PUT', body: JSON.stringify(body) }),
  clubs: () => request('/api/clubs'),
  createClub: (body) => request('/api/clubs', { method: 'POST', body: JSON.stringify(body) }),
  updateClub: (id, body) => request(`/api/clubs/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
}

export function formatDateTime(value) {
  if (!value) return 'Not scheduled'
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function normalizeEvent(event) {
  const registered = Number(event.registered || 0)
  const capacity = Number(event.capacity || 0)
  const seats = capacity > 0 ? Math.max(capacity - registered, 0) : 0

  const now = new Date()
  const start = new Date(event.start_datetime)
  const end = new Date(event.end_datetime)
  let computedStatus = 'Upcoming'
  if (now >= start && now <= end) {
    computedStatus = 'Ongoing'
  } else if (now > end) {
    computedStatus = 'Completed'
  }

  return {
    ...event,
    category: event.category_name || event.category || `Category ${event.category_id || 'General'}`,
    club: event.club_name || event.club || `Organizer #${event.created_by || 'Campus-Y'}`,
    date: formatDateTime(event.start_datetime),
    computedStatus,
    seats,
    tone: ['music', 'sports', 'career', 'arts', 'leadership'][Number(event.event_id || 0) % 5],
  }
}
