# Minimalist Job Tracker — MVP Feature Document

**Version:** 1.0 (MVP)
**Stack:** NestJS + TypeORM + PostgreSQL + React + Vite + Zustand + TailwindCSS + shadcn/ui

---

## 1. Auth System

| Fitur | Detail |
|-------|--------|
| Register | Email + password + nama opsional |
| Login | Email + password → JWT token |
| Session | Token disimpan di `localStorage`, auto-restore saat reload |
| Multi-user | Setiap user punya data job terpisah |
| Proteksi | Semua endpoint `/api/jobs/*` dan `/api/scrape` pake JWT guard |

---

## 2. Job Input

**Satu komponen input yang dipakai di halaman Active dan Wishlist.**

### Mode Link
- Auto-detect URL (`http://`, `https://`, `www.`)
- Tampil icon 🔗
- Tombol **"Check Detail"** → panggil scraper → autofill company + role
- Scraping **non-blocking** — user tetap bisa submit manual
- Gagal scraping → pesan info, user isi manual

### Mode Teks
- Auto-detect teks biasa
- Tampil icon 📝
- Kata pertama jadi default company name (dipotong 3 kata + "...")
- Tidak ada tombol Check Detail

### Fields
- **Input utama** (link atau teks)
- **Nama perusahaan** (opsional, auto-fill dari scraper)
- **Posisi / role** (opsional, auto-fill dari scraper)

---

## 3. Status Pipeline

| Status | Label | Final? | Keterangan |
|--------|-------|--------|------------|
| WISHLIST | Wishlist | ❌ | Halaman terpisah. Apply → pindah ke Active |
| APPLIED | Applied | ❌ | Lamaran sudah dikirim |
| IN_PROGRESS | In Progress | ❌ | Ada perkembangan (interview, dll) |
| REJECTED | Rejected | ✅ | Final. Tidak bisa diubah lagi |
| OFFERED | Offered | ✅ | Final. Tidak bisa diubah lagi |

**Resolve Note:** Saat pindah ke REJECTED/OFFERED, wajib isi note:
- REJECTED → dialog merah, placeholder "Catat alasan reject"
- OFFERED → dialog hijau, placeholder "Catat detail offer"
- Note otomatis diberi tag `rejected` / `offered` (tampil beda di detail modal)

---

## 4. Tampilan

### List View
- Satu baris per job
- Kolom: company, role, status badge, waktu relatif, dropdown status, tombol hapus
- **Filter by status** — All / Applied / In Progress / Rejected / Offered
- **Sort by** — Terbaru (default) / Terlama / Status A-Z

### Kanban View
- 4 kolom: Applied / In Progress / Rejected / Offered
- Drag & drop antar kolom untuk ubah status
- **Lock:** REJECTED/OFFERED tidak bisa di-drag
- Setiap kartu: company, role, domain/description

### View Toggle
- Tombol List ⟷ Kanban
- State tersimpan di Zustand (tidak hilang saat navigasi)

---

## 5. Wishlist Page (`/wishlist`)

- Route terpisah dari Dashboard
- Input sharing (sama dengan halaman Active)
- Tombol "Apply" → pindahkan job ke Active (status APPLIED)
- Tombol hapus
- Data ter-load otomatis saat page mount (`useEffect`)

---

## 6. Detail Modal

Akses via tombol `Eye` di List card atau Kanban card.

### Fitur
- **Edit** company name & role
- **Lihat status** — dropdown (jika tidak final) atau badge (jika final)
- **Domain** & **source URL** (link eksternal)
- **Deskripsi awal** (dari input teks)
- **Catatan multi-per-job** — add/delete, mirip komentar
- **Tagged notes** — REJECTED (✕ merah), OFFERED (✓ hijau) tampil dengan background berbeda
- **Auto-reset state** — pakai `key={job.id}` untuk menghindari bug data tertukar

---

## 7. Notes System

Backend entity terpisah: `Note` dengan field `id`, `content`, `tag`, `jobId`.

| Tag | Konteks | Visual |
|-----|---------|--------|
| `null` | Catatan biasa | Background `bg-muted/50` |
| `rejected` | Saat resolve REJECTED | Background merah, badge ✕ |
| `offered` | Saat resolve OFFERED | Background hijau, badge ✓ |

---

## 8. Smart Input Parser (Backend)

Parser otomatis saat user submit job:

### URL Input
- Ekstrak domain → `companyDomain` (e.g., `careers.google.com` → `google.com`)
- Domain → company name (e.g., `google.com` → `Google`)
- User override: jika `companyName` diisi manual, pakai punya user
- LinkedIn URL pattern: `/company/google/` → company "Google"

### Text Input
- Simpan ke `description`
- Potongan awal → company name (max 3 kata + "...")
- User override tetap diprioritaskan

---

## 9. Scraper System

**Endpoint:** `POST /api/scrape` (JWT-protected)

| Platform | Method | Status | Data |
|----------|--------|--------|------|
| Kalibrr | `__NEXT_DATA__` | ✅ | title, company, description, location, salary |
| Jobstreet | `SEEK_REDUX_DATA` | ✅ | title, company, location, description |
| Dealls | JSON-LD `JobPosting` | ✅ | title, company, location, employment type |
| LinkedIn | — | ❌ | Butuh Puppeteer |

