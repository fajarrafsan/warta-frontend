// @vitest-environment node
import { afterEach, beforeEach, vi } from 'vitest'
import middleware from '../../middleware.js'

const INDEX = '<html><head><meta name="description" content="bawaan" /><title>Warta</title></head><body></body></html>'
const WHATSAPP = 'WhatsApp/2.23.20.0'

function request(path, userAgent = 'Mozilla/5.0 Chrome/140.0') {
  return new Request(`https://warta.id${path}`, { headers: { 'user-agent': userAgent } })
}

const passesThrough = (response) => response.headers.get('x-middleware-next') === '1'

beforeEach(() => {
  vi.stubEnv('API_URL', 'https://api.warta.id/')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

it('pengunjung biasa langsung ke SPA tanpa memanggil backend', async () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  expect(passesThrough(await middleware(request('/artikel/halo')))).toBe(true)
  expect(fetchMock).not.toHaveBeenCalled()
})

it('crawler mendapat HTML berisi metadata artikel', async () => {
  const fetchMock = vi.fn(async (url) => {
    const target = String(url)
    if (target === 'https://api.warta.id/api/v1/articles/halo-dunia') {
      return Response.json({ data: { title: 'Halo Dunia', slug: 'halo-dunia', excerpt: 'Ringkas', cover_image: '/uploads/a.png' } })
    }
    if (target === 'https://warta.id/index.html') return new Response(INDEX)
    return new Response('tidak dikenal', { status: 404 })
  })
  vi.stubGlobal('fetch', fetchMock)

  const response = await middleware(request('/artikel/halo-dunia', WHATSAPP))
  const html = await response.text()
  expect(response.headers.get('content-type')).toContain('text/html')
  expect(html).toContain('<title>Halo Dunia | Warta</title>')
  expect(html).toContain('<meta property="og:image" content="https://api.warta.id/uploads/a.png" />')
  expect(html).toContain('<meta property="og:url" content="https://warta.id/artikel/halo-dunia" />')
  expect(html).not.toContain('bawaan')
})

it('crawler mendapat metadata profil penulis', async () => {
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    const target = String(url)
    if (target === 'https://api.warta.id/api/v1/authors/7') {
      return Response.json({ data: { id: 7, name: 'Dimas Pratama', bio: 'Menulis soal backend.', avatar_url: '/uploads/d.png' } })
    }
    return new Response(INDEX)
  }))

  const html = await (await middleware(request('/penulis/7', WHATSAPP))).text()
  expect(html).toContain('<title>Dimas Pratama | Warta</title>')
  expect(html).toContain('<meta property="og:type" content="profile" />')
  expect(html).toContain('<meta property="og:image" content="https://api.warta.id/uploads/d.png" />')
  expect(html).toContain('<meta name="description" content="Menulis soal backend." />')
})

it('artikel yang tidak ada atau backend mati tetap ke SPA', async () => {
  vi.stubGlobal('fetch', vi.fn(async (url) => (String(url).includes('/api/') ? new Response('{}', { status: 404 }) : new Response(INDEX))))
  expect(passesThrough(await middleware(request('/artikel/tidak-ada', WHATSAPP)))).toBe(true)

  vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('fetch failed') }))
  expect(passesThrough(await middleware(request('/artikel/halo', WHATSAPP)))).toBe(true)
})

it('sitemap diteruskan dari backend', async () => {
  const fetchMock = vi.fn(async () => new Response('<urlset/>', { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=900' } }))
  vi.stubGlobal('fetch', fetchMock)

  const response = await middleware(request('/sitemap.xml'))
  expect(fetchMock.mock.calls[0][0]).toBe('https://api.warta.id/sitemap.xml')
  expect(response.headers.get('content-type')).toContain('application/xml')
  expect(await response.text()).toBe('<urlset/>')
})

it('robots.txt dibuat dari origin permintaan', async () => {
  const response = await middleware(request('/robots.txt'))
  expect(await response.text()).toContain('Sitemap: https://warta.id/sitemap.xml')
})
