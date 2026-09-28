import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import AppShell from './layout/AppShell.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import RouteLoading from './components/ui/RouteLoading.jsx'

const AllPostsPage = lazy(() => import('./pages/AllPostsPage.jsx'))
const ArticleEditorPage = lazy(() => import('./pages/ArticleEditorPage.jsx'))
const PreviewPage = lazy(() => import('./pages/PreviewPage.jsx'))
const ArticlePreviewPage = lazy(() => import('./pages/ArticlePreviewPage.jsx'))
const AuthPage = lazy(() => import('./pages/AuthPage.jsx'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage.jsx'))
const UsersPage = lazy(() => import('./pages/UsersPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

const WRITERS = ['admin', 'author']
const ADMINS = ['admin']

function writersOnly(page) {
  return <RequireAuth roles={WRITERS}>{page}</RequireAuth>
}

function adminsOnly(page) {
  return <RequireAuth roles={ADMINS}>{page}</RequireAuth>
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />

          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/preview" replace />} />
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="/preview/:ref" element={<ArticlePreviewPage />} />
            <Route path="/posts" element={writersOnly(<AllPostsPage />)} />
            <Route path="/posts/new" element={writersOnly(<ArticleEditorPage />)} />
            <Route path="/posts/:id/edit" element={writersOnly(<ArticleEditorPage />)} />
            <Route path="/categories" element={adminsOnly(<CategoriesPage />)} />
            <Route path="/users" element={adminsOnly(<UsersPage />)} />
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