**Flow:** Frontend klik "Check Detail" → backend fetch + parse → return data → autofill form.
**Error handling:** Gagal → pesan non-blocking → user isi manual.

---

## 10. Resolve Note Dialog

Dialog yang muncul saat user pindahkan job ke REJECTED atau OFFERED.

| Status | Warna | Placeholder |
|--------|-------|-------------|
| REJECTED | Merah (`destructive`) | "Catat alasan reject..." |
| OFFERED | Hijau (`default`) | "Catat detail offer..." |

**Aksi:** Konfirmasi → update status + simpan note + refresh data.

---

## 11. Onboarding Popup

Muncul **pertama kali user login**. Cek localStorage key `jobtracker_onboarding_done`.

- Menjelaskan status pipeline
- Menjelaskan List vs Kanban view
- Tombol "Mulai" untuk dismiss
- Bisa dipanggil lagi via tombol `?` di header

---

## 12. UI Components (shadcn/ui + Lucide)

| Component | Lokasi | Fungsi |
|-----------|--------|--------|
| `Button` | `components/ui/button.tsx` | Variants: default, destructive, outline, ghost, secondary |
| `Input` | `components/ui/input.tsx` | Styling konsisten |
| `Badge` | `components/ui/badge.tsx` | Status badge (secondary/default/destructive/outline) |
| `Card` | `components/ui/card.tsx` | Card + CardHeader + CardTitle + CardContent |
| `Dialog` | `components/ui/dialog.tsx` | Modal overlay (delete confirm, resolve, detail) |
| `Select` | `components/ui/select.tsx` | Native select dengan styling (diganti custom di JobCard) |

**Icons:** Lucide — Briefcase, Heart, LogOut, Plus, Trash2, Eye, ExternalLink, Link, FileText, Search, Loader2, AlertCircle, ArrowUpDown, GripVertical, X, CheckCircle, ArrowRight, HelpCircle, Columns3, List, Save, dll.

---

## 13. API Endpoints

| Method | Route | Auth | Fungsi |
|--------|-------|------|--------|
| POST | `/api/auth/register` | ❌ | Register user |
| POST | `/api/auth/login` | ❌ | Login, dapat JWT |
| GET | `/api/auth/me` | ✅ | Profil user |
| GET | `/api/jobs` | ✅ | List semua job (urut updatedAt DESC) |
| GET | `/api/jobs/:id` | ✅ | Detail job + notes |
| POST | `/api/jobs` | ✅ | Create job (smart input parsing) |
| PATCH | `/api/jobs/:id/status` | ✅ | Update status |
| PATCH | `/api/jobs/:id` | ✅ | Update company/role |
| DELETE | `/api/jobs/:id` | ✅ | Delete job |
| POST | `/api/jobs/:id/resolve` | ✅ | Update status + add tagged note |
| POST | `/api/jobs/:id/notes` | ✅ | Add note |
| PATCH | `/api/jobs/notes/:noteId` | ✅ | Edit note |
| DELETE | `/api/jobs/notes/:noteId` | ✅ | Delete note |
| POST | `/api/scrape` | ✅ | Scrape job detail dari URL |

---

## 14. Database Schema

### User
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| email | VARCHAR | Unique |
| name | VARCHAR | Nullable |
| passwordHash | VARCHAR | bcrypt |
| createdAt | TIMESTAMP | Auto |
| updatedAt | TIMESTAMP | Auto |

### Job
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| companyName | VARCHAR | — |
| role | VARCHAR | Nullable |
| status | VARCHAR | Default: APPLIED |
| sourceUrl | VARCHAR | Nullable |
| description | TEXT | Nullable |
| companyDomain | VARCHAR | Nullable |
| updatedAt | TIMESTAMP | Auto-update |
| userId | UUID | FK → User |

### Note
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| content | TEXT | — |
| tag | VARCHAR | Nullable: rejected/offered |
| createdAt | TIMESTAMP | Auto |
| updatedAt | TIMESTAMP | Auto |
| jobId | UUID | FK → Job (CASCADE) |

---

## 15. Non-Features (Out of Scope)

- Pagination / infinite scroll
- Dark mode / i18n
- Notifikasi (email/push)
- Edit `companyDomain` / `description` setelah submit
- Role-based access
- Refresh token rotation
- LinkedIn scraping (butuh Puppeteer)

---

## 16. Cara Jalanin

### Backend
```bash
cd backend
# Pastikan PostgreSQL jalan (Docker atau lokal)
pnpm install
pnpm run start:dev   # http://localhost:3001
```

### Frontend
```bash
cd frontend
pnpm install
pnpm run dev         # http://localhost:5173
```

### Docker PostgreSQL
```bash
docker run -d --name job-tracker-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=Admin123$ \
  -e POSTGRES_DB=job_tracker \
  -p 5433:5432 \
  postgres:16
```

### Environment (backend/.env)
```
DATABASE_URL=postgresql://postgres:Admin123$@localhost:5433/job_tracker
JWT_SECRET=<your-secret>
JWT_EXPIRATION=7d
```
