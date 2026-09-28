# Warta Frontend

Frontend untuk [Warta](https://github.com/fajarrafsan/sharing-vision-backend):
ruang redaksi untuk penulis dan admin, sekaligus halaman baca untuk publik.
React JSX, Vite, Tailwind CSS v4, dan pnpm.

## Fitur

- **Preview** untuk publik: artikel terbit dengan filter category dan tag,
  paging dari backend, detail artikel lewat slug, dan komentar.
- **Login dan daftar.** Access token diperbarui otomatis dengan refresh token
  saat kedaluwarsa; sesi berakhir bila refresh gagal.
- **All Posts** untuk penulis dan admin: tab Published, Drafts, dan Trashed
  dengan jumlah per status, pencarian, dan paging dari backend. Penulis melihat
  artikelnya sendiri, admin melihat semua.
- **Add New / Edit** dengan category dari backend, tag, dan validasi yang sama
  seperti backend.
- **Categories** dan **Users** khusus admin: kelola category dan naikkan role
  akun menjadi penulis.
- Dark mode, status koneksi backend, dan layout responsif.

Menu yang tampil mengikuti role akun: pengunjung dan pembaca hanya melihat
Preview, penulis mendapat All Posts dan Add New, admin mendapat semuanya.

## Menjalankan project

Jalankan backend Warta lebih dulu di `http://localhost:8080`:

```bash
cd sharing-vision-backend
docker compose up -d --build
```

Kemudian frontend:

```bash
pnpm install
pnpm dev
```

Buka `http://localhost:5173` dan masuk dengan akun admin bawaan backend
(`admin@warta.local` / `admin12345` pada `docker-compose.yml`).

Alur pertama kali:

1. Masuk sebagai admin, buat category di halaman **Categories**.
2. Daftar akun baru; akun baru selalu berperan pembaca.
3. Sebagai admin, jadikan akun itu penulis di halaman **Users**.
4. Masuk dengan akun penulis, lalu tulis artikel di **Add New**.

Saat development, request `/api` dan `/health` diteruskan Vite ke
`http://localhost:8080`, jadi CORS tidak perlu diatur untuk penggunaan lokal.

## Environment

Salin `.env.example` menjadi `.env` hanya bila frontend akan mengakses backend
di URL lain:

```env
VITE_API_URL=https://alamat-backend.example.com
```

Backend harus mengizinkan origin frontend lewat `CORS_ORIGINS`.

## Deploy

Frontend ini dideploy ke Vercel sebagai etalase tampilan. Backend-nya tidak ikut
dideploy karena dijalankan lokal, jadi pada versi Vercel indikator koneksi
menampilkan "Backend terputus" dan daftar artikel kosong. Itu bukan kerusakan
aplikasi, melainkan memang tidak ada backend yang bisa dihubungi dari internet.

Kalau backend sudah punya URL publik, isi `VITE_API_URL` pada Environment
Variables di Vercel lalu redeploy.

`vercel.json` berisi rewrite ke `index.html` supaya route seperti `/posts/new`
tetap terbuka saat diakses langsung, bukan menghasilkan 404.

## Scripts

```bash
pnpm dev       # development server
pnpm build     # production build
pnpm preview   # preview hasil build
pnpm lint      # ESLint
pnpm test      # unit/component test
```

## Route

| Route | Akses | |
|---|---|---|
| `/preview` | publik | daftar artikel terbit |
| `/preview/:slug` | publik | detail artikel dan komentar (id lama juga diterima) |
| `/login`, `/register` | publik | masuk dan daftar |
| `/posts` | penulis, admin | artikel per status |
| `/posts/new`, `/posts/:id/edit` | penulis, admin | tulis dan ubah artikel |
| `/categories`, `/users` | admin | kelola category dan role |

## Catatan

Sesi login (access token, refresh token, dan data akun) disimpan di
`localStorage` supaya bertahan saat halaman dimuat ulang, dan disinkronkan
antar tab. Beberapa permintaan yang bersamaan mendapat 401 hanya memicu satu
kali refresh, karena refresh token di backend hanya berlaku sekali.

Perubahan role oleh admin berlaku setelah access token pengguna itu diperbarui
(paling lama 15 menit) atau setelah ia login ulang.
