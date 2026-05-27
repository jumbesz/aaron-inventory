import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

const app = new Hono()

app.use('/api/*', cors())

app.get('/', (c) => c.json({ status: 'ok', message: 'Aaron Inventory API' }))

// GET /api/eszkozok — összes eszköz + aktív kölcsönzés
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

// POST /api/eszkozok — új eszköz
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

// POST /api/kolcsonzesek — eszköz kivétele
app.post('/api/kolcsonzesek', async (c) => {
  const body = await c.req.json()
  const { eszkoz_id, felhasznalo_nev } = body

  if (!eszkoz_id || !felhasznalo_nev) {
    return c.json({ error: 'eszkoz_id és felhasznalo_nev kötelező' }, 400)
  }

  // Ellenőrzés: nincs-e már kiadva
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

// PATCH /api/kolcsonzesek/:id/visszahozas — visszahozás rögzítése
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
