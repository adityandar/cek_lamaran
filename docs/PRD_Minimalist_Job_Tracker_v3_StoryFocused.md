# Product Requirements Document (PRD)
## Blueprint Pengembangan Mandiri Berbasis Agentic AI / Vibe Coding

**Nama Proyek:** Minimalist Job Tracker (MVP - Fase 1)
**Target Stack:** React (TS) + NestJS (TS)
**Tujuan Dokumen:** Panduan instruksi untuk AI Code Agent — fokus pada *apa* yang harus dibangun (story & requirement), bukan *bagaimana* detail teknis diimplementasikan
**Metode Dev:** Full AI / Vibe Coding (Zero Boilerplate Manual)
**Versi:** 3.0 (Story-Focused — teknis diserahkan ke AI Agent)
**Tanggal Kunci:** Juni 2026

> **Catatan Revisi v3.0:** Versi ini menghapus preskripsi teknis berlebihan (versi package, pseudocode, port, CORS, nama library spesifik) dari v2.0. AI Code Agent bebas menentukan detail implementasi selama hasil akhirnya memenuhi kontrak data, alur cerita (user story), dan kriteria penerimaan di dokumen ini. Satu keputusan produk yang diubah: **penyimpanan data wajib persistent**, tidak lagi in-memory.

---

## 1. Ringkasan Eksekutif & Prinsip Non-Negotiable

Dokumen ini adalah instruksi bagi AI Agent (Cursor, Devin, Claude Code, dll) untuk membangun aplikasi secara utuh tanpa intervensi arsitektur manual dari manusia. Prioritas produk: **low-friction input** (pencatatan di bawah 10 detik) dan **high-level awareness** (status lamaran terlihat sekilas).

**Aturan mutlak untuk AI Agent:**

1. Jangan membuat fitur, halaman, formulir pop-up, atau relasi data tambahan di luar dokumen ini.
2. Gunakan TypeScript end-to-end (frontend & backend).
3. Untuk hal yang tidak diatur eksplisit di dokumen ini (struktur file detail, library pendukung, validasi, port, dsb), **AI Agent bebas memilih solusi paling umum/standar** di ekosistem React + NestJS, selama konsisten dengan Bagian 8 (Non-Functional Constraints).
4. Tidak ada autentikasi/multi-user pada Fase 1 — aplikasi single-user.

---

## 2. Arsitektur Proyek (Garis Besar)

Pisahkan proyek menjadi dua bagian:

- **`backend/`** — NestJS, menyediakan REST API untuk data pekerjaan (`job`), termasuk logika smart-parsing.
- **`frontend/`** — React (Vite) + Zustand untuk state management, TailwindCSS untuk styling.

Struktur folder detail (penamaan file, sub-folder DTO, dsb) **boleh ditentukan AI Agent sendiri** mengikuti konvensi standar NestJS (module/controller/service) dan React (components/store), selama pemisahan tanggung jawab ini terjaga.

---

## 3. Kontrak Data (Single Source of Truth)

Tipe data berikut **wajib** dipakai persis seperti ini di frontend maupun backend — ini satu-satunya bagian yang bersifat kontrak ketat, karena menentukan bentuk informasi yang disimpan produk:

```typescript
export type JobStatus = 'APPLIED' | 'IN_PROGRESS' | 'REJECTED' | 'OFFERED';

export interface Job {
  id: string;
  companyName: string;
  status: JobStatus;
  sourceUrl: string | null;       // diisi jika input berupa tautan
  description: string | null;     // diisi jika input berupa teks bebas
  companyDomain: string | null;   // hasil ekstraksi otomatis dari URL, fondasi Fase 2
  updatedAt: string;              // ISO timestamp
}
```

---

## 4. Spesifikasi Backend (Perilaku, Bukan Implementasi)

### 4.1 Endpoint yang Dibutuhkan

| Aksi | Method | Route | Catatan |
|---|---|---|---|
| Ambil semua job | GET | `/api/jobs` | Urut dari yang terbaru diubah |
| Tambah job baru | POST | `/api/jobs` | Body: `{ input, companyName? }` — lihat 4.2 |
| Ubah status job | PATCH | `/api/jobs/:id/status` | Body: `{ status }` |
| Hapus job | DELETE | `/api/jobs/:id` | — |

