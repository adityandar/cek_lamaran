import { useState, useEffect } from 'react'
import { X, CheckCircle } from 'lucide-react'
import { Dialog, DialogHeader, DialogTitle } from './ui/dialog'
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
            <X className="h-5 w-5" />
          ) : (
            <CheckCircle className="h-5 w-5" />
          )}
          <DialogTitle>
            {isRejected ? 'Catat alasan reject' : 'Catat detail offer'}
          </DialogTitle>
        </div>
      </DialogHeader>
      <div className="space-y-4">
        <p className="text-sm font-medium">
          {isRejected
            ? 'Job akan dipindah ke Rejected. Tambahkan catatan sebagai referensi ke depannya.'
            : 'Job akan dipindah ke Offered. Tambahkan detail offer-nya.'}
        </p>
        <textarea
          className="w-full border-4 border-black px-3 py-2 text-sm font-medium bg-white focus:outline-none focus:shadow-[3px_3px_0_0_#000] transition-all placeholder:text-gray-400 min-h-[100px] resize-y"
          placeholder={isRejected ? "Misal: 'Tidak cocok culture' atau 'Sudah full headcount'..." : "Misal: 'Total IDR 200jt/tahun, join Jan 2027'..."}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="font-bold text-sm px-4 py-2 border-4 border-black bg-white hover:bg-gray-100 shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            Batal
          </button>
          <button
            onClick={() => onConfirm(note)}
            className={`font-bold text-sm px-4 py-2 border-4 border-black transition-all shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] ${
              isRejected ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isRejected ? (
              <><X className="h-4 w-4 mr-1 inline -mt-0.5" /> Konfirmasi Reject</>
            ) : (
              <><CheckCircle className="h-4 w-4 mr-1 inline -mt-0.5" /> Konfirmasi Offer</>
            )}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
