# Scraping Exploration Report

**Tanggal:** 21 Juni 2026
**Tujuan:** Uji coba (proof of concept) scraping job post details dari 4 platform: LinkedIn, Kalibrr, Jobstreet, Dealls

---

## Executive Summary

Dari 4 platform yang diuji, **3 platform berhasil diekstrak datanya** menggunakan direct HTTP fetch + parsing server-side data. Satu platform (LinkedIn) membutuhkan pendekatan headless browser karena halaman job post-nya adalah React SPA murni tanpa SSR.

| Platform | Status | Method | Kelengkapan Data |
|----------|--------|--------|------------------|
| Kalibrr | ✅ Berhasil | `__NEXT_DATA__` | Sangat lengkap |
| Jobstreet | ✅ Berhasil | `window.SEEK_REDUX_DATA` | Lengkap |
| Dealls | ✅ Berhasil | JSON-LD `JobPosting` | Cukup |
| LinkedIn | ❌ Gagal | — | Hanya meta tags (tidak terstruktur) |

---

## Methodology

Endpoint PoC: `POST /api/scrape` menerima `{ url: string }` dan mengembalikan data job terstruktur.

Alur:
1. Fetch HTML dengan `User-Agent` browser modern
2. Route by domain ke scraper spesifik platform
3. Ekstrak data dari sumber SSR (Next.js / Redux / JSON-LD)
4. Normalisasi ke output seragam

---

## Per Platform

### 1. Kalibrr (`kalibrr.com`)

**Teknik:** `__NEXT_DATA__` (Next.js SSR)

Kalibrr menggunakan Next.js. Semua data halaman tersedia di tag:
```html
<script id="__NEXT_DATA__" type="application/json">...</script>
```

**Struktur data:**
```
__NEXT_DATA__.props.pageProps.job
  ├── name              → "Sales Associate" (job title)
  ├── company.name      → "Billease"
  ├── description       → HTML deskripsi lengkap
  ├── googleLocation    → object lokasi { formattedAddress, city, country }
  ├── salaryShown       → string range gaji (e.g. "₱16,000 - ₱18,000")
  ├── maximumSalary     → number
  ├── salaryCurrency    → "PHP"
  ├── workExperience    → level pengalaman
  └── employmentType    → tipe pekerjaan
```

**Hasil test:**
```json
{
  "source": "next_data",
  "title": "Sales Associate",
  "companyName": "Billease",
  "description": "Industry: Retail Credit...",
  "location": { "formattedAddress": "Baguio, Benguet, Philippines" },
  "salaryMin": 16000,
  "salaryMax": null,
  "salaryCurrency": "PHP"
}
```

**Reliability:** ✅ Sangat tinggi. `__NEXT_DATA__` adalah bagian inti Next.js untuk hydrasi. Format ini akan tetap stabil selama Kalibrr menggunakan Next.js.

**Anti-bot:** Cloudflare WAF standard. Rate limiting ringan-sedang.

---

### 2. Jobstreet (`id.jobstreet.com`)

**Teknik:** `window.SEEK_REDUX_DATA` (SEEK internal state)

Jobstreet (platform SEEK) tidak memiliki JSON-LD `JobPosting`. Sebagai gantinya, state Redux di-render ke HTML:
```html
<script>window.SEEK_REDUX_DATA = {...};</script>
```

**Struktur data:**
```
SEEK_REDUX_DATA.jobdetails.result.job
  ├── title              → "Supply Strategy Senior Manager"
  ├── advertiser.name    → "PT GOTO GOJEK TOKOPEDIA TBK"
  ├── location.label     → "Jakarta Raya"
  ├── content            → HTML deskripsi (clean)
  ├── salary             → object salary (nullable)
  ├── workTypes          → array tipe kerja
  ├── listedAt           → timestamp
  └── classifications    → kategori pekerjaan
```

**Hasil test:**
```json
{
  "source": "seek_redux",
  "title": "Supply Strategy Senior Manager",
  "companyName": "PT GOTO GOJEK TOKOPEDIA TBK",
  "location": "Jakarta Raya",
  "description": "About the Role\n\nWe're looking for a Senior..."
}
```

**Reliability:** ✅ Tinggi. Nama variabel (`SEEK_REDUX_DATA`) dan struktur data (`jobdetails`) relatif stabil karena merupakan internal state management platform SEEK.

