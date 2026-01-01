import { createContext, useContext, useMemo } from 'react'
import { DB_KEYS, load, save } from './storage'
import { useLocalStore } from './useLocalStore'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useLocalStore(DB_KEYS.SESSION, null)

  const value = useMemo(() => {
    const role = session?.role ?? null
    const email = session?.email ?? null

    function login(emailInput, passInput) {
      const users = load(DB_KEYS.USERS, [])
      const match = users.find(
        (u) => String(u.email).toLowerCase() === String(emailInput).toLowerCase() && String(u.pass) === String(passInput)
      )
      if (!match) return { ok: false, message: 'Invalid email or password.' }
      const next = { email: match.email, role: match.role, ts: Date.now() }
      setSession(next)
      return { ok: true }
    }

    function logout() {
      setSession(null)
    }

    function upsertUser(user) {
      const users = load(DB_KEYS.USERS, [])
      const emailKey = String(user.email).toLowerCase()
      const idx = users.findIndex((u) => String(u.email).toLowerCase() === emailKey)
      const cleaned = { email: user.email, pass: user.pass, role: user.role }
      if (idx >= 0) users[idx] = cleaned
      else users.push(cleaned)
      save(DB_KEYS.USERS, users)
      return users
    }

    function deleteUser(emailToDelete) {
      const users = load(DB_KEYS.USERS, [])
      const next = users.filter((u) => String(u.email).toLowerCase() !== String(emailToDelete).toLowerCase())
      save(DB_KEYS.USERS, next)
      return next
    }

    return {
      session,
      role,
      email,
      isAdmin: role === 'ADMIN',
      canEdit: role === 'ADMIN' || role === 'OPS',
      login,
      logout,
      upsertUser,
      deleteUser
    }
  }, [session, setSession])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
