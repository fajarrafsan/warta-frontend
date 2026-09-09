# Sharing Vision Frontend

Frontend dashboard article untuk tes Sharing Vision. Project dibuat dengan React JSX, Vite, Tailwind CSS v4, dan pnpm. Seluruh fitur terhubung ke backend Go di folder `sharing-vision-backend`.

## Fitur

- Halaman **All Posts** dengan tab Published, Drafts, dan Trashed.
- Tabel responsif berisi title, category, status, updated date, serta action.
- Edit article dan ubah status menjadi Publish atau Draft.
- Pindahkan article ke Trashed melalui update status `thrash`.
- Restore article Trashed menjadi Draft dan hapus permanen dengan konfirmasi.
- Halaman **Add New** dengan validasi yang sama seperti backend.
- Halaman **Preview** khusus article Published dengan pagination.
- Detail preview article, pencarian, loading skeleton, error state, dark mode, dan status koneksi backend.
- Layout responsif untuk mobile, tablet, dan desktop.

## Menjalankan project

Pastikan backend berjalan di `http://localhost:8080` terlebih dahulu:

```bash
cd "C:\DATA FAJAR\PROJECT\sharing-vision-backend"
docker compose up -d --build
```

Kemudian jalankan frontend:

```bash
cd "C:\DATA FAJAR\PROJECT\sharing-vision-frontend"
pnpm install
pnpm dev
```

Buka `http://localhost:5173`.

Saat development, request `/api` otomatis diteruskan Vite ke `http://localhost:8080`. Karena itu backend tidak perlu diubah untuk CORS pada penggunaan lokal.

## Environment

Salin `.env.example` menjadi `.env` hanya bila frontend akan mengakses URL backend lain:

```env
VITE_API_URL=https://alamat-backend.example.com
```

Jika frontend dan backend berada pada origin berbeda di production, backend harus mengizinkan origin frontend melalui konfigurasi CORS.

## Scripts

```bash
pnpm dev       # development server
pnpm build     # production build
pnpm preview   # preview hasil build
pnpm lint      # ESLint
pnpm test      # unit/component test
```

## Route utama

- `/posts` - daftar semua article per status
- `/posts/new` - tambah article
- `/posts/:id/edit` - edit article
- `/preview` - daftar blog Published
- `/preview/:id` - detail blog Published

## Catatan API

Backend tidak menyediakan filter status atau total row pada endpoint list. Frontend mengambil data bertahap dengan limit 100, lalu melakukan filter status dan pagination Preview di sisi client. Payload update selalu mengirim `title`, `content`, `category`, dan `status` lengkap sesuai kontrak backend.
