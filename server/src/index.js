import express from 'express'
import cors from 'cors'
import { auth } from './auth.js'
import { stream } from './stream.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', auth)
app.use('/api/stream', stream)

app.get('/api/health', (req, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`api on http://localhost:${PORT}`))