Detail kode HTTP, struktur error response, dan validasi DTO **diserahkan ke AI Agent** mengikuti praktik standar NestJS, dengan syarat: request tidak valid tidak boleh membuat server crash, dan id yang tidak ditemukan harus direspons dengan jelas (bukan silent fail).

### 4.2 Smart Input Parsing (Aturan Bisnis Inti)

Ini adalah fitur utama produk, jadi perilakunya harus tepat — caranya bebas:

- Jika `input` berupa **tautan** (diawali `http://`, `https://`, atau `www.`):
  - Simpan ke `sourceUrl`.
  - Ekstrak nama domain perusahaan (mis. dari `careers.google.com` → `google.com`) dan simpan ke `companyDomain`.
  - Jika `companyName` tidak diisi user, turunkan nama default dari domain (mis. "Google").
  - `description` diisi `null`.
- Jika `input` berupa **teks bebas** (bukan tautan):
  - Simpan ke `description`. `sourceUrl` dan `companyDomain` diisi `null`.
  - Jika `companyName` tidak diisi user, ambil beberapa kata pertama dari teks sebagai nama default (cukup ringkas, beri tanda "..." bila teks dipotong).
- Jika sebuah string "terlihat seperti" tautan tapi ternyata tidak valid saat diproses, **jangan sampai request gagal total** — fallback ke perlakuan sebagai teks bebas.
- Job baru selalu mulai dengan status `APPLIED` dan `updatedAt` waktu saat ini.

### 4.3 Penyimpanan Data — Wajib Persistent

Data **harus tersimpan secara permanen** dan tidak boleh hilang ketika server di-restart atau di-deploy ulang. AI Agent bebas memilih teknologi penyimpanan yang paling sesuai untuk konteks proyek (misalnya **PostgreSQL**, **SQLite**, **MySQL**, atau opsi lain yang umum dipakai bersama NestJS), termasuk bebas memilih ORM/query builder-nya sendiri.

Yang penting:
- Skema penyimpanan mengikuti kontrak data di Bagian 3.
- Data tetap konsisten dan dapat diambil kembali setelah aplikasi di-restart.

---

## 5. Spesifikasi Frontend (Perilaku & Alur, Bukan Implementasi)

### 5.1 State yang Dibutuhkan (Zustand)

Frontend harus mampu, secara konseptual (penamaan variabel/fungsi bebas ditentukan AI Agent):

- Menyimpan daftar job dan mode tampilan aktif (`LIST` atau `KANBAN`).
- Mengambil data dari backend saat aplikasi dibuka.
- Menambah job baru.
- Mengubah status job.
- **Menghapus job** — ini sempat terlewat di draft awal: endpoint `DELETE` sudah ada di backend tapi harus benar-benar dipakai dari UI.
- Memberi tahu user saat data sedang dimuat atau saat terjadi kegagalan koneksi ke backend (tidak boleh UI diam saja/freeze tanpa penjelasan).

### 5.2 Komponen & Alur Tampilan

1. **Form input cepat** di bagian atas: satu kolom besar untuk paste link/ketik catatan, satu kolom kecil opsional untuk nama perusahaan, dan tombol tambah yang nonaktif jika input kosong.
2. **Toggle tampilan** List ⟷ Kanban di area kontrol.
3. **Tampilan List**: daftar padat satu baris per job — nama perusahaan, cuplikan deskripsi/tautan, waktu relatif yang manusiawi (mis. "2 jam lalu", "Kemarin"), dropdown untuk ubah status, dan aksi hapus.
4. **Tampilan Kanban**: 4 kolom sesuai `JobStatus`, kartu job bisa di-drag antar kolom untuk mengubah status.
5. Komponen kartu job sebaiknya digunakan ulang di kedua tampilan (baris di List, kartu di Kanban) agar konsisten — detail implementasi bebas.
6. Tautan eksternal harus dibuka di tab baru dengan cara yang aman.
7. Saat belum ada job sama sekali, tampilkan pesan kosong yang ramah, bukan layar kosong tanpa konteks.

