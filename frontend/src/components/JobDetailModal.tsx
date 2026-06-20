import { useState, useEffect } from 'react'
import { ExternalLink, Plus, Save, X } from 'lucide-react'
import type { Job, JobStatus, Note } from '../types'
import { LOCKED_STATUSES } from '../types'
import { Dialog, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Select } from './ui/select'
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
            <label className="text-xs font-medium text-muted-foreground">Perusahaan</label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Posisi</label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} className="mt-1" placeholder="—" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <div className="flex items-center gap-2 mt-1">
            {!isLocked ? (
              <Select
                value={job.status}
                onChange={(e) => onStatusChange(job.id, e.target.value as JobStatus)}
              >
                {STATUS_LIST.map((s) => (
                  <option key={s} value={s}>{STATUS_NAMES[s]}</option>
                ))}
              </Select>
            ) : (
              <Badge variant="outline">{STATUS_NAMES[job.status]} (final)</Badge>
            )}
          </div>
        </div>

        {job.companyDomain && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Domain</label>
            <p className="text-sm mt-1">{job.companyDomain}</p>
          </div>
        )}

        {job.sourceUrl && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Link</label>
            <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline mt-1">
              <ExternalLink className="h-3 w-3" />
              {job.sourceUrl}
            </a>
          </div>
        )}

        {job.description && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Deskripsi awal</label>
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{job.description}</p>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Catatan</label>
          <div className="space-y-2 mb-3">
            {notes.length === 0 && (
              <p className="text-xs text-muted-foreground">Belum ada catatan.</p>
            )}
            {notes.map((note) => (
              <div key={note.id} className="flex items-start gap-2 bg-muted/50 rounded-lg p-2.5 group">
                <p className="flex-1 text-sm whitespace-pre-wrap">{note.content}</p>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Tambah catatan..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
            />
            <Button variant="outline" size="icon" onClick={handleAddNote} disabled={!newNote.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={onClose}>Tutup</Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-1" />
            Simpan
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
