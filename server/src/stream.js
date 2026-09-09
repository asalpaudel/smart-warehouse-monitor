import { Router } from 'express'
import { requireAuth } from './auth.js'
import { bus } from './telemetry.js'

export const stream = Router()

stream.get('/telemetry', requireAuth, (req, res) => {
  res.set({
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
  })
  res.flushHeaders()

  const send = (reading) => res.write(`data: ${JSON.stringify(reading)}\n\n`)
  bus.on('reading', send)

  const ping = setInterval(() => res.write(': ping\n\n'), 15000)

  req.on('close', () => {
    bus.off('reading', send)
    clearInterval(ping)
  })
})
