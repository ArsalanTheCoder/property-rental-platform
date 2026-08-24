const STORAGE_KEY = 'admin.session'

const memoryStore = {
  token: null,
  admin: null,
}

const storage = {
  get() {
    return memoryStore.token
  },
  set(session) {
    memoryStore.token = session?.token ?? null
    memoryStore.admin = session?.admin ?? null
    try {
      if (session?.token) {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      } else {
        window.sessionStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // sessionStorage unavailable (e.g. tests) — memory store is enough
    }
  },
  clear() {
    memoryStore.token = null
    memoryStore.admin = null
    try {
      window.sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  },
}

export const sessionStore = {
  getSession() {
    if (memoryStore.token) {
      return { token: memoryStore.token, admin: memoryStore.admin }
    }
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const session = JSON.parse(raw)
        memoryStore.token = session?.token ?? null
        memoryStore.admin = session?.admin ?? null
      }
    } catch {
      // ignore malformed storage
    }
    return memoryStore.token ? { token: memoryStore.token, admin: memoryStore.admin } : null
  },
  setSession(session) {
    storage.set(session)
  },
  clearSession() {
    storage.clear()
  },
}
