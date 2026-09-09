import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import AppShell from './layout/AppShell.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import RouteLoading from './components/ui/RouteLoading.jsx'

const AllPostsPage = lazy(() => import('./pages/AllPostsPage.jsx'))
const ArticleEditorPage = lazy(() => import('./pages/ArticleEditorPage.jsx'))
const PreviewPage = lazy(() => import('./pages/PreviewPage.jsx'))
const ArticlePreviewPage = lazy(() => import('./pages/ArticlePreviewPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/posts" replace />} />
            <Route path="/posts" element={<AllPostsPage />} />
            <Route path="/posts/new" element={<ArticleEditorPage />} />
            <Route path="/posts/:id/edit" element={<ArticleEditorPage />} />
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="/preview/:id" element={<ArticlePreviewPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>

      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{ duration: 4000 }}
      />
    </>
  )
}
