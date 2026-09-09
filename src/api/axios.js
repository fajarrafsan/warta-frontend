import axios from 'axios'

const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim()

export const api = axios.create({
  baseURL: configuredBaseUrl || '/api',
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