---

## 6. User Story Lengkap (Alur End-to-End)

Untuk memastikan cerita produk tercover penuh, berikut skenario yang harus berfungsi mulus:

1. **Pertama kali buka app** → user melihat daftar job kosong dengan pesan ramah, dan form input siap dipakai.
2. **Paste link lowongan** (mis. dari LinkedIn/careers page) tanpa isi nama perusahaan → klik tambah → job langsung muncul di daftar dengan nama & domain perusahaan otomatis terisi, status `APPLIED`, dalam waktu kurang dari 10 detik.
3. **Ketik catatan manual** (mis. "Interview HR PT Maju Jaya besok jam 10") tanpa isi nama perusahaan → job muncul dengan nama default dari potongan teks tersebut.
4. **Isi nama perusahaan manual** saat menambah job (baik via link maupun teks) → nama yang diisi user yang dipakai, bukan hasil otomatis.
5. **Ubah status job** lewat dropdown di List, atau drag kartu ke kolom lain di Kanban → status berubah dan waktu update ter-refresh, konsisten di kedua tampilan.
6. **Beralih List ⟷ Kanban** → data yang sama tetap tampil, tidak ada yang hilang/duplikat.
7. **Hapus job** yang salah catat atau tidak relevan → job hilang dari daftar setelah konfirmasi singkat.
8. **Tutup aplikasi / restart server, lalu buka lagi nanti** → semua job yang sudah dicatat sebelumnya masih ada (bukti penyimpanan persistent berjalan).
9. **Backend sedang tidak bisa diakses** (mis. mati/network error) → frontend menampilkan pesan bahwa ada masalah koneksi, bukan crash atau layar putih.
10. **Coba tambah job dengan input kosong** → tombol tambah tidak bisa diklik, tidak ada request yang terkirim.

---

## 7. Non-Functional Constraints (Eksplisit Out-of-Scope)

Agar AI Agent tidak berimprovisasi menambah scope:

- Tidak ada autentikasi/login/multi-user.
- Tidak ada pagination/infinite scroll (jumlah job diasumsikan kecil untuk MVP).
- Tidak ada notifikasi (email/push).
- Tidak ada dark mode, tidak ada i18n/multi-bahasa UI.
- Tidak ada fitur edit manual untuk `companyDomain`/`description` setelah job dibuat — hanya status yang bisa diubah, atau dihapus jika salah.

---

## 8. Definition of Done — Checklist Cerita (Bukan Checklist Teknis)

- [ ] Semua skenario di Bagian 6 (User Story Lengkap) berjalan tanpa error.
- [ ] Job dengan input tautan otomatis terisi nama & domain perusahaan dengan benar.
- [ ] Job dengan input teks bebas otomatis dapat nama default yang masuk akal.
- [ ] Status job bisa diubah dari kedua tampilan (List & Kanban) dan saling konsisten.
- [ ] Job bisa dihapus dan benar-benar hilang dari daftar.
- [ ] Data tetap ada setelah server/aplikasi di-restart.
- [ ] Tidak ada crash atau layar kosong tak terjelaskan saat backend bermasalah atau data masih kosong.

---

## 9. Instruksi Eksekusi untuk Code-Agent

**Langkah 1 — Backend:**
> "Buat backend NestJS sesuai kontrak data di Bagian 3 dan spesifikasi perilaku di Bagian 4, termasuk smart input parsing dan penyimpanan data yang persistent. Pilih teknologi database dan struktur file yang paling sesuai menurut praktik standar."

**Langkah 2 — Frontend:**
> "Setelah backend berjalan, buat frontend React + TypeScript + TailwindCSS + Zustand sesuai Bagian 5, yang mencakup seluruh alur user story di Bagian 6 — termasuk fitur hapus job yang harus benar-benar terhubung ke backend."

**Langkah 3 — Verifikasi:**
> "Jalankan backend dan frontend, lalu telusuri satu per satu skenario di Bagian 6 dan checklist di Bagian 8. Laporkan skenario mana yang belum berfungsi sebelum menyatakan implementasi selesai."
