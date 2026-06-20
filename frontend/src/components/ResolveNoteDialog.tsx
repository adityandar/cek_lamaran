import { useState, useEffect } from 'react'
import { X, CheckCircle } from 'lucide-react'
import { Dialog, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import type { JobStatus } from '../types'

interface Props {
  open: boolean
  targetStatus: JobStatus | null
  onConfirm: (note: string) => void
  onCancel: () => void
}

export function ResolveNoteDialog({ open, targetStatus, onConfirm, onCancel }: Props) {
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open) setNote('')
  }, [open])

  if (!targetStatus) return null

  const isRejected = targetStatus === 'REJECTED'

  return (
    <Dialog open={open} onOpenChange={() => onCancel()}>
      <DialogHeader>
        <div className="flex items-center gap-2">
          {isRejected ? (
            <X className="h-5 w-5 text-red-500" />
          ) : (
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          )}
          <DialogTitle>
            {isRejected ? 'Catat alasan reject' : 'Catat detail offer'}
          </DialogTitle>
        </div>
      </DialogHeader>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {isRejected
            ? 'Job akan dipindah ke Rejected. Tambahkan catatan sebagai referensi ke depannya.'
            : 'Job akan dipindah ke Offered. Tambahkan detail offer-nya.'}
        </p>
        <textarea
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[100px] resize-y"
          placeholder={isRejected ? "Misal: 'Tidak cocok culture' atau 'Sudah full headcount'..." : "Misal: 'Total IDR 200jt/tahun, join Jan 2027'..."}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button
            variant={isRejected ? 'destructive' : 'default'}
            onClick={() => onConfirm(note)}
          >
            {isRejected ? (
              <><X className="h-4 w-4 mr-1" /> Konfirmasi Reject</>
            ) : (
              <><CheckCircle className="h-4 w-4 mr-1" /> Konfirmasi Offer</>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
