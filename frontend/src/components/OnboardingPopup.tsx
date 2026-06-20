import { useState, useEffect } from 'react'
import { Briefcase, List, Columns3, ArrowRight, Ban, CheckCircle } from 'lucide-react'
import { Dialog, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'

const STORAGE_KEY = 'jobtracker_onboarding_done'

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
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <DialogTitle>Selamat datang di Job Tracker</DialogTitle>
        </div>
      </DialogHeader>
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          Catat dan pantau semua lamaran pekerjaan kamu dalam satu tempat.
        </p>

        <div className="space-y-3">
          <div className="flex gap-3">
            <ArrowRight className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Applied</span>
              <p>Sudah dikirim lamarannya, menunggu respon.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <List className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">In Progress</span>
              <p>Ada perkembangan — interview, tes, atau tindak lanjut.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Ban className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Rejected</span>
              <p>Lamaran ditolak — status final, tidak bisa diubah lagi.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Offered</span>
              <p>Dapat offer — status final, tidak bisa diubah lagi.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <div className="flex items-center gap-1 text-xs bg-muted rounded-md px-2 py-1">
            <List className="h-3 w-3" /> List view
          </div>
          <div className="flex items-center gap-1 text-xs bg-muted rounded-md px-2 py-1">
            <Columns3 className="h-3 w-3" /> Kanban view
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <Button onClick={dismiss}>Mulai</Button>
      </div>
    </Dialog>
  )
}
