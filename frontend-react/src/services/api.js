import axios from 'axios'
import { API_BASE_URL } from '../utils/constants'

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const authApi = {
  login: (data) => http.post('/auth/login', data),
  register: (data) => http.post('/auth/register', data),
  adminLogin: (data) => http.post('/admin/auth/login', data),
  validateToken: () => http.get('/admin/auth/validate'),
}

// Users
export const usersApi = {
  list: () => http.get('/users'),
  getById: (id) => http.get(`/users/${id}`),
  getByEmail: (email) => http.get(`/users/email/${email}`),
  getUnapproved: () => http.get('/users/unapproved'),
  update: (id, data) => http.put(`/users/${id}`, data),
  approve: (id) => http.put(`/users/${id}/approve`),
  delete: (id) => http.delete(`/users/${id}`),
}

// Projects
export const projectsApi = {
  list: () => http.get('/projects'),
  getById: (id) => http.get(`/projects/${id}`),
  getByStatus: (status) => http.get(`/projects/status/${status}`),
  getByWard: (ward) => http.get(`/projects/ward/${ward}`),
  getByCreator: (userId) => http.get(`/projects/creator/${userId}`),
  getTopImpact: () => http.get('/projects/top-impact'),
  create: (data) => http.post('/projects', data),
  update: (id, data) => http.put(`/projects/${id}`, data),
  delete: (id) => http.delete(`/projects/${id}`),
}

// Donations
export const donationsApi = {
  list: () => http.get('/donations'),
  getById: (id) => http.get(`/donations/${id}`),
  getByStatus: (status) => http.get(`/donations/status/${status}`),
  getByProject: (projectId) => http.get(`/donations/project/${projectId}`),
  getProjectTotal: (projectId) => http.get(`/donations/project/${projectId}/total`),
  create: (data) => http.post('/donations', data),
  update: (id, data) => http.put(`/donations/${id}`, data),
  delete: (id) => http.delete(`/donations/${id}`),
}

// Events
export const eventsApi = {
  list: () => http.get('/events'),
  getById: (id) => http.get(`/events/${id}`),
  getUpcoming: () => http.get('/events/upcoming'),
  getByStatus: (status) => http.get(`/events/status/${status}`),
  getByProject: (projectId) => http.get(`/events/project/${projectId}`),
  registerVolunteer: (eventId, volunteerId) => http.post(`/events/${eventId}/register/${volunteerId}`),
  create: (data) => http.post('/events', data),
  update: (id, data) => http.put(`/events/${id}`, data),
  delete: (id) => http.delete(`/events/${id}`),
}

// Volunteers
export const volunteersApi = {
  list: () => http.get('/volunteers'),
  getById: (id) => http.get(`/volunteers/${id}`),
  getByStatus: (status) => http.get(`/volunteers/status/${status}`),
  getByWard: (ward) => http.get(`/volunteers/ward/${ward}`),
  getByInterest: (interest) => http.get(`/volunteers/interest/${interest}`),
  register: (data) => http.post('/volunteers', data),
  update: (id, data) => http.put(`/volunteers/${id}`, data),
  delete: (id) => http.delete(`/volunteers/${id}`),
}

// Content Management
export const contentApi = {
  getByKey: (key) => http.get(`/admin/content/${key}`),
  getByPage: (pageName) => http.get(`/admin/content/page/${pageName}`),
  getPageMap: (pageName) => http.get(`/admin/content/page-map/${pageName}`),
  getRecent: (limit = 10) => http.get(`/admin/content/recent/updates?limit=${limit}`),
  update: (data) => http.post('/admin/content/update', data),
  batchUpdate: (data) => http.post('/admin/content/batch-update', data),
  delete: (key) => http.delete(`/admin/content/${key}`),
}

// Images
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
