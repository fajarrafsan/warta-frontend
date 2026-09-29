# Warta Frontend

Frontend untuk [Warta](https://github.com/fajarrafsan/warta-backend):
situs baca bergaya majalah untuk publik, sekaligus ruang redaksi untuk penulis
dan admin.
React JSX, Vite, Tailwind CSS v4, dan pnpm.

## Fitur

**Situs baca (publik)**, bergaya majalah dengan header atas:

- Beranda: artikel utama bersampul, daftar terkini, peringkat terpopuler, dan
  artikel lainnya dengan paging.
- Halaman artikel: sampul, isi Markdown (subjudul, kode, kutipan, tabel),
  waktu baca, jumlah dibaca, tombol suka, simpan, dan salin tautan, komentar,
  serta artikel lain di kategori yang sama.
- Halaman per kategori dan tag, pencarian, dan halaman Tersimpan.

**Ruang redaksi** (`/studio`) untuk penulis dan admin:

- Dashboard: angka ringkas, grafik dibaca per hari, komentar per hari, dan
  artikel terpopuler untuk 7, 30, atau 90 hari. Grafik bisa ditampilkan
  sebagai tabel. Admin juga melihat jumlah akun per role.
- Daftar artikel per status dengan pencarian dan paging.
- Editor Markdown dengan toolbar (subjudul, tebal, miring, tautan, kutipan,
  daftar, kode), sisip gambar, pratinjau langsung, dan upload gambar sampul.
- Kelola kategori dan role pengguna (admin).
- Moderasi komentar (admin): komentar yang dilaporkan pembaca atau
  disembunyikan otomatis, dengan pilihan tampilkan, sembunyikan, atau hapus.

Pembaca bisa melaporkan komentar orang lain (spam, kasar, atau alasan lain).
Pesan dari aturan anti-spam backend, seperti batas tautan atau kiriman ganda,
tampil langsung di form komentar.

Login memakai access token yang diperbarui otomatis dengan refresh token.
Menu dan halaman mengikuti role: pembaca bisa menyukai, menyimpan, dan
berkomentar; penulis mendapat ruang redaksi; admin mendapat semuanya.

## Menjalankan project

Jalankan backend Warta lebih dulu di `http://localhost:8080`:

```bash
cd warta-backend
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

1. Masuk sebagai admin, buat kategori di **Ruang redaksi → Kategori**.
2. Daftar akun baru; akun baru selalu berperan pembaca.
3. Sebagai admin, jadikan akun itu penulis di **Ruang redaksi → Pengguna**.
4. Masuk dengan akun penulis, lalu tulis artikel di **Ruang redaksi → Tulis**.

Saat development, request `/api`, `/health`, dan `/uploads` diteruskan Vite ke
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
| `/` | publik | beranda (`?sort=popular` untuk terpopuler) |
| `/artikel/:slug` | publik | halaman baca (id juga diterima) |
| `/kategori/:slug`, `/tag/:slug` | publik | artikel per kategori atau tag |
| `/cari?q=` | publik | pencarian |
| `/tersimpan` | login | artikel yang disimpan |
| `/login`, `/register` | publik | masuk dan daftar |
| `/studio` | penulis, admin | dashboard |
| `/studio/artikel`, `/studio/tulis`, `/studio/artikel/:id/edit` | penulis, admin | kelola dan tulis artikel |
| `/studio/kategori`, `/studio/pengguna`, `/studio/moderasi` | admin | kelola kategori, role, dan komentar yang dilaporkan |

Alamat versi sebelumnya (`/preview`, `/posts`, `/categories`, `/users`) tetap
bisa dibuka dan diarahkan ke alamat baru.

## Catatan

Sesi login (access token, refresh token, dan data akun) disimpan di
`localStorage` supaya bertahan saat halaman dimuat ulang, dan disinkronkan
antar tab. Beberapa permintaan yang bersamaan mendapat 401 hanya memicu satu
kali refresh, karena refresh token di backend hanya berlaku sekali.

Perubahan role oleh admin berlaku setelah access token pengguna itu diperbarui
(paling lama 15 menit) atau setelah ia login ulang.