**Anti-bot:** Cloudflare/Akamai Bot Manager. Beberapa request dari IP berbeda terhalang (HTTP 403). Fetch dari NestJS (Node.js) berhasil.

---

### 3. Dealls (`dealls.com`)

**Teknik:** JSON-LD `JobPosting`

Dealls menyematkan data job dalam format JSON-LD untuk keperluan Google Jobs SEO:
```html
<script type="application/ld+json" data-next-head="">{...}</script>
```

**Struktur data:**
```
JSON-LD JobPosting
  ├── title              → "Coding Teacher"
  ├── hiringOrganization.name → "IT SMART SOLUSI EDUKASI"
  ├── jobLocation.address.addressLocality → "Sidoarjo Regency"
  ├── description        → HTML entities (perlu decode)
  └── employmentType     → ["FULL_TIME"]
```

**Hasil test:**
```json
{
  "source": "jsonld",
  "title": "Coding Teacher",
  "companyName": "IT SMART SOLUSI EDUKASI",
  "description": "&lt;p&gt;Bergabunglah dengan tim kami...",
  "location": "Sidoarjo Regency",
  "employmentType": ["FULL_TIME"]
}
```

**Catatan:** Deskripsi mengandung HTML entities (`&lt;`, `&gt;`, dll). Perlu di-decode sebelum ditampilkan.

**Reliability:** ✅ Cukup. JSON-LD untuk SEO Google Jobs umumnya stabil. Tapi tidak semua halaman job Dealls memiliki JSON-LD yang konsisten.

**Anti-bot:** Cloudflare / AWS WAF standard.

---

### 4. LinkedIn (`linkedin.com`)

**Teknik:** Tidak ada data terstruktur di SSR

LinkedIn halaman job post (`/jobs/view/...`) adalah **React SPA murni**. Server hanya mengirim HTML shell kosong + JavaScript bundle.

**Bukti:**
- HTML length: ~270KB (terutama JS bundles)
- JSON-LD count: **0**
- Tidak ada `__NEXT_DATA__`, `window.__INITIAL_STATE__`, atau variabel SSR lainnya
- Meta tags `og:title` dan `og:description` tersedia (data minimal dari halaman sebelumnya)

**Hasil test:**
```json
{
  "source": "meta",
  "title": "Odixcity Consulting hiring Mobile App Developer in Indonesia | LinkedIn",
  "description": "Posted 9:18:56 PM. Job Title: Mobile App Developer..."
}
```

**Kesimpulan:** LinkedIn membutuhkan:
1. **Headless browser** (Puppeteer/Playwright) dengan akun dummy — untuk merender JavaScript dan mengekstrak data dari DOM
2. **LinkedIn API resmi** — jika ada akses
3. **Proxy service** (BrightData, ScrapingBee) — sebagai alternatif berbayar

---

## Perbandingan Data yang Berhasil Diekstrak

| Field | Kalibrr | Jobstreet | Dealls | LinkedIn |
|-------|---------|-----------|--------|----------|
| Title | ✅ | ✅ | ✅ | ❌ (dari meta) |
| Company | ✅ | ✅ | ✅ | ❌ |
| Location | ✅ (object) | ✅ | ✅ | ❌ |
| Description | ✅ (HTML) | ✅ (clean) | ✅ (HTML entities) | ❌ |
| Salary | ✅ | ❌ (null) | ❌ | ❌ |
| Employment type | ❌ | ✅ | ✅ | ❌ |

---

## Rekomendasi

1. **Integrasi langsung** — Kalibrr, Jobstreet, Dealls siap diintegrasikan ke job creation flow. Cukup panggil endpoint `/api/scrape` sebelum create job untuk auto-fill field.

2. **LinkedIn** — Butuh pengembangan lanjutan:
   - Prioritaskan **Puppeteer + stealth plugin** (gratis, effort sedang)
   - Alternatif: **BrightData** (berbayar, zero maintenance)

3. **Normalisasi output** — Perlu standardisasi format:
   - Location: string (bukan object)
   - Description: clean text (bukan HTML)
   - Salary: number (bukan string range)
   - HTML entities di-decode

4. **Error handling** — Scraper harus graceful fallback: kalau data SSR tidak ditemukan, jangan error. User tetap bisa isi manual.
