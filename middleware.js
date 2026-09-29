// Vercel Routing Middleware. Aplikasi ini SPA, jadi index.html tidak berisi
// judul dan gambar artikel sampai JavaScript berjalan, sedangkan crawler
// pratinjau link (WhatsApp, Facebook, X, Telegram, dan lain-lain) tidak
// menjalankan JavaScript. Untuk crawler, metadata artikel dipasang langsung ke
// HTML-nya. Pengunjung biasa tidak melewati langkah ini.
//
// Middleware ini juga meneruskan /sitemap.xml dan /feed.xml ke backend dan
// membuat robots.txt. Alamat backend dibaca dari API_URL, atau VITE_API_URL
// yang juga dipakai saat build.
import { next } from '@vercel/functions'
import { articleMeta, injectHead, isPreviewBot, robotsTxt } from './src/seo/meta.js'

export const config = {
  matcher: ['/artikel/:path*', '/sitemap.xml', '/feed.xml', '/robots.txt'],
}

const TIMEOUT_MS = 3000

function backendUrl() {
  return (process.env.API_URL || process.env.VITE_API_URL || '').trim().replace(/\/+$/, '')
}

export default async function middleware(request) {
  const url = new URL(request.url)
  const backend = backendUrl()

  if (url.pathname === '/robots.txt') {
    return new Response(robotsTxt(url.origin), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    })
  }

  if (url.pathname === '/sitemap.xml' || url.pathname === '/feed.xml') {
    return proxyFeed(backend, url.pathname)
  }

  if (!backend || !isPreviewBot(request.headers.get('user-agent'))) {
    return next()
  }

  // Bila backend lambat atau artikel tidak ada, crawler tetap mendapat
  // halaman biasa.
  try {
    const ref = decodeURIComponent(url.pathname.slice('/artikel/'.length).split('/')[0])
    if (!ref) return next()

    const [articleResponse, pageResponse] = await Promise.all([
      fetch(`${backend}/api/v1/articles/${encodeURIComponent(ref)}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }),
      fetch(new URL('/index.html', url), { signal: AbortSignal.timeout(TIMEOUT_MS) }),
    ])
    if (!articleResponse.ok || !pageResponse.ok) return next()

    const article = (await articleResponse.json()).data
    const html = injectHead(await pageResponse.text(), articleMeta(article, backend), url.origin)
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch {
    return next()
  }
}

async function proxyFeed(backend, path) {
  if (!backend) {
    return new Response('API_URL belum diatur di Vercel', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
  try {
    const upstream = await fetch(backend + path, { signal: AbortSignal.timeout(TIMEOUT_MS * 2) })
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'application/xml; charset=utf-8',
        'Cache-Control': upstream.headers.get('Cache-Control') || 'public, max-age=900',
      },
    })
  } catch {
    return new Response('Backend tidak terjangkau', { status: 502, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
}
