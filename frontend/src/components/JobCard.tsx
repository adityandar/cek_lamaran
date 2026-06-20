import { ExternalLink, Trash2, ChevronDown } from 'lucide-react'
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

export function JobCard({ job, onStatusChange, onDelete, onDetail }: Props) {
  const isLocked = LOCKED_STATUSES.includes(job.status)
  const detail = job.sourceUrl || job.description || ''

  return (
    <div className="flex items-center gap-4 border-4 border-black bg-white p-4 shadow-[5px_5px_0_0_#000]">
      <button onClick={() => onDetail(job.id)} className="flex-1 min-w-0 text-left cursor-pointer">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-black text-base leading-tight hover:underline">{job.companyName}</span>
            {job.role && (
              <span className="text-sm font-medium text-gray-500 hidden sm:inline">— {job.role}</span>
            )}
            {job.companyDomain && !job.role && (
              <span className="text-sm font-medium text-gray-500 hidden sm:inline">({job.companyDomain})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isLocked ? (
              <span className={`font-bold text-xs px-2 py-0.5 border-2 border-black ${STATUS_CONFIG[job.status].bg} ${STATUS_CONFIG[job.status].text}`}>
                {STATUS_CONFIG[job.status].label}
              </span>
            ) : (
              <div className="relative">
                <select
                  value={job.status}
                  onChange={(e) => onStatusChange(job.id, e.target.value as JobStatus)}
                  className={`appearance-none cursor-pointer font-bold text-xs px-2 py-0.5 border-2 border-black pr-6 ${STATUS_CONFIG[job.status].bg} ${STATUS_CONFIG[job.status].text}`}
                >
                  {STATUS_LIST.map((s) => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
              </div>
            )}
            <span className="text-xs font-medium text-gray-500">{timeAgo(job.updatedAt)}</span>
          </div>
          {detail && (
            <p className="text-xs font-medium text-gray-500 truncate max-w-md">
              {job.sourceUrl ? (
                <span className="inline-flex items-center gap-1 font-bold underline hover:no-underline">
                  <ExternalLink className="h-3 w-3" />
                  {job.sourceUrl}
                </span>
              ) : (
                detail
              )}
            </p>
          )}
        </div>
      </button>

      <button
        onClick={() => onDelete(job.id)}
        className="p-1.5 border-2 border-black bg-white hover:bg-red-100 transition-all opacity-40 hover:opacity-100 shrink-0"
        title="Hapus"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
