# Helpdesk Web

Antarmuka web untuk sistem helpdesk dengan SLA: tiket, assignment, workflow status, percakapan (publik dan catatan internal), knowledge base, dashboard metrik, notifikasi, dan halaman administrasi.


## Fitur

- **Tiket**: daftar dengan tab Aktif/Selesai (hitungan dari API), pencarian, filter status, prioritas, kategori, dan penanggung jawab, paginasi. Semua filter tersimpan di URL, jadi bisa di-refresh dan dibagikan.
- **Detail tiket**: percakapan publik dan catatan internal, kartu SLA dengan progress bar, dan sisa waktu yang berjalan tanpa refresh.
- **Workflow**: ambil tiket (claim), assign atau alihkan (admin), dan ubah status. Tombol yang tampil mengikuti peran dan kondisi tiket, dengan konfirmasi untuk tindakan yang tidak bisa dibatalkan.
- **Riwayat tiket** (staff): timeline dari audit log, termasuk peringatan dan pelanggaran SLA yang dicatat sistem.
- **Knowledge base**: pencarian, filter kategori, halaman baca, editor, dan alur publish oleh admin.
- **Dashboard** (staff): kondisi saat ini, metrik per periode (7, 30, atau 90 hari), sebaran tiket, dan beban kerja agent.
- **Notifikasi**: lonceng dengan jumlah belum dibaca (polling 30 detik), tandai dibaca, dan klik langsung ke tiket.
- **Administrasi** (admin): pengguna (tambah, ubah peran, nonaktifkan, reset password), kategori, target SLA, dan pembaca audit log.

## Peran

| | Requester | Agent | Admin |
|---|---|---|---|
| Buat dan pantau tiket sendiri | ✅ | ✅ | ✅ |
| Lihat semua tiket, riwayat, dan catatan internal | ❌ | ✅ | ✅ |
| Claim dan ubah status tiket | cancel, close, reopen (tiket sendiri) | tiket yang dipegang | semua |
| Assign tiket | ❌ | ❌ | ✅ |
| Dashboard | ❌ | ✅ | ✅ |
| Tulis artikel KB | ❌ | ✅ (draft sendiri) | ✅ |
| Publish artikel, administrasi, audit log | ❌ | ❌ | ✅ |

Pembatas di frontend hanya soal tampilan (tombol yang pasti ditolak nggak ditampilkan). Penjaga sebenarnya adalah Policy dan Gate di API.

## Stack

React, TypeScript (mode strict), Vite, Tailwind CSS v4, TanStack Query v5, React Router v7, dan lucide-react untuk ikon. ESLint untuk lint, GitHub Actions untuk CI.

## Cara kerja

```
Halaman (pages/)
   │ memakai
   ▼
Hook TanStack Query (features/*/hooks.ts)  ── cache, loading, error, invalidasi
   │ memanggil
   ▼
Fungsi API bertipe (features/*/*-api.ts)
   │ memakai
   ▼
Klien HTTP (lib/api.ts)  ── Bearer token, ApiError, penanganan 401
```

- **Auth**: login mengembalikan token Sanctum, disimpan di `localStorage`. `AuthProvider` memuat data pengguna lewat `/me`. Token yang ditolak API (401) langsung mengakhiri sesi dan mengosongkan seluruh cache, supaya data pengguna lama nggak bocor ke pengguna berikutnya.
- **Route guard**: `RequireAuth`, `GuestOnly`, dan `RequireRole`. Halaman yang dituju sebelum login diingat, dan pengguna dikembalikan ke sana setelah login.
- **Aturan bisnis**: `features/tickets/workflow.ts` dan `features/kb/permissions.ts` mencerminkan aturan di API, hanya untuk menentukan tombol mana yang ditampilkan. Kalau API menolak (403 atau 422), pesannya ditampilkan apa adanya dan data diambil ulang supaya layar sesuai kondisi terbaru.
- **Tipe**: semua respons API diberi tipe di `types/api.ts`. Mode `strict` TypeScript menjaga bentuk datanya.

```
src/
  app/          router, layout, route guard, judul halaman
  components/   komponen UI bersama (ui, feedback, Modal, Pagination)
  features/     auth, tickets, notifications, dashboard, kb, admin
  lib/          klien API, token, format, label, perhitungan SLA, helper URL
  pages/        satu file per halaman
  types/        tipe respons API
```

## Menjalankan di lokal

Prasyarat: Node.js 20.19+ atau 22.12+, dan [helpdesk-api](https://github.com/Manfarisi/helpdesk-api) sudah berjalan (ikuti README-nya, lalu `php artisan serve`).

```bash
git clone https://github.com/Manfarisi/helpdesk-web.git
cd helpdesk-web
npm install
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:5173`. Alamat API diatur lewat `VITE_API_URL` di `.env.local` (default `http://localhost:8000/api`). Di Windows PowerShell, ganti `cp` dengan `Copy-Item`.

Untuk data demo yang lengkap, di repo API jalankan `php artisan migrate:fresh --seed --seeder=DemoSeeder`. Untuk melihat SLA berubah seiring waktu, jalankan juga `php artisan schedule:work`.

### Akun demo

Semua akun memakai password `password`.

| Email | Peran |
|---|---|
| `admin@helpdesk.test` | Admin |
| `agent1@helpdesk.test` | Agent |
| `requester1@helpdesk.test` | Requester |

Di halaman login ada tombol pintas untuk ketiga akun itu.

### Skrip

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server development |
| `npm run build` | Cek tipe (`tsc`) lalu build produksi |
| `npm run lint` | ESLint |
| `npm run preview` | Menjalankan hasil build secara lokal |

## CI

GitHub Actions menjalankan `npm run lint` dan `npm run build` (termasuk pengecekan tipe TypeScript strict) di setiap push dan pull request. Aturan bisnis diuji di sisi backend (lebih dari 200 test otomatis), jadi frontend fokus pada kebenaran tipe dan kualitas kode.

## Keputusan desain dan keterbatasan

- Token disimpan di `localStorage`. Itu umum untuk SPA dengan Bearer token, tapi rentan kalau ada celah XSS. Alternatifnya cookie `httpOnly`, yang butuh perubahan di sisi API.
- Belum ada test otomatis di frontend. Aturan bisnis diuji di backend, dan frontend dijaga oleh TypeScript strict dan ESLint.
- Notifikasi memakai polling 30 detik, bukan realtime. Panel menampilkan 10 notifikasi terbaru, belum ada halaman semua notifikasi.
- Isi artikel knowledge base berupa teks biasa, belum mendukung Markdown.
- Rentang tanggal di dashboard dan audit log mengikuti hari UTC (hari baru mulai pukul 07.00 WIB). Waktu lain ditampilkan dalam zona waktu browser.
- Audit log hanya menyimpan id target, jadi nama penanggung jawab lama yang akunnya sudah nonaktif tampil sebagai "Pengguna #id", dan artikel tampil sebagai "Artikel KB #id".
- Filter pelaku di audit log berisi 100 pengguna teratas. Untuk jumlah pengguna yang jauh lebih besar, filternya perlu berubah jadi pencarian.
- Tampilan berfokus pada desktop. Layar kecil didukung secara dasar (menu geser di bar atas dan tabel bisa digeser).
- Hanya satu bahasa (Indonesia) dan satu tema (terang).