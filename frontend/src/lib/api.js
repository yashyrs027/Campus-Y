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
  profileStats: () => request('/api/auth/profile/stats'),
  updateProfile: (body) => request('/api/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body) => request('/api/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  forgotPassword: (email) => request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyOtp: (email, otp) => request('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  resetPassword: (token, password) => request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  catalog: () => request('/api/catalog'),
  events: () => request('/api/events'),
  event: (id) => request(`/api/events/${id}`),
  registerForEvent: (eventId) => request(`/api/events/${eventId}/register`, { method: 'POST' }),
  myRegistrations: () => request('/api/registrations/my'),
  adminDashboard: () => request('/api/dashboard/admin'),
  studentDashboard: () => request('/api/dashboard/student'),
  clubDashboard: () => request('/api/dashboard/club'),
  proposals: () => request('/api/proposals'),
  proposal: (id) => request(`/api/proposals/${id}`),
  createProposal: (body) => request('/api/proposals', { method: 'POST', body: JSON.stringify(body) }),
  updateProposal: (id, body) => request(`/api/proposals/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  approveProposal: (id) => request(`/api/proposals/${id}/approve`, { method: 'PUT' }),
  rejectProposal: (id, rejection_reason) =>
    request(`/api/proposals/${id}/reject`, { method: 'PUT', body: JSON.stringify({ rejection_reason }) }),
  users: () => request('/api/users'),
  assignRole: (body) => request('/api/users/assign-role', { method: 'PUT', body: JSON.stringify(body) }),
  clubs: () => request('/api/clubs'),
  createClub: (body) => request('/api/clubs', { method: 'POST', body: JSON.stringify(body) }),
  updateClub: (id, body) => request(`/api/clubs/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  registrationReportEvents: () => request('/api/reports/events'),
  eventRegistrationReport: (eventId) => request(`/api/reports/events/${eventId}/registrations`),
}

export function formatDateTime(value) {
  if (!value) return 'Not scheduled'
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function getEventComputedStatus(startDatetime, endDatetime, now = new Date()) {
  const start = new Date(startDatetime)
  const end = new Date(endDatetime)

  if (now >= start && now <= end) return 'Ongoing'
  if (now > end) return 'Completed'
  return 'Upcoming'
}

export function isRegistrationClosed(event, now = new Date()) {
  if (event.computedStatus === 'Completed') return true

  if (event.registration_deadline) {
    return new Date(event.registration_deadline).getTime() < now.getTime()
  }

  return false
}

const SAVED_EVENTS_PREFIX = 'campus_y_saved_events'

export function getSavedEventsStorageKey(userId) {
  return `${SAVED_EVENTS_PREFIX}_${userId}`
}

export function getSavedEventIds(userId) {
  if (!userId) return []

  const userKey = getSavedEventsStorageKey(userId)
  const raw = localStorage.getItem(userKey)
  if (raw) {
    return JSON.parse(raw)
  }

  const legacyRaw = localStorage.getItem(SAVED_EVENTS_PREFIX)
  if (legacyRaw) {
    const legacyIds = JSON.parse(legacyRaw)
    localStorage.setItem(userKey, legacyRaw)
    localStorage.removeItem(SAVED_EVENTS_PREFIX)
    return legacyIds
  }

  return []
}

export function setSavedEventIds(userId, ids) {
  if (!userId) return
  localStorage.setItem(getSavedEventsStorageKey(userId), JSON.stringify(ids))
}

export function normalizeRegistration(registration) {
  const eventStatus = getEventComputedStatus(
    registration.start_datetime,
    registration.end_datetime
  )

  return {
    ...registration,
    eventStatus,
  }
}

export function sortEventsForDisplay(events) {
  const statusOrder = { Ongoing: 0, Upcoming: 1, Completed: 2 }

  return [...events].sort((a, b) => {
    const statusDiff = (statusOrder[a.computedStatus] ?? 1) - (statusOrder[b.computedStatus] ?? 1)
    if (statusDiff !== 0) return statusDiff

    if (a.computedStatus === 'Completed') {
      return new Date(b.end_datetime || b.start_datetime) - new Date(a.end_datetime || a.start_datetime)
    }

    return new Date(a.start_datetime) - new Date(b.start_datetime)
  })
}

export function normalizeEvent(event) {
  const registered = Number(event.registered || 0)
  const capacity = Number(event.capacity || 0)
  const seats = capacity > 0 ? Math.max(capacity - registered, 0) : 0

  const now = new Date()
  const computedStatus = getEventComputedStatus(event.start_datetime, event.end_datetime, now)
  const registrationClosed = isRegistrationClosed(
    { ...event, computedStatus },
    now
  )

  return {
    ...event,
    category: event.category_name || event.category || `Category ${event.category_id || 'General'}`,
    club: event.club_name || event.club || `Organizer #${event.created_by || 'Campus-Y'}`,
    date: formatDateTime(event.start_datetime),
    registrationDeadline: formatDateTime(event.registration_deadline),
    computedStatus,
    registrationClosed,
    seats,
    tone: ['music', 'sports', 'career', 'arts', 'leadership'][Number(event.event_id || 0) % 5],
  }
}
