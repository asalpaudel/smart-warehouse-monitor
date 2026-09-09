import { Router } from 'express'
import { randomBytes } from 'node:crypto'

const USERS = { operator: 'warehouse123' }
const TOKEN_TTL = 30 * 60 * 1000

// in memory for now, sessions die with the process
const sessions = new Map()

export const auth = Router()

auth.post('/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!username || USERS[username] !== password) {
    return res.status(401).json({ error: 'invalid credentials' })
  }
  const token = randomBytes(24).toString('hex')
  const user = { username, role: 'Floor Operator', loginAt: new Date().toISOString() }
  sessions.set(token, { user, expiresAt: Date.now() + TOKEN_TTL })
  res.json({ token, user })
})

auth.post('/logout', (req, res) => {
  sessions.delete(bearer(req))
  res.status(204).end()
})

auth.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

export function requireAuth(req, res, next) {
  const s = sessions.get(bearer(req))
  if (!s || s.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'session expired' })
  }
  req.user = s.user
  next()
}

function bearer(req) {
  const h = req.headers.authorization || ''
  return h.startsWith('Bearer ') ? h.slice(7) : null
}
