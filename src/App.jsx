import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { Toaster } from 'sonner'
import PublicLayout from './layout/PublicLayout.jsx'
import StudioLayout from './layout/StudioLayout.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import RouteLoading from './components/ui/RouteLoading.jsx'

const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const ArticlePage = lazy(() => import('./pages/ArticlePage.jsx'))
const ListingPage = lazy(() => import('./pages/ListingPage.jsx'))
const BookmarksPage = lazy(() => import('./pages/ListingPage.jsx').then((module) => ({ default: module.BookmarksPage })))
const AuthPage = lazy(() => import('./pages/AuthPage.jsx'))
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'))
const AllPostsPage = lazy(() => import('./pages/AllPostsPage.jsx'))
const ArticleEditorPage = lazy(() => import('./pages/ArticleEditorPage.jsx'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage.jsx'))
const UsersPage = lazy(() => import('./pages/UsersPage.jsx'))
const ModerationPage = lazy(() => import('./pages/ModerationPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

const WRITERS = ['admin', 'author']
const ADMINS = ['admin']

// Alamat versi sebelumnya tetap berfungsi dan diarahkan ke alamat baru.
function Legacy({ to }) {
  const params = useParams()
  const { search } = useLocation()
  const target = to.replace(/:(\w+)/g, (_, name) => params[name] ?? '')
  return <Navigate to={target + search} replace />
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />

          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/artikel/:ref" element={<ArticlePage />} />
            <Route path="/kategori/:slug" element={<ListingPage mode="category" />} />
            <Route path="/tag/:slug" element={<ListingPage mode="tag" />} />
            <Route path="/cari" element={<ListingPage mode="search" />} />
            <Route path="/tersimpan" element={<RequireAuth><BookmarksPage /></RequireAuth>} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="/studio" element={<RequireAuth roles={WRITERS}><StudioLayout /></RequireAuth>}>
            <Route index element={<DashboardPage />} />
            <Route path="artikel" element={<AllPostsPage />} />
            <Route path="tulis" element={<ArticleEditorPage />} />
            <Route path="artikel/:id/edit" element={<ArticleEditorPage />} />
            <Route path="kategori" element={<RequireAuth roles={ADMINS}><CategoriesPage /></RequireAuth>} />
            <Route path="pengguna" element={<RequireAuth roles={ADMINS}><UsersPage /></RequireAuth>} />
            <Route path="moderasi" element={<RequireAuth roles={ADMINS}><ModerationPage /></RequireAuth>} />
          </Route>

          <Route path="/preview" element={<Legacy to="/" />} />
          <Route path="/preview/:ref" element={<Legacy to="/artikel/:ref" />} />
          <Route path="/posts" element={<Legacy to="/studio/artikel" />} />
          <Route path="/posts/new" element={<Legacy to="/studio/tulis" />} />
          <Route path="/posts/:id/edit" element={<Legacy to="/studio/artikel/:id/edit" />} />
          <Route path="/categories" element={<Legacy to="/studio/kategori" />} />
          <Route path="/users" element={<Legacy to="/studio/pengguna" />} />
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
