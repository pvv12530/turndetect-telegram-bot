import { config } from '#root/config.js'
import axios from 'axios'

// Create axios instance with base URL from environment variable
export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
})

// Request interceptor for logging (optional)
apiClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling (optional)
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // You can add custom error handling here if needed
    return Promise.reject(error)
  },
)
