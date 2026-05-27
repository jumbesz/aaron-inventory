import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { sign, verify } from 'hono/jwt'
import { serve } from '@hono/node-server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

const JWT_SECRET = process.env.JWT_SECRET || 'aaron-inventory-dev-secret'
const ADMIN_USER = 'admin'
const ADMIN_PASS = 'admin'

const app = new Hono()

app.use('/api/*', cors())

app.get('/', (c) => c.json({ status: 'ok', message: 'Aaron Inventory API' }))

// POST /api/auth/login
app.post('/api/auth/login', async (c) => {
  const { username, password } = await c.req.json()
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return c.json({ error: 'Hibás felhasználónév vagy jelszó' }, 401)
  }
  const token = await sign(
    { sub: username, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8 },
    JWT_SECRET
  )
  return c.json({ token })
})

// Auth middleware minden más /api/* route-ra
app.use('/api/*', async (c, next) => {
  if (c.req.path === '/api/auth/login') return next()
  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'Unauthorized' }, 401)
  try {
    await verify(auth.slice(7), JWT_SECRET)
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  return next()
})

// GET /api/eszkozok
app.get('/api/eszkozok', async (c) => {
  const { data: eszkozok, error } = await supabase
    .from('eszkozok')
    .select('*, kolcsonzesek(id, felhasznalo_nev, kiveve_at, visszahozva_at)')
    .order('letrehozva_at', { ascending: true })

  if (error) return c.json({ error: error.message }, 500)

  const result = eszkozok.map((e) => ({
    ...e,
    kolcsonzesek: e.kolcsonzesek.filter((k) => k.visszahozva_at === null),
  }))
  return c.json(result)
})

// POST /api/eszkozok
app.post('/api/eszkozok', async (c) => {
  const body = await c.req.json()
  const { nev, cikkszam, kiszerelesek, megjegyzes } = body

  if (!nev) return c.json({ error: 'A név kötelező' }, 400)

  const { data, error } = await supabase
    .from('eszkozok')
    .insert({ nev, cikkszam, kiszerelesek, megjegyzes })
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)

  await supabase.from('audit_log').insert({
    tabla: 'eszkozok',
    muvelet: 'INSERT',
    eszkoz_id: data.id,
    felhasznalo_nev: null,
    reszletek: { nev, cikkszam },
  })

  return c.json(data, 201)
})

// POST /api/kolcsonzesek
app.post('/api/kolcsonzesek', async (c) => {
  const body = await c.req.json()
  const { eszkoz_id, felhasznalo_nev } = body

  if (!eszkoz_id || !felhasznalo_nev) {
    return c.json({ error: 'eszkoz_id és felhasznalo_nev kötelező' }, 400)
  }

  const { data: meglevo } = await supabase
    .from('kolcsonzesek')
    .select('id')
    .eq('eszkoz_id', eszkoz_id)
    .is('visszahozva_at', null)
    .maybeSingle()

  if (meglevo) return c.json({ error: 'Az eszköz már ki van adva' }, 409)

  const { data, error } = await supabase
    .from('kolcsonzesek')
    .insert({ eszkoz_id, felhasznalo_nev, kiveve_at: new Date().toISOString() })
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)

  await supabase.from('audit_log').insert({
    tabla: 'kolcsonzesek',
    muvelet: 'KIVEVE',
    eszkoz_id,
    felhasznalo_nev,
    reszletek: { kolcsonzes_id: data.id },
  })

  return c.json(data, 201)
})

// PATCH /api/kolcsonzesek/:id/visszahozas
app.patch('/api/kolcsonzesek/:id/visszahozas', async (c) => {
  const id = c.req.param('id')

  const { data: meglevo, error: fetchError } = await supabase
    .from('kolcsonzesek')
    .select('eszkoz_id, felhasznalo_nev')
    .eq('id', id)
    .is('visszahozva_at', null)
    .maybeSingle()

  if (fetchError) return c.json({ error: fetchError.message }, 500)
  if (!meglevo) return c.json({ error: 'Kölcsönzés nem található vagy már visszahozták' }, 404)

  const { data, error } = await supabase
    .from('kolcsonzesek')
    .update({ visszahozva_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)

  await supabase.from('audit_log').insert({
    tabla: 'kolcsonzesek',
    muvelet: 'VISSZAHOZVA',
    eszkoz_id: meglevo.eszkoz_id,
    felhasznalo_nev: meglevo.felhasznalo_nev,
    reszletek: { kolcsonzes_id: id },
  })

  return c.json(data)
})

serve({
  fetch: app.fetch,
  port: process.env.PORT || 3000,
})

console.log('Server running on port', process.env.PORT || 3000)
