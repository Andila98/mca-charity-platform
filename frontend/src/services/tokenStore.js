let _authToken = null
let _adminToken = null

export const tokenStore = {
  getAuthToken: () => _authToken,
  setAuthToken: (t) => { _authToken = t },
  clearAuthToken: () => { _authToken = null },
  getAdminToken: () => _adminToken,
  setAdminToken: (t) => { _adminToken = t },
  clearAdminToken: () => { _adminToken = null },
}
