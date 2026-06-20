import { List, Columns3 } from 'lucide-react'
import type { JobStatus } from '../types'

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

const btnActive = 'font-bold border-2 border-black bg-black text-white shadow-[2px_2px_0_0_#000] text-xs'
const btnInactive = 'font-bold border-2 border-black bg-white hover:bg-gray-100 shadow-[2px_2px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all text-xs'

function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 ${active ? btnActive : btnInactive}`}>
      {children}
    </button>
  )
}

export function ViewToggle({ viewMode, onViewChange, activeFilter, onFilterChange }: Props) {
  return (
    <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
      {viewMode === 'LIST' && (
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map((f) => (
            <ToggleBtn key={f.id} active={activeFilter === f.id} onClick={() => onFilterChange(f.id)}>
              {f.label}
            </ToggleBtn>
          ))}
        </div>
      )}
      {viewMode === 'KANBAN' && <div />}
      <div className="flex">
        <ToggleBtn active={viewMode === 'LIST'} onClick={() => onViewChange('LIST')}>
          <List className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
          List
        </ToggleBtn>
        <ToggleBtn active={viewMode === 'KANBAN'} onClick={() => onViewChange('KANBAN')}>
          <Columns3 className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
          Kanban
        </ToggleBtn>
      </div>
    </div>
  )
}
