import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { assetUrl } from '../../api/client.js'

// HTML mentah di dalam Markdown tidak dirender (bawaan react-markdown), dan URL
// berbahaya seperti javascript: dibuang, jadi isi artikel aman ditampilkan.
const components = {
  img: ({ src, alt }) => <img src={assetUrl(src)} alt={alt || ''} loading="lazy" />,
  a: ({ href, children }) => {
    const external = /^https?:\/\//.test(href || '')
    return (
      <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </a>
    )
  },
}

export default function Markdown({ children, className = '' }) {
  return (
    <div className={`prose-warta ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
