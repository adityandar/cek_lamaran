import { useDroppable, useDraggable } from '@dnd-kit/core'
import { GripVertical, X } from 'lucide-react'
import type { Job, JobStatus } from '../types'

const COLORS: Record<JobStatus, { header: string; bg: string }> = {
  APPLIED: { header: 'bg-blue-500', bg: 'bg-blue-50/50' },
  IN_PROGRESS: { header: 'bg-amber-500', bg: 'bg-amber-50/50' },
  REJECTED: { header: 'bg-red-500', bg: 'bg-red-50/50' },
  OFFERED: { header: 'bg-emerald-500', bg: 'bg-emerald-50/50' },
}

function DraggableCard({ job, activeId, onDelete }: { job: Job; activeId: string | null; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: job.id })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border p-3 shadow-sm ${isDragging || activeId === job.id ? 'opacity-50 ring-2 ring-primary' : ''}`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <div {...listeners} {...attributes} className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{job.companyName}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {job.companyDomain || job.description?.slice(0, 50) || ''}
            </p>
          </div>
        </div>
        <button onClick={() => onDelete(job.id)} className="text-muted-foreground hover:text-destructive shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

interface Props {
  id: JobStatus
  label: string
  jobs: Job[]
  onDelete: (id: string) => void
  activeId: string | null
}

export function KanbanColumn({ id, label, jobs, onDelete, activeId }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border bg-card overflow-hidden ${isOver ? 'ring-2 ring-primary' : ''}`}
    >
      <div className={`${COLORS[id].header} px-4 py-2.5`}>
        <h3 className="text-sm font-semibold text-white flex items-center justify-between">
          {label}
          <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{jobs.length}</span>
        </h3>
      </div>
      <div className="p-3 space-y-2 min-h-[120px] bg-muted/20">
        {jobs.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">Seret job ke sini</p>
        )}
        {jobs.map((job) => (
          <DraggableCard key={job.id} job={job} activeId={activeId} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}
