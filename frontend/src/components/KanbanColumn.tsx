import { useDroppable, useDraggable } from '@dnd-kit/core'
import { X, Eye } from 'lucide-react'
import type { Job, JobStatus } from '../types'
import { LOCKED_STATUSES } from '../types'

const COLORS: Record<string, string> = {
  APPLIED: 'bg-[#BDE0FE]',
  IN_PROGRESS: 'bg-[#FFD6A5]',
  REJECTED: 'bg-red-200',
  OFFERED: 'bg-[#B5E48C]',
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
      className={`bg-white border-[3px] border-black p-3 shadow-[4px_4px_0_0_#000] transition-shadow ${
        isDragging || activeId === job.id ? 'opacity-80 shadow-[6px_6px_0_0_#000] z-50 relative' : ''
      } ${isLocked ? 'opacity-70' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black truncate">{job.companyName}</p>
          {job.role && <p className="text-xs font-medium truncate">{job.role}</p>}
          <p className="text-xs font-medium text-gray-500 truncate mt-0.5">
            {job.companyDomain || job.description?.slice(0, 50) || ''}
          </p>
        </div>
        <div className="flex items-center shrink-0 gap-0.5">
          <button onClick={(e) => { e.stopPropagation(); onDetail(job.id); }} className="p-1 border-2 border-black bg-white shadow-[2px_2px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
            <Eye className="h-3 w-3" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(job.id); }} className="p-1 border-2 border-black bg-white shadow-[2px_2px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all hover:bg-red-100">
            <X className="h-3 w-3" />
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
    <div ref={setNodeRef} className={`border-4 border-black bg-white shadow-[5px_5px_0_0_#000] ${isOver ? 'shadow-[8px_8px_0_0_#000]' : ''} transition-shadow`}>
      <div className={`${COLORS[id] || 'bg-gray-200'} border-b-4 border-black px-3 py-2`}>
        <h3 className="text-sm font-black flex items-center justify-between">
          {label}
          <span className="text-xs font-bold border-2 border-black bg-white px-2 py-0.5">{jobs.length}</span>
        </h3>
      </div>
      <div className="p-2 space-y-2 min-h-[100px] bg-[#FFFDF7]">
        {jobs.length === 0 && (
          <p className="text-xs font-bold text-gray-400 text-center py-4">Seret job ke sini</p>
        )}
        {jobs.map((job) => (
          <DraggableCard key={job.id} job={job} activeId={activeId} onDelete={onDelete} onDetail={onDetail} />
        ))}
      </div>
    </div>
  )
}
