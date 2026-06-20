import { Navigate } from 'react-router-dom'
import { Briefcase, Heart, Columns3, List, Link as LinkIcon, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const features = [
  {
    icon: LinkIcon,
    title: 'Smart Input',
    desc: 'Tempel link job — company & role terisi otomatis. Atau teks biasa, tetap rapi.',
    bg: 'bg-[#FFC8DD]',
    rotate: '-rotate-1',
  },
  {
    icon: Columns3,
    title: 'Pipeline Visual',
    desc: 'Dari Applied → In Progress → Offered/Rejected. Pantau status tiap lamaran sekilas.',
    bg: 'bg-[#BDE0FE]',
    rotate: 'rotate-1',
  },
  {
    icon: List,
    title: 'List & Kanban',
    desc: 'Ganti tampilan sesuai gaya: daftar terurut atau papan drag & drop per status.',
    bg: 'bg-[#B5E48C]',
    rotate: 'rotate-2',
  },
  {
    icon: Heart,
    title: 'Wishlist',
    desc: 'Simpan job yang menarik buat dilamar nanti. Satu klik pindah ke Active.',
    bg: 'bg-[#FFD6A5]',
    rotate: '-rotate-1',
  },
]

export function LandingPage() {
  const token = useAuthStore((s) => s.token)
  if (token) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      <header className="sticky top-0 z-40 bg-[#FFE600] border-b-4 border-black shadow-[0_6px_0_0_#000]">
        <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2 font-black text-xl tracking-tight">
            <div className="bg-black p-1.5">
              <Briefcase className="h-5 w-5 text-[#FFE600]" />
            </div>
            <span className="-rotate-1">CekLamaran</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/login" className="font-bold px-4 py-2 border-[3px] border-black bg-white hover:bg-gray-100 transition-colors text-sm shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px]">
              Login
            </a>
            <a href="/register" className="font-bold px-4 py-2 border-[3px] border-black bg-black text-white hover:bg-gray-800 transition-colors text-sm shadow-[4px_4px_0_0_#000]">
              Daftar
            </a>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-16 sm:pt-24 pb-16 sm:pb-20 text-center relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#FFC8DD] border-4 border-black rotate-12" />
          <div className="absolute top-40 right-10 w-24 h-24 bg-[#BDE0FE] border-4 border-black -rotate-6" />
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-[#FFD6A5] border-4 border-black rotate-45" />
          <div className="absolute bottom-10 right-1/3 text-6xl font-black text-black opacity-10 select-none">✦</div>
        </div>

        <div className="inline-block bg-[#FFE600] border-4 border-black px-4 py-1.5 font-bold text-sm mb-8 shadow-[6px_6px_0_0_#000] -rotate-1">
          Satset, Efektif.
        </div>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[1.05] mb-6">
          Lacak Semua <br className="sm:hidden" /> Lamaran
          <br />
          <span className="bg-[#FFE600] px-2 inline-block -rotate-1">Satu Tempat</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto mb-10 font-medium">
          Masukkan link atau teks job, atur statusnya, pantau progres — tanpa <span className="line-through decoration-4">spreadsheet</span>, tanpa ribet.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <a href="/register" className="inline-flex items-center gap-2 font-bold text-base sm:text-lg px-6 py-2.5 sm:px-8 sm:py-3 border-4 border-black bg-[#FF6B9D] text-white hover:bg-[#e85a8a] transition-colors shadow-[8px_8px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[4px] hover:translate-y-[4px]">
            Mulai Gratis <ArrowRight className="h-5 w-5" />
          </a>
          <a href="/login" className="inline-flex items-center font-bold text-base sm:text-lg px-6 py-2.5 sm:px-8 sm:py-3 border-4 border-black bg-white hover:bg-gray-100 transition-colors shadow-[8px_8px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[4px] hover:translate-y-[4px]">
            Sudah punya akun
          </a>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-16 sm:pb-24">
        <h2 className="text-3xl font-black mb-8 text-center">
          Kenapa <span className="bg-[#FFE600] px-1">CekLamaran</span>?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className={`${f.bg} ${f.rotate} border-4 border-black p-5 shadow-[8px_8px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[4px] hover:translate-y-[4px] transition-all`}>
              <div className="bg-white border-[3px] border-black w-fit p-2 mb-4 -rotate-3">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-black text-lg mb-2">{f.title}</h3>
              <p className="text-sm font-medium leading-snug">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-black">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Siap merapikan lamaran kamu?
          </h2>
          <p className="text-[#BDE0FE] font-medium mb-8 text-lg">
            Gratis, tanpa email marketing, tanpa drama.
          </p>
          <a href="/register" className="inline-flex items-center gap-2 font-bold text-base sm:text-lg px-6 py-2.5 sm:px-8 sm:py-3 border-4 border-black bg-[#FFE600] text-black hover:bg-[#e6cf00] transition-colors shadow-[8px_8px_0_0_#FFF] hover:shadow-[4px_4px_0_0_#FFF] hover:translate-x-[4px] hover:translate-y-[4px]">
            Mulai Sekarang <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      <footer className="border-t-4 border-black py-6 text-center bg-[#FFE600]">
        <p className="text-sm font-bold">CekLamaran &mdash; dibikin karena males pakai <span className="line-through decoration-4">spreadsheet</span>.</p>
        <p className="text-[10px] font-medium mt-2 opacity-60">
          Dev{' '}
          <a href="https://linkedin.com/in/adityandar" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100">LinkedIn</a>
          <span className="mx-1">·</span>
          <a href="https://www.threads.com/@adityandar.jpg" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100">Threads</a>
          <span className="mx-1">·</span>
          <a href="https://tiktok.com/@yahadityak" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100">TikTok</a>
        </p>
      </footer>
    </div>
  )
}
