import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

app.get('/', (c) => c.json({ status: 'ok', message: 'Aaron Inventory API' }))

serve({
  fetch: app.fetch,
  port: process.env.PORT || 3000
})

console.log('Server running on port', process.env.PORT || 3000)