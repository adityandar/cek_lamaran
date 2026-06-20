# CekLamaran — Deployment (Docker)

## Prasyarat

- Ubuntu server dengan Docker & Docker Compose terinstall
- Domain (opsional, untuk HTTPS)

## Persiapan

```bash
# Clone / copy project ke server
cd /opt/ceklamaran

# Copy & edit .env
cp .env.example .env
nano .env
# Isi DB_PASSWORD dan JWT_SECRET (wajib diganti!)
```

## Cara pakai

```bash
# Build & jalanin semua service
docker compose up -d

# Cek status
docker compose ps

# Lihat log
docker compose logs -f

# Stop semua
docker compose down
```

Akses: via Cloudflare Tunnel → domain kamu. `cloudflared` di host pointing ke `http://localhost:8080` (frontend container di port 8080).

## Arsitektur

```
Browser ──:80──▶ Nginx ── /api/* ──▶ Backend:3001
                    │
                    └── /assets/* ──▶ Static files
                                          │
                                   Backend ──▶ PostgreSQL:5432
```

Semua service dalam 1 network (`ceklamaran`), backend & postgres tidak terekspos ke luar.

## Env vars (`.env`)

| Variable | Contoh | Wajib? |
|----------|--------|--------|
| `DB_PASSWORD` | `Admin123$` | ✅ ganti pake password kuat |
| `JWT_SECRET` | `minimal-32-karakter-random-string` | ✅ ganti pake string acak |

## Update

```bash
git pull                            # pull code terbaru
docker compose build --no-cache     # rebuild dari awal
docker compose up -d                # restart pakai image baru
```
