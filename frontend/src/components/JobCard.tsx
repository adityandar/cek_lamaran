import { ExternalLink, Trash2, Eye, ChevronDown } from 'lucide-react'
import type { Job, JobStatus } from '../types'
import { LOCKED_STATUSES } from '../types'

const STATUS_CONFIG: Record<JobStatus, { label: string; bg: string; text: string }> = {
  WISHLIST: { label: 'Wishlist', bg: 'bg-gray-200', text: 'text-gray-800' },
  APPLIED: { label: 'Applied', bg: 'bg-[#BDE0FE]', text: 'text-black' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-[#FFD6A5]', text: 'text-black' },
  REJECTED: { label: 'Rejected', bg: 'bg-red-200', text: 'text-red-800' },
  OFFERED: { label: 'Offered', bg: 'bg-[#B5E48C]', text: 'text-black' },
}

const STATUS_LIST: JobStatus[] = ['APPLIED', 'IN_PROGRESS', 'REJECTED', 'OFFERED']

interface Props {
  job: Job
  onStatusChange: (id: string, status: JobStatus) => void
  onDelete: (id: string) => void
  onDetail: (id: string) => void
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'baru saja'
  if (mins < 60) return `${mins}m lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}j lalu`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Kemarin'
  return `${days}h lalu`
}

const btnIcon = 'p-1.5 border-2 border-black bg-white shadow-[2px_2px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all'

export function JobCard({ job, onStatusChange, onDelete, onDetail }: Props) {
  const isLocked = LOCKED_STATUSES.includes(job.status)
  const detail = job.sourceUrl || job.description || ''

  return (
    <div className="flex items-center gap-4 border-4 border-black bg-white p-3 shadow-[5px_5px_0_0_#000]">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-black text-sm">{job.companyName}</span>
          {job.role && (
            <span className="text-xs font-medium text-gray-500">— {job.role}</span>
          )}
          {job.companyDomain && !job.role && (
            <span className="text-xs font-medium text-gray-500">({job.companyDomain})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-bold text-xs px-2 py-0.5 border-2 border-black ${STATUS_CONFIG[job.status].bg} ${STATUS_CONFIG[job.status].text}`}>
            {STATUS_CONFIG[job.status].label}
          </span>
          <span className="text-xs font-medium text-gray-500">{timeAgo(job.updatedAt)}</span>
        </div>
        {detail && (
          <p className="text-xs font-medium text-gray-500 truncate max-w-md">
            {job.sourceUrl ? (
              <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold underline hover:no-underline">
                <ExternalLink className="h-3 w-3" />
                {job.sourceUrl}
              </a>
            ) : (
              detail
            )}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => onDetail(job.id)} className={btnIcon} title="Detail">
          <Eye className="h-4 w-4" />
        </button>
        {!isLocked ? (
          <div className="relative">
            <select
              value={job.status}
              onChange={(e) => onStatusChange(job.id, e.target.value as JobStatus)}
              className="appearance-none border-4 border-black bg-white px-3 py-1.5 pr-8 text-sm font-bold focus:outline-none cursor-pointer"
            >
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" />
          </div>
        ) : (
          <span className={`font-bold text-xs px-2 py-0.5 border-2 border-black ${STATUS_CONFIG[job.status].bg} ${STATUS_CONFIG[job.status].text}`}>
            {STATUS_CONFIG[job.status].label}
          </span>
        )}
        <button
          onClick={() => onDelete(job.id)}
          className={`${btnIcon} hover:bg-red-100`}
          title="Hapus"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
