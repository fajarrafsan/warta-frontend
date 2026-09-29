// Metadata halaman untuk mesin pencari dan pratinjau link (WhatsApp,
// Facebook, X, Telegram, Slack, dan sejenisnya). Modul ini tidak menyentuh DOM
// supaya bisa dipakai di browser (usePageMeta) maupun di Vercel Middleware.

export const SITE_NAME = 'Warta'
export const DEFAULT_DESCRIPTION = 'Warta: ruang redaksi dan bacaan artikel'

export function pageTitle(title) {
  return title ? `${title} | ${SITE_NAME}` : SITE_NAME
}

// absoluteUrl membuat path seperti /uploads/ab.png menjadi URL lengkap.
// Pratinjau link hanya menerima gambar dengan URL lengkap.
export function absoluteUrl(path, base) {
  if (!path) return ''
  try {
    return new URL(path, base).href
  } catch {
    return ''
  }
}

function clip(text, max) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`
}

// articleMeta menyusun metadata dari response GET /api/v1/articles/{ref}.
// assetBase adalah origin tempat /uploads/... disajikan.
export function articleMeta(article, assetBase) {
  return {
    title: article.title,
    description: clip(article.excerpt || DEFAULT_DESCRIPTION, 200),
    image: absoluteUrl(article.cover_image, assetBase),
    type: 'article',
    path: `/artikel/${encodeURIComponent(article.slug)}`,
    publishedTime: article.published_at || '',
    author: article.author?.name || '',
    section: article.category?.name || '',
    tags: (article.tags || []).map((tag) => tag.name),
  }
}

// headTags mengubah metadata menjadi daftar tag untuk <head>. origin adalah
// alamat frontend, dasar URL kanonis.
export function headTags(meta, origin) {
  const description = meta.description || DEFAULT_DESCRIPTION
  const title = meta.title || SITE_NAME
  const url = meta.path ? absoluteUrl(meta.path, origin) : ''
  const tags = []
  const name = (key, content) => content && tags.push({ tag: 'meta', attrs: { name: key, content } })
  const property = (key, content) => content && tags.push({ tag: 'meta', attrs: { property: key, content } })

  name('description', description)
  if (meta.noindex) name('robots', 'noindex')
  if (url) tags.push({ tag: 'link', attrs: { rel: 'canonical', href: url } })

  property('og:site_name', SITE_NAME)
  property('og:locale', 'id_ID')
  property('og:type', meta.type || 'website')
  property('og:title', title)
  property('og:description', description)
  property('og:url', url)
  property('og:image', meta.image)
  if (meta.type === 'article') {
    property('article:published_time', meta.publishedTime)
    property('article:author', meta.author)
    property('article:section', meta.section)
    for (const tag of meta.tags || []) property('article:tag', tag)
  }

  name('twitter:card', meta.image ? 'summary_large_image' : 'summary')
  name('twitter:title', title)
  name('twitter:description', description)
  name('twitter:image', meta.image)
  return tags
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderTag({ tag, attrs }) {
  const rendered = Object.entries(attrs).map(([key, value]) => `${key}="${escapeHtml(value)}"`).join(' ')
  return `<${tag} ${rendered} />`
}

// Tag yang diganti oleh injectHead: deskripsi, robots, Open Graph, Twitter,
// dan kanonis bawaan index.html.
const REPLACED_TAGS = /[ \t]*<(?:meta\s+(?:name|property)="(?:description|robots|og:[^"]*|article:[^"]*|twitter:[^"]*)"|link\s+rel="canonical")[^>]*>\n?/g

// injectHead memasang metadata ke index.html untuk crawler yang tidak
// menjalankan JavaScript.
export function injectHead(html, meta, origin) {
  const tags = headTags(meta, origin).map((tag) => `    ${renderTag(tag)}`).join('\n')
  return html
    .replace(REPLACED_TAGS, '')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(pageTitle(meta.title))}</title>`)
    .replace('</head>', `${tags}\n  </head>`)
}

// Crawler pratinjau link dan mesin pencari. Pengunjung biasa tidak perlu
// menunggu backend dipanggil dua kali.
const BOT_PATTERN = /facebookexternalhit|facebookcatalog|meta-externalagent|twitterbot|whatsapp|slackbot|slack-imgproxy|telegrambot|linkedinbot|discordbot|pinterest|redditbot|skypeuripreview|embedly|googlebot|bingbot|duckduckbot|yandex|baiduspider|applebot/i

export function isPreviewBot(userAgent) {
  return BOT_PATTERN.test(userAgent || '')
}

// robotsTxt menutup halaman studio dan halaman bertoken dari mesin pencari,
// dan menunjuk sitemap. Direktif Sitemap wajib URL lengkap.
export function robotsTxt(origin) {
  return [
    'User-agent: *',
    'Disallow: /studio',
    'Disallow: /verify-email',
    'Disallow: /reset-password',
    'Disallow: /tersimpan',
    '',
    `Sitemap: ${absoluteUrl('/sitemap.xml', origin)}`,
    '',
  ].join('\n')
}
