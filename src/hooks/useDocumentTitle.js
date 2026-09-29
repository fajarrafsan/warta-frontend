import usePageMeta from './usePageMeta.js'

// useDocumentTitle untuk halaman yang tidak perlu muncul di mesin pencari:
// studio, akun, dan halaman bertoken.
export default function useDocumentTitle(title) {
  usePageMeta({ title, noindex: true })
}
