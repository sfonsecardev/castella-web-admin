import axios from 'axios'

// Base URL is taken from Vite env var or falls back to localhost
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3977/api',
})

// Attach JWT token (if any) in every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    // Ensure headers exist and attach token (cast to mutable any to avoid typing issues)
    ;(config.headers as any) = {
      ...(config.headers as any),
      Authorization: token,
    }
  }
  return config
})

export default api 