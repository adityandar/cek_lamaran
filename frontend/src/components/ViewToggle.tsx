import { List, Columns3 } from 'lucide-react'

type ViewMode = 'LIST' | 'KANBAN'

interface Props {
  viewMode: ViewMode
  onViewChange: (mode: ViewMode) => void
}

export function ViewToggle({ viewMode, onViewChange }: Props) {
  return (
    <div className="flex">
      <button
        onClick={() => onViewChange('LIST')}
        className={`px-3 py-1.5 text-xs font-bold border-4 border-black transition-all ${
          viewMode === 'LIST'
            ? 'bg-black text-white shadow-[3px_3px_0_0_#000]'
            : 'bg-white hover:bg-gray-100 shadow-[3px_3px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px]'
        }`}
      >
        <List className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
        List
      </button>
      <button
        onClick={() => onViewChange('KANBAN')}
        className={`px-3 py-1.5 text-xs font-bold border-4 border-black transition-all ${
          viewMode === 'KANBAN'
            ? 'bg-black text-white shadow-[3px_3px_0_0_#000]'
            : 'bg-white hover:bg-gray-100 shadow-[3px_3px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px]'
        }`}
      >
        <Columns3 className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
        Kanban
      </button>
    </div>
  )
}
