# Scraping Job Post — Strategic Approach (Verified)

Target 4 platform: **LinkedIn**, **Kalibrr**, **Jobstreet**, **Dealls**

Tujuan: dapat job title, company name, description, location, salary range dari URL job post.

Berdasarkan hasil investigasi struktur HTML tiap platform.

---

## Approach Comparison

| Approach | Complexity | LinkedIn | Kalibrr | Jobstreet | Dealls | Notes |
|----------|-----------|----------|---------|-----------|--------|-------|
| **A. Direct HTTP fetch + HTML parse** | Rendah | ⚠️ (risiko blokir) | ✅ | ✅ | ✅ | Paling simpel, tapi gampang diblok |
| **B. JSON-LD extraction** | Rendah | ✅ | ✅ | ✅ | ❌ (sering absen) | Ambil `<script type="application/ld+json">` |
| **C. JSON from SSR script** | Rendah | — | — | ✅ `window.__SEEK_REDUX_STATE__` | ✅ `__NEXT_DATA__` | Data lengkap dari server-state |
| **D. OG / Meta tags** | Rendah | ✅ | ✅ | ✅ | ✅ | Data terbatas |
| **E. Headless browser (Puppeteer/Playwright)** | Sedang | ✅ (wajib) | ✅ | ✅ | ✅ | Tangani JS render + anti-bot |
| **F. Proxy rotation + fingerprint spoofing** | Tinggi | ✅ | ✅ | ✅ | ✅ | Pakai layanan seperti BrightData |
| **G. LLM-based extraction** | Sedang | ✅ | ✅ | ✅ | ✅ | Kirim raw HTML ke LLM → extract JSON |

---

## Per Platform

### LinkedIn

**Main blocker:** Anti-scraping sangat ketat — rate limiting, IP block, auth-wall, CAPTCHA. Setelah beberapa request, return 429 atau redirect ke login.

| Opsi | Work? | Effort | Maintain |
|------|-------|--------|----------|
| Direct fetch | ⚠️ Bisa (1-2 request) | Rendah | Risiko tinggi |
| JSON-LD | ✅ Ada di HTML awal | Rendah | Medium |
| OG / Meta tags | ✅ | Rendah | Medium |
| Puppeteer + stealth | ✅ | Medium | Medium |
| LinkedIn API | ✅ Reliable | Tinggi (approval) | Rendah |
| Proxy service (BrightData) | ✅ Reliable | Rendah (setup) | Rendah (bayar) |

**Sample JSON-LD:**
```json
{
  "title": "Software Engineer",
  "hiringOrganization": { "name": "Tech Company Inc." },
  "jobLocation": { "address": { "addressLocality": "Jakarta" } },
  "baseSalary": { "currency": "IDR", "value": { "minValue": "10000000", "maxValue": "20000000", "unitText": "MONTH" } }
}
```

**CSS Selector fallback:**
- Title: `h1.top-card-layout__title`
- Company: `a.topcard__org-name-link`
- Location: `span.topcard__flavor--bullet`
- Description: `div.show-more-less-html__markup`

**Recommendation:** Direct fetch + JSON-LD dengan proxy rotasi (residential). Kalau gagal → Puppeteer dengan cookie akun dummy (risiko banned). Prioritaskan JSON-LD karena DOM LinkedIn sering berubah & class di-obfuscate.

---

### Kalibrr (`kalibrr.com`)

**Perkiraan:** Relatif ramah scraper. Atribut `itemprop` (Schema.org) langsung di tag HTML.

| Opsi | Work? | Effort |
|------|-------|--------|
| Direct fetch | ✅ | Rendah |
| JSON-LD | ✅ | Rendah |
| `itemprop` attributes | ✅ | Rendah |

**Anti-bot:** Cloudflare WAF standard, rate limiting menengah.

**Sample JSON-LD:**
```json
{
  "title": "Backend Developer",
  "hiringOrganization": { "name": "PT Startup Sukses" },
  "jobLocation": { "address": { "addressLocality": "South Jakarta", "addressCountry": "ID" } }
}
```

**Selector fallback (via itemprop):**
- Title: `h1[itemprop="title"]`
- Company: `a[itemprop="name"]`
- Location: `a[itemprop="addressLocality"]`
- Description: `div[itemprop="description"]`

**Catatan:** Class CSS berupa hash (styled-components/Emotion) tapi `itemprop` tetap stabil.

**Recommendation:** Direct fetch + JSON-LD atau itemprop attributes. Paling mudah dari 4 platform.

---

### Jobstreet (`jobstreet.co.id`)

**Perkiraan:** Platform SEEK, React SPA. Tapi SSR untuk SEO — JSON-LD ada di HTML awal.

| Opsi | Work? | Effort |
|------|-------|--------|
| Direct fetch | ✅ (dapat SSR) | Rendah |
| JSON-LD | ✅ | Rendah |
| `window.__SEEK_REDUX_STATE__` | ✅ State awal di HTML | Rendah |
| `data-automation` selectors | ✅ | Rendah |

