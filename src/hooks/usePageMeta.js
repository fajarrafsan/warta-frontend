import { useEffect } from 'react'
import { headTags, pageTitle } from '../seo/meta.js'

const MARK = 'data-page-meta'

// Tag bawaan index.html yang digantikan selama halaman tampil.
const DEFAULTS = [
  'meta[name="description"]',
  'meta[name="robots"]',
  'meta[property^="og:"]',
  'meta[name^="twitter:"]',
  'link[rel="canonical"]',
].map((selector) => `${selector}:not([${MARK}])`).join(', ')

// usePageMeta memasang judul, deskripsi, URL kanonis, dan tag Open Graph
// halaman. Mesin pencari yang menjalankan JavaScript membacanya; crawler
// pratinjau link mendapatkannya dari middleware.js.
export default function usePageMeta(meta) {
  const key = JSON.stringify(meta)

  useEffect(() => {
    const current = JSON.parse(key)
    document.title = pageTitle(current.title)

    // Tag bawaan disingkirkan sementara supaya tidak dobel.
    const originals = [...document.head.querySelectorAll(DEFAULTS)]
    originals.forEach((element) => element.remove())

    const added = headTags(current, window.location.origin).map(({ tag, attrs }) => {
      const element = document.createElement(tag)
      Object.entries(attrs).forEach(([name, value]) => element.setAttribute(name, value))
      element.setAttribute(MARK, '')
      document.head.appendChild(element)
      return element
    })

    return () => {
      added.forEach((element) => element.remove())
      originals.forEach((element) => document.head.appendChild(element))
      document.title = pageTitle()
    }
  }, [key])
}
