import { List, Columns3 } from 'lucide-react'
import type { JobStatus } from '../types'
import { Button } from './ui/button'

type ViewMode = 'LIST' | 'KANBAN'

const FILTERS: { id: JobStatus | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'APPLIED', label: 'Applied' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'OFFERED', label: 'Offered' },
]

interface Props {
  viewMode: ViewMode
  onViewChange: (mode: ViewMode) => void
  activeFilter: JobStatus | 'ALL'
  onFilterChange: (filter: JobStatus | 'ALL') => void
}

export function ViewToggle({ viewMode, onViewChange, activeFilter, onFilterChange }: Props) {
  return (
    <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
      {viewMode === 'LIST' && (
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map((f) => (
            <Button
              key={f.id}
              variant={activeFilter === f.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onFilterChange(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      )}
      {viewMode === 'KANBAN' && <div />}
      <div className="flex border rounded-lg overflow-hidden shrink-0">
        <Button
          variant={viewMode === 'LIST' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('LIST')}
          className="rounded-none"
        >
          <List className="h-4 w-4 mr-1" />
          List
        </Button>
        <Button
          variant={viewMode === 'KANBAN' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('KANBAN')}
          className="rounded-none"
        >
          <Columns3 className="h-4 w-4 mr-1" />
          Kanban
        </Button>
      </div>
    </div>
  )
}
