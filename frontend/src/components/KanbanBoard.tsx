import { useState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import type { Job, JobStatus } from '../types'
import { LOCKED_STATUSES } from '../types'
import { KanbanColumn } from './KanbanColumn'

const COLUMNS: { id: JobStatus; label: string }[] = [
  { id: 'APPLIED', label: 'Applied' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'OFFERED', label: 'Offered' },
]

interface Props {
  jobs: Job[]
  onStatusChange: (id: string, status: JobStatus) => void
  onDelete: (id: string) => void
  onDetail: (id: string) => void
}

export function KanbanBoard({ jobs, onStatusChange, onDelete, onDetail }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const newStatus = over.id as JobStatus
    if (!COLUMNS.some((c) => c.id === newStatus)) return

    const job = jobs.find((j) => j.id === active.id)
    if (!job || LOCKED_STATUSES.includes(job.status)) return

    onStatusChange(active.id as string, newStatus)
  }

  return (
    <DndContext sensors={sensors} onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-3">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            jobs={jobs.filter((j) => j.status === col.id)}
            onDelete={onDelete}
            onDetail={onDetail}
            activeId={activeId}
          />
        ))}
      </div>
    </DndContext>
  )
}
