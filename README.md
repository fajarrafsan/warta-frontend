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

**Akun:** daftar, masuk, lupa password lewat tautan email, dan verifikasi
email. Akun yang emailnya belum terverifikasi melihat pemberitahuan di kolom
komentar beserta tombol kirim ulang, bila backend mewajibkan verifikasi.

**SEO dan pratinjau link:** setiap halaman publik memasang judul, deskripsi,
URL kanonis, serta tag Open Graph dan Twitter (judul, ringkasan, dan gambar
sampul artikel). Saat tautan artikel dibagikan ke WhatsApp, Facebook, X,
Telegram, atau Slack, pratinjaunya menampilkan judul dan sampul artikel itu.
`/sitemap.xml`, `/feed.xml` (RSS), dan `/robots.txt` tersedia di domain
frontend.

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

### Pratinjau link, sitemap, dan RSS

Karena aplikasi ini SPA, HTML awalnya belum berisi judul dan gambar artikel,
sedangkan crawler pratinjau link tidak menjalankan JavaScript. `middleware.js`
(Vercel Routing Middleware) menangani ini:

- Permintaan `/artikel/...` dari crawler (WhatsApp, Facebook, X, Telegram,
  Slack, LinkedIn, Discord, Google, Bing, dan lain-lain) mengambil artikelnya
  dari backend lalu memasang metadata ke `index.html`. Pengunjung biasa
  langsung mendapat SPA tanpa langkah tambahan. Bila backend lambat (lebih
  dari 3 detik) atau artikel tidak ada, crawler tetap mendapat halaman biasa.
- `/sitemap.xml` dan `/feed.xml` diteruskan dari backend, dan `/robots.txt`
  dibuat dengan alamat sitemap domain ini. Halaman studio dan halaman bertoken
  ditutup dari mesin pencari.

Middleware membaca alamat backend dari `API_URL`, atau `VITE_API_URL` bila
kosong. Di backend, isi `APP_URL` dengan alamat frontend supaya tautan di
sitemap, RSS, dan email mengarah ke sini. Saat development, Vite meneruskan
`/sitemap.xml` dan `/feed.xml` ke backend lokal.

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
| `/forgot-password` | publik | minta tautan reset password |
| `/reset-password?token=` | publik | buat password baru dari tautan email |
| `/verify-email?token=` | publik | verifikasi email dari tautan email |
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
(paling lama 15 menit) atau setelah ia login ulang. Data akun lainnya,
seperti status verifikasi email, dimuat ulang dari `/api/v1/me` setiap kali
aplikasi dibuka.
