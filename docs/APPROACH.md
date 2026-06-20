# Approach — Minimalist Job Tracker (MVP)

Berdasarkan PRD_Minimalist_Job_Tracker_v3_StoryFocused.md dengan tambahan auth multi-user.

## Tech Stack

| Layer | Pilihan |
|-------|---------|
| Backend | NestJS (TypeScript) |
| Database | PostgreSQL via Prisma ORM |
| Frontend | React + Vite + Zustand + TailwindCSS |
| Auth | JWT (access token) via Passport.js |
| DnD | @dnd-kit |
| Package Manager | pnpm |

## Project Structure

```
cek_lamaran/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── register.dto.ts
│   │   │   │   └── login.dto.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── guards/
│   │   │       └── jwt-auth.guard.ts
│   │   ├── jobs/
│   │   │   ├── jobs.module.ts
│   │   │   ├── jobs.controller.ts
│   │   │   ├── jobs.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-job.dto.ts
│   │   │   │   └── update-status.dto.ts
│   │   │   └── parser/
│   │   │       └── smart-input.parser.ts
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts
│   │   └── main.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── JobInput.tsx
│   │   │   ├── JobCard.tsx
│   │   │   ├── JobList.tsx
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── ViewToggle.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   └── jobStore.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── api/
│   │   │   ├── auth.ts
│   │   │   └── jobs.ts
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── Layout.tsx
│   │   └── main.tsx
│   └── package.json
├── pnpm-workspace.yaml
└── package.json
```

## Database Schema

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  name         String?
  passwordHash String
  jobs         Job[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum JobStatus {
  APPLIED
  IN_PROGRESS
  REJECTED
  OFFERED
}

model Job {
  id            String    @id @default(uuid())
  companyName   String
  status        JobStatus @default(APPLIED)
  sourceUrl     String?
  description   String?
  companyDomain String?
  updatedAt     DateTime  @updatedAt
  userId        String
  user          User      @relation(fields: [userId], references: [id])
}
```

## API Endpoints

| Aksi | Method | Route | Auth | Body |
|------|--------|-------|------|------|
| Register | POST | `/api/auth/register` | No | `{ email, password, name? }` |
| Login | POST | `/api/auth/login` | No | `{ email, password }` |
| Get me | GET | `/api/auth/me` | Yes | — |
| Ambil semua job | GET | `/api/jobs` | Yes | — |
| Tambah job | POST | `/api/jobs` | Yes | `{ input, companyName? }` |
| Ubah status | PATCH | `/api/jobs/:id/status` | Yes | `{ status }` |
| Hapus job | DELETE | `/api/jobs/:id` | Yes | — |

Semua endpoint job hanya mengakses data milik user yang terautentikasi (dari JWT token).

## Smart Input Parser — Logika

```
INPUT string:
  - Diawali http:// / https:// / www. ?
    YES → simpan ke sourceUrl, parse domain → companyDomain.
           companyName = turunan domain jika user tidak isi manual.
           description = null.
    NO  → simpan ke description.
           sourceUrl = null, companyDomain = null.
           companyName = beberapa kata pertama jika user tidak isi manual.
  - URL gagal resolve? → fallback ke teks bebas (jangan error).
  - Status = APPLIED, updatedAt = now.
```

## Build Order

### Phase 1 — Backend: Auth
1. Scaffold NestJS project di `backend/`
2. Init Prisma + PostgreSQL: User model + Job model
3. Auth module (register, login, JWT strategy, guard)
4. CurrentUser decorator

### Phase 2 — Backend: Job CRUD
5. Jobs module (controller, service, DTO)
6. Smart input parser service
7. Endpoints: GET, POST, PATCH, DELETE (semua filter by userId)

### Phase 3 — Frontend: Auth
8. Scaffold Vite React project di `frontend/`
9. Install Zustand, TailwindCSS, @dnd-kit, react-router-dom
10. Auth store + Login/Register pages
11. ProtectedRoute + Layout + API client with JWT interceptor

### Phase 4 — Frontend: Job UI
12. Job store + API layer
13. JobInput + EmptyState components
14. JobCard + JobList view
15. KanbanBoard + KanbanColumn (drag-and-drop via @dnd-kit)
16. ViewToggle + DashboardPage integration

### Phase 5 — Verifikasi
17. Jalankan 10 skenario user story dari PRD Bagian 6
18. Test auth flow (register → login → protected routes)
19. Test persistence (restart server, data tetap ada)

## Out of Scope

- Fitur edit `companyDomain` / `description`
- Dark mode / i18n
- Pagination / infinite scroll
- Notifikasi (email/push)
- Refresh token rotation (cukup JWT sederhana untuk MVP)
- Role-based access (semua user setara)
