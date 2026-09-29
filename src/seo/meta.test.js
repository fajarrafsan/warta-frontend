import { articleMeta, headTags, injectHead, isPreviewBot, robotsTxt } from './meta.js'

const article = {
  title: 'Menulis API dengan "Go" & <MySQL>',
  slug: 'menulis-api-dengan-go',
  excerpt: 'Ringkasan artikel.',
  cover_image: '/uploads/sampul.webp',
  published_at: '2026-09-01T08:00:00Z',
  author: { name: 'Budi' },
  category: { name: 'Teknologi' },
  tags: [{ name: 'golang' }, { name: 'api' }],
}

const html = `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="description"
      content="Warta: ruang redaksi dan bacaan artikel"
    />
    <meta property="og:title" content="Warta" />
    <meta name="twitter:card" content="summary" />
    <title>Warta</title>
  </head>
  <body><div id="root"></div></body>
</html>`

describe('articleMeta', () => {
  it('membuat URL gambar lengkap dari origin backend', () => {
    const meta = articleMeta(article, 'https://api.warta.id')
    expect(meta.image).toBe('https://api.warta.id/uploads/sampul.webp')
    expect(meta.path).toBe('/artikel/menulis-api-dengan-go')
    expect(meta.tags).toEqual(['golang', 'api'])
  })

  it('memotong deskripsi yang terlalu panjang di batas kata', () => {
    const meta = articleMeta({ ...article, excerpt: 'kata '.repeat(100) }, 'https://api.warta.id')
    expect(meta.description.length).toBeLessThanOrEqual(200)
    expect(meta.description.endsWith('kata…')).toBe(true)
  })
})

describe('headTags', () => {
  it('memakai kartu besar bila ada gambar', () => {
    const tags = headTags(articleMeta(article, 'https://api.warta.id'), 'https://warta.id')
    const find = (key) => tags.find((tag) => tag.attrs.name === key || tag.attrs.property === key)?.attrs
    expect(find('twitter:card').content).toBe('summary_large_image')
    expect(find('og:url').content).toBe('https://warta.id/artikel/menulis-api-dengan-go')
    expect(tags.filter((tag) => tag.attrs.property === 'article:tag')).toHaveLength(2)
    expect(tags.find((tag) => tag.tag === 'link').attrs.href).toBe('https://warta.id/artikel/menulis-api-dengan-go')
  })

  it('tanpa gambar dan dengan noindex', () => {
    const tags = headTags({ title: 'Masuk', noindex: true }, 'https://warta.id')
    expect(tags.some((tag) => tag.attrs.property === 'og:image')).toBe(false)
    expect(tags.find((tag) => tag.attrs.name === 'robots').attrs.content).toBe('noindex')
    expect(tags.find((tag) => tag.attrs.name === 'twitter:card').attrs.content).toBe('summary')
  })
})

describe('injectHead', () => {
  const result = injectHead(html, articleMeta(article, 'https://api.warta.id'), 'https://warta.id')

  it('mengganti judul dan meloloskan karakter HTML', () => {
    expect(result).toContain('<title>Menulis API dengan &quot;Go&quot; &amp; &lt;MySQL&gt; | Warta</title>')
    expect(result).toContain('<meta property="og:title" content="Menulis API dengan &quot;Go&quot; &amp; &lt;MySQL&gt;" />')
    expect(result).not.toContain('<MySQL>')
  })

  it('tidak menyisakan tag bawaan yang dobel', () => {
    expect(result.match(/name="description"/g)).toHaveLength(1)
    expect(result.match(/property="og:title"/g)).toHaveLength(1)
    expect(result.match(/name="twitter:card"/g)).toHaveLength(1)
    expect(result).toContain('<meta property="og:image" content="https://api.warta.id/uploads/sampul.webp" />')
    expect(result).toContain('<meta charset="UTF-8" />')
  })
})

describe('isPreviewBot', () => {
  it.each([
    'WhatsApp/2.23.20.0',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Mozilla/5.0 (compatible; Twitterbot/1.0)',
    'TelegramBot (like TwitterBot)',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  ])('mengenali %s', (agent) => {
    expect(isPreviewBot(agent)).toBe(true)
  })

  it('pengunjung biasa bukan bot', () => {
    expect(isPreviewBot('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36')).toBe(false)
    expect(isPreviewBot(null)).toBe(false)
  })
})

it('robots.txt menunjuk sitemap dengan URL lengkap', () => {
  const text = robotsTxt('https://warta.id')
  expect(text).toContain('Disallow: /studio')
  expect(text).toContain('Sitemap: https://warta.id/sitemap.xml')
})
