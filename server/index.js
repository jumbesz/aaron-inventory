import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
const JWT_SECRET = process.env.JWT_SECRET || 'aaron-inventory-dev-secret'

const app = new Hono()

app.use('*', cors())

// Admin felhasználó létrehozása első induláskor ha még nem létezik
async function seedAdmin() {
  const { data } = await supabase
    .from('felhasznalok')
    .select('id')
    .eq('felhasznalonev', 'admin')
    .maybeSingle()
  if (!data) {
    const jelszo_hash = await bcrypt.hash('admin', 12)
    await supabase.from('felhasznalok').insert({ felhasznalonev: 'admin', jelszo_hash, szerepkor: 'admin' })
    console.log('Admin user seeded')
  }
}
seedAdmin().catch(console.error)

// ── Auth middleware ──────────────────────────────────────────────────────────
const PUBLIC_PATHS = ['/api/auth/login', '/api/auth/register']

app.use('/api/*', async (c, next) => {
  if (PUBLIC_PATHS.includes(c.req.path)) return next()
  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'Unauthorized' }, 401)
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET)
    c.set('user', payload)
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  return next()
})

// ── Auth ─────────────────────────────────────────────────────────────────────

app.get('/', (c) => c.json({ status: 'ok', message: 'Aaron Inventory API' }))

app.post('/api/auth/login', async (c) => {
  const { felhasznalonev, jelszo } = await c.req.json()
  if (!felhasznalonev || !jelszo) return c.json({ error: 'Minden mező kötelező' }, 400)

  const { data: user } = await supabase
    .from('felhasznalok')
    .select('felhasznalonev, jelszo_hash, szerepkor')
    .eq('felhasznalonev', felhasznalonev)
    .maybeSingle()

  const valid = user && await bcrypt.compare(jelszo, user.jelszo_hash)
  if (!valid) return c.json({ error: 'Hibás felhasználónév vagy jelszó' }, 401)

  const token = jwt.sign({ sub: user.felhasznalonev, szerepkor: user.szerepkor }, JWT_SECRET, { expiresIn: '8h' })
  return c.json({ token })
})

app.post('/api/auth/register', async (c) => {
  const { felhasznalonev, jelszo } = await c.req.json()
  if (!felhasznalonev || !jelszo) return c.json({ error: 'Minden mező kötelező' }, 400)
  if (felhasznalonev.length < 3) return c.json({ error: 'A felhasználónév legalább 3 karakter' }, 400)
  if (jelszo.length < 6) return c.json({ error: 'A jelszó legalább 6 karakter' }, 400)

  const jelszo_hash = await bcrypt.hash(jelszo, 12)

  const { data, error } = await supabase
    .from('felhasznalok')
    .insert({ felhasznalonev, jelszo_hash, szerepkor: 'felhasznalo' })
    .select('felhasznalonev, szerepkor')
    .single()

  if (error) {
    if (error.code === '23505') return c.json({ error: 'Ez a felhasználónév már foglalt' }, 409)
    return c.json({ error: error.message }, 500)
  }

  const token = jwt.sign({ sub: data.felhasznalonev, szerepkor: data.szerepkor }, JWT_SECRET, { expiresIn: '8h' })
  return c.json({ token }, 201)
})

// ── Felhasználók (csak admin) ────────────────────────────────────────────────

app.get('/api/felhasznalok', async (c) => {
  const user = c.get('user')
  if (user.szerepkor !== 'admin') return c.json({ error: 'Forbidden' }, 403)

  const { data, error } = await supabase
    .from('felhasznalok')
    .select('id, felhasznalonev, szerepkor, letrehozva_at')
    .order('letrehozva_at', { ascending: true })

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// ── Eszközök ─────────────────────────────────────────────────────────────────

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

app.post('/api/eszkozok', async (c) => {
  const user = c.get('user')
  if (user.szerepkor !== 'admin') return c.json({ error: 'Forbidden' }, 403)

  const { nev, cikkszam, kiszerelesek, megjegyzes } = await c.req.json()
  if (!nev) return c.json({ error: 'A név kötelező' }, 400)

  const { data, error } = await supabase
    .from('eszkozok')
    .insert({ nev, cikkszam, kiszerelesek, megjegyzes })
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)

  await supabase.from('audit_log').insert({
    tabla: 'eszkozok', muvelet: 'INSERT', eszkoz_id: data.id,
    felhasznalo_nev: user.sub, reszletek: { nev, cikkszam },
  })

  return c.json(data, 201)
})

// ── Kölcsönzések ─────────────────────────────────────────────────────────────

app.post('/api/kolcsonzesek', async (c) => {
  const { eszkoz_id, felhasznalo_nev } = await c.req.json()
  if (!eszkoz_id || !felhasznalo_nev) return c.json({ error: 'eszkoz_id és felhasznalo_nev kötelező' }, 400)

  const { data: meglevo } = await supabase
    .from('kolcsonzesek').select('id').eq('eszkoz_id', eszkoz_id).is('visszahozva_at', null).maybeSingle()
  if (meglevo) return c.json({ error: 'Az eszköz már ki van adva' }, 409)

  const { data, error } = await supabase
    .from('kolcsonzesek')
    .insert({ eszkoz_id, felhasznalo_nev, kiveve_at: new Date().toISOString() })
    .select().single()

  if (error) return c.json({ error: error.message }, 500)

  await supabase.from('audit_log').insert({
    tabla: 'kolcsonzesek', muvelet: 'KIVEVE', eszkoz_id, felhasznalo_nev,
    reszletek: { kolcsonzes_id: data.id },
  })

  return c.json(data, 201)
})

app.patch('/api/kolcsonzesek/:id/visszahozas', async (c) => {
  const id = c.req.param('id')
  const user = c.get('user')

  const { data: meglevo, error: fetchError } = await supabase
    .from('kolcsonzesek').select('eszkoz_id, felhasznalo_nev')
    .eq('id', id).is('visszahozva_at', null).maybeSingle()

  if (fetchError) return c.json({ error: fetchError.message }, 500)
  if (!meglevo) return c.json({ error: 'Kölcsönzés nem található vagy már visszahozták' }, 404)

  if (user.szerepkor !== 'admin' && meglevo.felhasznalo_nev !== user.sub) {
    return c.json({ error: 'Csak a saját kölcsönzésedet hozhatod vissza' }, 403)
  }

  const { data, error } = await supabase
    .from('kolcsonzesek').update({ visszahozva_at: new Date().toISOString() })
    .eq('id', id).select().single()

  if (error) return c.json({ error: error.message }, 500)

  await supabase.from('audit_log').insert({
    tabla: 'kolcsonzesek', muvelet: 'VISSZAHOZVA',
    eszkoz_id: meglevo.eszkoz_id, felhasznalo_nev: meglevo.felhasznalo_nev,
    reszletek: { kolcsonzes_id: id },
  })

  return c.json(data)
})

serve({ fetch: app.fetch, port: process.env.PORT || 3000 })
console.log('Server running on port', process.env.PORT || 3000)
