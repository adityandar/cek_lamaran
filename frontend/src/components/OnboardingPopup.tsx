import { useState, useEffect } from 'react'
import { List, Columns3, ArrowRight, Ban, CheckCircle } from 'lucide-react'
import { Dialog, DialogHeader, DialogTitle } from './ui/dialog'

const STORAGE_KEY = 'ceklamaran_onboarding_done'

export function OnboardingPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) setOpen(true)
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss() }}>
      <DialogHeader>
        <DialogTitle>Selamat datang di CekLamaran</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 text-sm font-medium">
        <p>Catat dan pantau semua lamaran pekerjaan kamu dalam satu tempat.</p>

        <div className="space-y-3">
          <div className="flex gap-3">
            <ArrowRight className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-black">Applied</span>
              <p>Sudah dikirim lamarannya, menunggu respon.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <List className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-black">In Progress</span>
              <p>Ada perkembangan — interview, tes, atau tindak lanjut.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Ban className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-black">Rejected</span>
              <p>Lamaran ditolak — status final, tidak bisa diubah lagi.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-black">Offered</span>
              <p>Dapat offer — status final, tidak bisa diubah lagi.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <span className="text-xs font-bold border-2 border-black px-2 py-1">
            <List className="h-3 w-3 inline mr-1 -mt-0.5" /> List view
          </span>
          <span className="text-xs font-bold border-2 border-black px-2 py-1">
            <Columns3 className="h-3 w-3 inline mr-1 -mt-0.5" /> Kanban view
          </span>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button onClick={dismiss} className="font-bold text-sm px-6 py-2 border-4 border-black bg-black text-white shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
          Mulai
        </button>
      </div>
    </Dialog>
  )
}
