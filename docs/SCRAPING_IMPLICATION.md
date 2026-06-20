Berdasarkan hasil eksplorasi metode scraping, menurut ku masih belum cukup reliable. Jadi approach untuk MVP yang aku kepikiran adalah membuat mekanisme untuk pertama, user input dulu linknya. Kemudian ada button untuk check detail, langsung autofill company dan rolenya. Kalau gagal tampilkan tidak berhasil dan encourage user untuk manual fill. Mekanisme ini perlu dibuat yang paling tidak membingungkan, dan tetap mengakomodir untuk job yang bentuknya memang bukan link jadi user mau fill manual langsung.

---

## Keputusan Akhir — Flow Terimplementasi

### Prinsip
- Scraping bersifat **opsional** dan **non-blocking**
- User bebas submit kapan saja tanpa harus scraping
- Scraping hanya untuk pre-fill, hasilnya bisa di-edit user

### Flow Input

```
                    ┌─────────────────────┐
                    │  Input utama:        │
                    │  [link atau teks]    │
                    └─────────┬───────────┘
                              │
               ┌──────────────┴──────────────┐
               │  Auto-detect                │
               ▼                              ▼
       ┌──────────────┐           ┌──────────────────┐
       │  Link        │           │  Teks biasa       │
       │              │           │                   │
       │  [Check Detail]│         │  [Company] [Role] │
       │  ↓ loading   │           │  [Tambah]         │
       │  ↓ autofill  │           └──────────────────┘
       │  [Company] [Role]│
       │  [Tambah]    │
       └──────────────┘
```

### Detail UX

**Mode Link (URL terdeteksi):**
1. Input field menampilkan icon 🔗
2. Tombol **"Check Detail"** muncul di samping tombol Tambah
3. Saat diklik → spinner loading, panggil `/api/scrape`
4. ✅ Berhasil: `companyName` dan `role` terisi otomatis
5. ❌ Gagal: pesan "Tidak bisa mengambil detail" (non-blocking) — field tetap kosong, user isi manual
6. User tetap bisa edit hasil autofill atau langsung klik Tambah tanpa Check Detail

**Mode Teks (bukan URL):**
1. Input field menampilkan icon 📝
2. Tidak ada tombol Check Detail
3. Company name diambil dari potongan awal teks (default)
4. User bisa override company + role manual

### Scraping Method per Platform (sesuai hasil eksplorasi)

| Platform | Method | Fallback |
|----------|--------|----------|
| Kalibrr | `__NEXT_DATA__` | User manual |
| Jobstreet | `window.SEEK_REDUX_DATA` | User manual |
| Dealls | JSON-LD `JobPosting` | User manual |
| LinkedIn | — (tidak support) | User manual |
| Lainnya | OG / meta tags | User manual |

### Error Handling
- Scraping gagal → tampilkan toast/inline error tanpa blocking
- Scraping timeout (8s) → auto-fail ke manual
- Tidak ada blocking di tombol Tambah — user bisa submit kapan saja