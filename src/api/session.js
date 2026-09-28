// Sesi login disimpan di localStorage supaya bertahan saat halaman dimuat ulang,
// dan disinkronkan antar tab lewat event storage.
const STORAGE_KEY = 'warta.session'

const listeners = new Set()
let current = read()

function read() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(session) {
  try {
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Mode privat atau storage penuh: sesi tetap berlaku selama tab terbuka.
  }
}

function notify() {
  listeners.forEach((listener) => listener(current))
}

export function getSession() {
  return current
}

export function setSession(session) {
  current = session
  write(session)
  notify()
}

export function clearSession() {
  if (!current) return
  current = null
  write(null)
  notify()
}

export function subscribeSession(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Mengubah response token dari backend menjadi bentuk sesi.
export function toSession(tokens) {
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    user: tokens.user,
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return
    current = read()
    notify()
  })
}
