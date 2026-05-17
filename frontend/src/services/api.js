import axios from 'axios'
import { API_BASE_URL } from '../utils/constants'
import { tokenStore } from './tokenStore'

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  // Required so the browser sends httpOnly cookies (refresh token) on cross-origin requests
  withCredentials: true,
})

// Attach the current access token to every request
http.interceptors.request.use((config) => {
  const token = tokenStore.getAdminToken() || tokenStore.getAuthToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Track whether a token refresh is already in flight to avoid loops
let isRefreshing = false
let pendingQueue = []

const processQueue = (error, token = null) => {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  pendingQueue = []
}

// On 401: silently refresh the access token via httpOnly cookie, then retry
http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config

    // Only attempt refresh once per request, and not on the refresh endpoint itself
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Another refresh is already in flight — queue this request
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`
            return http(original)
          })
          .catch((e) => Promise.reject(e))
      }

      original._retry = true
      isRefreshing = true

      const isAdmin = !!tokenStore.getAdminToken()
      const refreshUrl = isAdmin ? '/admin/auth/refresh' : '/auth/refresh'

      try {
        // The httpOnly refresh-token cookie is sent automatically by the browser
        const { data } = await http.post(refreshUrl)
        const newAccessToken = data.accessToken

        isAdmin ? tokenStore.setAdminToken(newAccessToken) : tokenStore.setAuthToken(newAccessToken)
        http.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
        processQueue(null, newAccessToken)

        original.headers.Authorization = `Bearer ${newAccessToken}`
        return http(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        _handleLogout(isAdmin)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  }
)

function _handleLogout(isAdmin) {
  if (isAdmin) {
    tokenStore.clearAdminToken()
    localStorage.removeItem('admin_user')
    window.location.href = '/admin/login'
  } else {
    tokenStore.clearAuthToken()
    localStorage.removeItem('user')
    window.location.href = '/login'
  }
}

export const authApi = {
  login: (data) => http.post('/auth/login', data),
  register: (data) => http.post('/auth/register', data),
  // Cookie is sent automatically; no body needed
  logout: () => http.post('/auth/logout'),
  refresh: () => http.post('/auth/refresh'),
  adminLogin: (data) => http.post('/admin/auth/login', data),
  adminLogout: () => http.post('/admin/auth/logout'),
  adminRefresh: () => http.post('/admin/auth/refresh'),
  validateToken: () => http.get('/admin/auth/validate'),
}

export const usersApi = {
  list: () => http.get('/users'),
  getById: (id) => http.get(`/users/${id}`),
  getByEmail: (email) => http.get(`/users/email/${email}`),
  getUnapproved: () => http.get('/users/unapproved'),
  update: (id, data) => http.put(`/users/${id}`, data),
  approve: (id) => http.put(`/users/${id}/approve`),
  delete: (id) => http.delete(`/users/${id}`),
}

export const projectsApi = {
  list: (params) => http.get('/projects', { params }),
  getById: (id) => http.get(`/projects/${id}`),
  getByStatus: (status) => http.get(`/projects/status/${status}`),
  getByWard: (ward) => http.get(`/projects/ward/${ward}`),
  getByCreator: (userId) => http.get(`/projects/creator/${userId}`),
  getTopImpact: () => http.get('/projects/top-impact'),
  create: (data) => http.post('/projects', data),
  update: (id, data) => http.put(`/projects/${id}`, data),
  delete: (id) => http.delete(`/projects/${id}`),
}

export const donationsApi = {
  list: (params) => http.get('/donations', { params }),
  getById: (id) => http.get(`/donations/${id}`),
  getByStatus: (status) => http.get(`/donations/status/${status}`),
  getByProject: (projectId) => http.get(`/donations/project/${projectId}`),
  getProjectTotal: (projectId) => http.get(`/donations/project/${projectId}/total`),
  create: (data) => http.post('/donations', data),
  update: (id, data) => http.put(`/donations/${id}`, data),
  delete: (id) => http.delete(`/donations/${id}`),
}

export const eventsApi = {
  list: (params) => http.get('/events', { params }),
  getById: (id) => http.get(`/events/${id}`),
  getUpcoming: () => http.get('/events/upcoming'),
  getByStatus: (status) => http.get(`/events/status/${status}`),
  getByProject: (projectId) => http.get(`/events/project/${projectId}`),
  registerVolunteer: (eventId, volunteerId) => http.post(`/events/${eventId}/register/${volunteerId}`),
  create: (data) => http.post('/events', data),
  update: (id, data) => http.put(`/events/${id}`, data),
  delete: (id) => http.delete(`/events/${id}`),
}

export const volunteersApi = {
  list: (params) => http.get('/volunteers', { params }),
  getById: (id) => http.get(`/volunteers/${id}`),
  getByStatus: (status) => http.get(`/volunteers/status/${status}`),
  getByWard: (ward) => http.get(`/volunteers/ward/${ward}`),
  getByInterest: (interest) => http.get(`/volunteers/interest/${interest}`),
  register: (data) => http.post('/volunteers', data),
  update: (id, data) => http.put(`/volunteers/${id}`, data),
  delete: (id) => http.delete(`/volunteers/${id}`),
}

export const contentApi = {
  getByKey: (key) => http.get(`/admin/content/${key}`),
  getByPage: (pageName) => http.get(`/admin/content/page/${pageName}`),
  getPageMap: (pageName) => http.get(`/admin/content/page-map/${pageName}`),
  getRecent: (limit = 10) => http.get(`/admin/content/recent/updates?limit=${limit}`),
  update: (data) => http.post('/admin/content/update', data),
  batchUpdate: (data) => http.post('/admin/content/batch-update', data),
  delete: (key) => http.delete(`/admin/content/${key}`),
}

export const imagesApi = {
  upload: (formData) => http.post('/admin/images/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getByKey: (key) => http.get(`/admin/images/${key}`),
  getByPage: (pageName) => http.get(`/admin/images/page/${pageName}`),
  getRecent: (limit = 10) => http.get(`/admin/images/recent/uploads?limit=${limit}`),
  getStorageStats: () => http.get('/admin/images/stats/storage'),
  updateMetadata: (key, data) => http.patch(`/admin/images/${key}`, data),
  delete: (key) => http.delete(`/admin/images/${key}`),
}

export default http
