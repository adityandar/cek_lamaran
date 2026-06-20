import { useState, useEffect } from 'react'
import { ExternalLink, Plus, Save, X } from 'lucide-react'
import type { Job, JobStatus, Note } from '../types'
import { LOCKED_STATUSES } from '../types'
import { Dialog, DialogHeader, DialogTitle } from './ui/dialog'
import * as jobsApi from '../api/jobs'
import { useAuthStore } from '../store/authStore'

const STATUS_NAMES: Record<JobStatus, string> = {
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  IN_PROGRESS: 'In Progress',
  REJECTED: 'Rejected',
  OFFERED: 'Offered',
}

const STATUS_LIST: JobStatus[] = ['APPLIED', 'IN_PROGRESS', 'REJECTED', 'OFFERED']

interface Props {
  job: Job | null
  onClose: () => void
  onStatusChange: (id: string, status: JobStatus) => void
  onUpdate: (id: string, data: { companyName?: string; role?: string }) => void
}

const inputClasses = 'w-full border-4 border-black px-3 py-2 text-sm font-medium bg-white focus:outline-none focus:shadow-[3px_3px_0_0_#000] transition-all placeholder:text-gray-400'
const btnClasses = 'font-bold text-sm px-4 py-2 border-4 border-black transition-all'
const btnPrimary = `${btnClasses} bg-black text-white shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px]`
const btnOutline = `${btnClasses} bg-white hover:bg-gray-100 shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px]`

export function JobDetailModal({ job, onClose, onStatusChange, onUpdate }: Props) {
  const token = useAuthStore((s) => s.token)
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    if (job) {
      setCompanyName(job.companyName)
      setRole(job.role || '')
      setNotes(job.notes || [])
      setNewNote('')
    }
  }, [job])

  if (!job) return null

  const isLocked = LOCKED_STATUSES.includes(job.status)
  const hasChanges = companyName !== job.companyName || role !== (job.role || '')

  const handleSave = () => {
    onUpdate(job.id, {
      companyName: companyName !== job.companyName ? companyName : undefined,
      role: role !== (job.role || '') ? role : undefined,
    })
  }

  const handleAddNote = async () => {
    if (!token || !newNote.trim()) return
    try {
      const note = await jobsApi.addNote(token, job.id, newNote.trim())
      setNotes([...notes, note])
      setNewNote('')
    } catch {}
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!token) return
    try {
      await jobsApi.deleteNote(token, noteId)
      setNotes(notes.filter((n) => n.id !== noteId))
    } catch {}
  }

  return (
    <Dialog open={!!job} onOpenChange={() => onClose()}>
      <DialogHeader>
        <DialogTitle>Detail Lamaran</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-black">Perusahaan</label>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={`${inputClasses} mt-1`} />
          </div>
          <div>
            <label className="text-xs font-black">Posisi</label>
            <input value={role} onChange={(e) => setRole(e.target.value)} className={`${inputClasses} mt-1`} placeholder="—" />
          </div>
        </div>

        <div>
          <label className="text-xs font-black">Status</label>
          <div className="flex items-center gap-2 mt-1">
            {!isLocked ? (
              <select
                value={job.status}
                onChange={(e) => onStatusChange(job.id, e.target.value as JobStatus)}
                className="appearance-none border-4 border-black bg-white px-3 py-1.5 text-sm font-bold focus:outline-none cursor-pointer"
              >
                {STATUS_LIST.map((s) => (
                  <option key={s} value={s}>{STATUS_NAMES[s]}</option>
                ))}
              </select>
            ) : (
              <span className="font-bold text-xs px-2 py-0.5 border-2 border-black bg-gray-200">
                {STATUS_NAMES[job.status]} (final)
              </span>
            )}
          </div>
        </div>

        {job.companyDomain && (
          <div>
            <label className="text-xs font-black">Domain</label>
            <p className="text-sm font-medium mt-1">{job.companyDomain}</p>
          </div>
        )}

        {job.sourceUrl && (
          <div>
            <label className="text-xs font-black">Link</label>
            <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-bold underline hover:no-underline mt-1">
              <ExternalLink className="h-3 w-3" />
              {job.sourceUrl}
            </a>
          </div>
        )}

        {job.description && (
          <div>
            <label className="text-xs font-black">Deskripsi awal</label>
            <p className="text-sm font-medium mt-1 whitespace-pre-wrap">{job.description}</p>
          </div>
        )}

        <div>
          <label className="text-xs font-black mb-2 block">Catatan</label>
          <div className="space-y-2 mb-3">
            {notes.length === 0 && (
              <p className="text-xs font-medium text-gray-500">Belum ada catatan.</p>
            )}
            {notes.map((note) => (
              <div key={note.id} className={`flex items-start gap-2 p-2.5 group border-2 border-black ${
                note.tag === 'rejected' ? 'bg-red-100' : note.tag === 'offered' ? 'bg-[#B5E48C]' : 'bg-gray-100'
              }`}>
                {note.tag && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 border-2 border-black shrink-0 mt-0.5 ${
                    note.tag === 'rejected' ? 'bg-red-200 text-red-800' : 'bg-white text-black'
                  }`}>
                    {note.tag === 'rejected' ? '✕' : '✓'}
                  </span>
                )}
                <p className="flex-1 text-sm font-medium whitespace-pre-wrap">{note.content}</p>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 p-0.5 hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Tambah catatan..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              className={inputClasses}
            />
            <button onClick={handleAddNote} disabled={!newNote.trim()} className={`${btnOutline} px-3`}>
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t-4 border-black">
          <button onClick={onClose} className={btnOutline}>
            Tutup
          </button>
          <button onClick={handleSave} disabled={!hasChanges} className={btnPrimary}>
            <Save className="h-4 w-4 mr-1 inline -mt-0.5" />
            Simpan
          </button>
        </div>
      </div>
    </Dialog>
  )
}
