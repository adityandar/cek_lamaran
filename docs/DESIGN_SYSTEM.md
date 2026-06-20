# CekLamaran Design System — Neo-Brutalism

## Filosofi
Berani, satset, tidak malu-malu. Setiap elemen punya presence — border tebal, shadow nyolot, warna berteriak. Bukan "clean UI", ini "loud UI".

---

## 1. Color Palette

| Role | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Black | `#000000` | `black` | Borders, teks, bg solid |
| White | `#FFFFFF` | `white` | Card inner bg, bg landing |
| Cream | `#FFFDF7` | `bg-[#FFFDF7]` | Landing page background |
| Yellow | `#FFE600` | `bg-[#FFE600]` | Header, highlight, CTA bg |
| Pink | `#FFC8DD` | `bg-[#FFC8DD]` | Feature card 1 |
| Blue | `#BDE0FE` | `bg-[#BDE0FE]` | Feature card 2 |
| Green | `#B5E48C` | `bg-[#B5E48C]` | Feature card 3 |
| Peach | `#FFD6A5` | `bg-[#FFD6A5]` | Feature card 4 |
| Hot Pink | `#FF6B9D` | `bg-[#FF6B9D]` | Primary CTA landing |
| Red | `#FF0000` | `red-600` | Destructive / Rejected |

### Hitam & Putih sebagai anchor
Semua warna pastel dipasangkan dengan **border hitam** dan/atau **shadow hitam**. Jangan pernah pakai pastel tanpa border hitam.

---

## 2. Typography

| Style | Weight | Size | Usage |
|-------|--------|------|-------|
| Hero | `font-black` (900) | `text-5xl sm:text-7xl` | H1 landing page |
| Section title | `font-black` (900) | `text-3xl` | "Kenapa CekLamaran?" |
| Card title | `font-black` (900) | `text-lg` | Feature card title |
| Body | `font-medium` (500) | `text-sm` | Card description |
| CTA button | `font-bold` (700) | `text-lg` | Tombol utama |
| Badge | `font-bold` (700) | `text-xs` | Tagline badge |

**Font stack:** `system-ui, -apple-system, sans-serif` (default Tailwind). No custom font import — satset.

**Highlight:** Gunakan `bg-[#FFE600] px-1 inline-block` untuk teks yang mau ditekankan.

---

## 3. Border System

Semua border: **solid black**, ketebalan tetap:

| Level | Class | Usage |
|-------|-------|-------|
| Heavy | `border-4` | Card, CTA, section divider, header bottom |
| Medium | `border-[3px]` | Icon container dalam card |
| Light | `border-2` | *(jarang — reserved untuk secondary elements)* |

**Aturan:** Setiap container yang punya background warna harus punya `border-4 border-black`. Tidak ada elemen "floaty" tanpa batas tegas.

---

## 4. Shadow System

Semua shadow: **solid, zero blur, black only**.

| Level | Class | Usage |
|-------|-------|-------|
| Large | `shadow-[8px_8px_0_0_#000]` | Default card, CTA utama |
| Medium | `shadow-[6px_6px_0_0_#000]` | Header |
| Small | `shadow-[4px_4px_0_0_#000]` | Buttons kecil |

### Hover behavior (interactive elements)
```
shadow-[8px_8px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[4px] hover:translate-y-[4px]
```
Shadow mengecil + elemen geser → ilusi tombol "ditekan".

---

## 5. Corner Treatment

**Semua sudut = sharp (0px).** Tidak ada `rounded-*` di elemen manapun.

Satu-satunya pengecualian: ikon container dalam card pakai `bg-white border-[3px] border-black w-fit p-2` — tetap sharp.

---

## 6. Rotation

Elemen-elemen tertentu boleh miring untuk kesan "tidak terlalu rapi":

| Elemen | Rotasi | Pengecualian |
|--------|--------|--------------|
| Feature cards | `-rotate-1`, `rotate-1`, `rotate-2`, `-rotate-1` | 4 varian, bergantian |
| Logo text | `-rotate-1` | |
| Highlight badge | `-rotate-1` atau `rotate-1` | |
| Icon container dalam card | `-rotate-3` | Konsisten |

Interactive elements (button, link, CTA) **jangan di-rotate** — tetap lurus.

---

## 7. Spacing

| Context | Value | Notes |
|---------|-------|-------|
| Layout max width | `max-w-5xl` | 1024px |
| Page padding (mobile) | `px-6` | |
| Gap antar card | `gap-6` | |
| Card padding | `p-5` | |
| Header height | `h-16` | |
| Hero section padding top | `pt-24` | |
| Section vertical | `pb-24` | |

---

## 8. Component Patterns

### Button (Landing Page)
```
border-4 border-black
font-bold text-lg px-8 py-3
shadow-[8px_8px_0_0_#000]
hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[4px] hover:translate-y-[4px]
```

### Button (Dashboard — inside app)
Pakai shadcn/ui button dengan styling normal (tidak perlu neo-brutalism untuk konten internal).

### Feature Card
```
{bg-color} border-4 border-black p-5
shadow-[8px_8px_0_0_#000]
{rotate}
hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[4px] hover:translate-y-[4px]
```

### Badge / Tagline
```
bg-[#FFE600] border-4 border-black px-4 py-1.5
shadow-[6px_6px_0_0_#000]
-rotate-1
```

### Container / Section Divider
```
border-t-4 border-black
```

---

## 9. Scope

Seluruh aplikasi — landing, dashboard, wishlist, auth — akan menggunakan neo-brutalism.
Revamp page per page dilakukan bertahap; page baru langsung pakai DS ini.

---

## 10. Icon Style

- Pakai **Lucide** icons (existing dependency)
- Stroke width: default (`stroke-1.5`)
- Ukuran: `h-5 w-5` di card, `h-4 w-4` di inline
- Ikon dibungkus container bg putih + border hitam di feature cards