**Anti-bot:** Cloudflare/Akamai Bot Manager, cukup ketat jika request terlalu cepat.

**Sample JSON-LD:**
```json
{
  "title": "Fullstack Software Engineer",
  "hiringOrganization": { "name": "Global Tech" },
  "jobLocation": { "address": { "addressLocality": "Jakarta Raya", "addressCountry": "ID" } }
}
```

**Selector fallback (data-automation):**
- Title: `[data-automation="job-detail-title"]`
- Company: `[data-automation="advertiser-name"]`
- Location: `[data-automation="job-detail-location"]`
- Description: `[data-automation="jobAdDetails"]`

**Recommendation:** Prioritas 1 → JSON-LD. Prioritas 2 → extract dari `window.__SEEK_REDUX_STATE__` (script JSON di HTML). Prioritas 3 → `data-automation` selectors.

---

### Dealls (`dealls.com`)

**Perkiraan:** Next.js + Tailwind CSS. JSON-LD sering tidak lengkap. Data tersedia di `__NEXT_DATA__`.

| Opsi | Work? | Effort |
|------|-------|--------|
| Direct fetch | ✅ (Next.js SSR) | Rendah |
| JSON-LD | ❌ Sering absen/tidak lengkap | — |
| `__NEXT_DATA__` script | ✅ Data lengkap di JSON | Rendah |
| OG / Meta tags | ✅ | Rendah |

**Anti-bot:** Cloudflare / AWS WAF standard.

**Sample `__NEXT_DATA__`:**
```json
{
  "props": {
    "pageProps": {
      "job": {
        "title": "Data Analyst",
        "companyName": "Tech Nusantara",
        "location": "Jakarta Selatan",
        "salary_range": "8.000.000 - 15.000.000"
      }
    }
  }
}
```

**CSS Selector fallback:**
- Title: `h1.text-2xl.font-bold`
- Company: `p.text-gray-600.font-semibold`

**Catatan:** Class Tailwind bisa berubah. Prioritaskan `__NEXT_DATA__`.

**Recommendation:** Direct fetch + extract `<script id="__NEXT_DATA__">`. Jangan pakai CSS selector untuk data utama.

---

## Recommended Architecture

```
                      ┌─────────────────┐
                      │   URL Input      │
                      └────────┬────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Router by domain   │
                    │  linkedin.com    →  │
                    │  kalibrr.com     →  │
                    │  jobstreet.co.id →  │
                    │  dealls.com      →  │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
   │  JSON-LD    │    │  SSR Script  │    │  Proxy/      │
   │  Scraper    │    │  Extractor   │    │  Puppeteer   │
   └──────┬──────┘    └──────┬───────┘    └──────┬───────┘
          │                  │                    │
          └──────────────────┼────────────────────┘
                             ▼
                    ┌────────────────┐
                    │  Normalizer    │
                    │  → output      │
                    │  seragam       │
                    └────────────────┘
```

**Strategy per platform:**

| Platform | Primary | Fallback 1 | Fallback 2 |
|----------|---------|------------|------------|
| LinkedIn | Direct fetch + JSON-LD (dengan proxy rotasi) | Puppeteer + auth cookie | — |
| Kalibrr | Direct fetch + JSON-LD | `itemprop` attributes | — |
| Jobstreet | Direct fetch + JSON-LD | `window.__SEEK_REDUX_STATE__` | `data-automation` selectors |
| Dealls | Direct fetch + `__NEXT_DATA__` | Intercept API `/api/v1/jobs/...` | — |

---

## Output Schema (Normalized)

```typescript
interface ScrapedJob {
  title: string | null;
  companyName: string | null;
  companyLogo: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  description: string | null;
  employmentType: string | null;
  postedAt: string | null;
}
```

---

## Next Steps

1. **Phase 1** — Build scraper untuk 1 platform dulu (**Kalibrr** — paling mudah)
2. **Phase 2** — Tambah Jobstreet (JSON-LD + Redux state)
3. **Phase 3** — Tambah Dealls (`__NEXT_DATA__` extractor)
4. **Phase 4** — LinkedIn (JSON-LD + proxy rotasi / Puppeteer)
5. **Phase 5** — Normalizer, error handling, caching, queue


## Testing

1. LinkedIn - https://www.linkedin.com/jobs/view/4423566894
2. Kalibrr - https://www.kalibrr.com/c/first-digital-finance-corporation/jobs/266613/sales-associate-9
3. Jobstreet - https://id.jobstreet.com/id/job/87400340?ref=search-standalone&type=standard&origin=showNewTab#sol=785f5c41cba81ac007fc072d11a962bc8211a5cf
4. Dealls - https://dealls.com/loker/coding-teacher~itsmart