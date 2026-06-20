import { useDroppable, useDraggable } from '@dnd-kit/core'
import { X, Eye } from 'lucide-react'
import type { Job, JobStatus } from '../types'
import { LOCKED_STATUSES } from '../types'

const COLORS: Record<string, { header: string }> = {
  APPLIED: { header: 'bg-blue-500' },
  IN_PROGRESS: { header: 'bg-amber-500' },
  REJECTED: { header: 'bg-red-500' },
  OFFERED: { header: 'bg-emerald-500' },
}

function DraggableCard({ job, activeId, onDelete, onDetail }: { job: Job; activeId: string | null; onDelete: (id: string) => void; onDetail: (id: string) => void }) {
  const isLocked = LOCKED_STATUSES.includes(job.status)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: job.id, disabled: isLocked })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`bg-white rounded-lg border p-3 shadow-sm transition-shadow ${isDragging || activeId === job.id ? 'opacity-80 ring-2 ring-primary shadow-lg z-50 relative' : ''} ${isLocked ? 'opacity-70' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{job.companyName}</p>
          {job.role && <p className="text-xs text-muted-foreground truncate">{job.role}</p>}
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {job.companyDomain || job.description?.slice(0, 50) || ''}
          </p>
        </div>
        <div className="flex items-center shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onDetail(job.id); }} className="text-muted-foreground hover:text-foreground p-0.5">
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(job.id); }} className="text-muted-foreground hover:text-destructive p-0.5">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface Props {
  id: JobStatus
  label: string
  jobs: Job[]
  onDelete: (id: string) => void
  onDetail: (id: string) => void
  activeId: string | null
}

export function KanbanColumn({ id, label, jobs, onDelete, onDetail, activeId }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div ref={setNodeRef} className={`rounded-xl border bg-card overflow-hidden ${isOver ? 'ring-2 ring-primary' : ''}`}>
      <div className={`${COLORS[id]?.header || 'bg-slate-400'} px-3 py-2`}>
        <h3 className="text-sm font-semibold text-white flex items-center justify-between">
          {label}
          <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{jobs.length}</span>
        </h3>
      </div>
      <div className="p-2 space-y-2 min-h-[100px] bg-muted/20">
        {jobs.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Seret job ke sini</p>
        )}
        {jobs.map((job) => (
          <DraggableCard key={job.id} job={job} activeId={activeId} onDelete={onDelete} onDetail={onDetail} />
        ))}
      </div>
    </div>
  )
}
