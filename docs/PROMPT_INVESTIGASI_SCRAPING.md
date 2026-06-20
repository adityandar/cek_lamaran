# Prompt: Investigasi Struktur 4 Platform Job Post

Kirim prompt ini ke AI Agent (Claude Code, ChatGPT, dll) untuk menganalisis struktur HTML tiap platform.

---

## Tugas

Kunjungi job post URL dari 4 platform berikut, analisis struktur HTML-nya, dan laporkan apa yang bisa diekstrak beserta metodenya. Fokus pada data yang diperlukan: **job title**, **company name**, **location**, **salary**, **description**.

## Platform & URL Sample

1. **LinkedIn** — cari job post publik di LinkedIn (bisa lewat Google Search `site:linkedin.com/jobs/view "software engineer"`)
2. **Kalibr** — `https://www.kalibrr.com/job-post/example` (cari job post real)
3. **Jobstreet** — `https://www.jobstreet.co.id/id/job/example` (cari job post real)
4. **Dealls** — `https://dealls.com/jobs/example` (cari job post real)

## Yang Harus Dicek Per Platform

### 1. Bisa Direct Fetch?
Coba fetch URL dengan `fetch()` atau `curl` tanpa auth. Apakah return HTML lengkap?

```bash
curl -s -A "Mozilla/5.0" "URL_JOB_POST" | head -200
```

- ✅ Ya (dapat HTML) → Lanjut ke analisis HTML
- ❌ Tidak (403/block/tidak ada konten) → Butuh headless browser

### 2. JSON-LD (Structured Data)
Cari `<script type="application/ld+json">` di HTML. Parsing JSON-nya. Biasanya berisi semua data job.

```javascript
// Regex untuk extract JSON-LD
/<script type="application\/ld\+json">(.+?)<\/script>/s
```

Yang perlu dicek:
- Apakah ada `JobPosting` schema?
- Field apa saja yang tersedia? (`title`, `hiringOrganization.name`, `jobLocation`, `baseSalary`, dll)

### 3. Open Graph / Meta Tags
Cari `<meta property="og:*">` dan `<meta name="*">` tags.

```html
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta name="description" content="...">
```

### 4. Selector CSS Utama (Kalau JSON-LD Tidak Ada)
Identifikasi selector unik untuk data penting:
- Judul job
- Nama perusahaan
- Lokasi
- Deskripsi (biasanya di `<div class="job-description">`)

### 5. Anti-Bot Detection
- Apakah ada Cloudflare/hCAPTCHA?
- Apakah ada rate limiting?
- Apakah perlu cookie/session?

## Output yang Diharapkan

Buat laporan per platform dengan format berikut:

```markdown
## Platform: [nama]

**Direct fetch:** ✅/❌
**JSON-LD:** ✅/❌
**OG Tags:** ✅/❌
**CSS selectors:** ✅/❌
**Anti-bot:** [Cloudflare/CAPTCHA/none]

### Sample data dari JSON-LD (kalau ada):
```json
{
  "title": "...",
  "company": "...",
  "location": "...",
  "salary": "..."
}
```

### Sample selectors (kalau JSON-LD tidak ada):
- Title: `h1.job-title`
- Company: `.company-name`
- Location: `[data-aut-id="jobLocation"]`
- Description: `.job-description`

### Catatan:
[Insight / kesulitan / saran approach]
```

## Tujuan Akhir

Dari hasil investigasi ini kita akan memutuskan strategi scraping per platform:

| Platform | Primary Method | Fallback |
|----------|---------------|----------|
| LinkedIn | ? | ? |
| Kalibr | ? | ? |
| Jobstreet | ? | ? |
| Dealls | ? | ? |

