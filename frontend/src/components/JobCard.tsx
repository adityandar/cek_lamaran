import { ExternalLink, Trash2, Eye } from 'lucide-react'
import type { Job, JobStatus } from '../types'
import { LOCKED_STATUSES } from '../types'
import { Badge } from './ui/badge'
import { Select } from './ui/select'
import { Button } from './ui/button'

const STATUS_CONFIG: Record<JobStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  WISHLIST: { label: 'Wishlist', variant: 'secondary' },
  APPLIED: { label: 'Applied', variant: 'secondary' },
  IN_PROGRESS: { label: 'In Progress', variant: 'default' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  OFFERED: { label: 'Offered', variant: 'outline' },
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
    <div className="flex items-center gap-4 border rounded-lg bg-card p-3">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{job.companyName}</span>
          {job.role && (
            <span className="text-xs text-muted-foreground">— {job.role}</span>
          )}
          {job.companyDomain && !job.role && (
            <span className="text-xs text-muted-foreground">({job.companyDomain})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_CONFIG[job.status].variant}>
            {STATUS_CONFIG[job.status].label}
          </Badge>
          <span className="text-xs text-muted-foreground">{timeAgo(job.updatedAt)}</span>
        </div>
        {detail && (
          <p className="text-xs text-muted-foreground truncate max-w-md">
            {job.sourceUrl ? (
              <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
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
        <Button variant="ghost" size="icon" onClick={() => onDetail(job.id)} title="Detail">
          <Eye className="h-4 w-4" />
        </Button>
        {!isLocked && (
          <Select
            value={job.status}
            onChange={(e) => onStatusChange(job.id, e.target.value as JobStatus)}
          >
            {STATUS_LIST.map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </Select>
        )}
        {isLocked && (
          <Badge variant={STATUS_CONFIG[job.status].variant}>
            {STATUS_CONFIG[job.status].label}
          </Badge>
        )}
        <button
          onClick={() => onDelete(job.id)}
          className="text-muted-foreground hover:text-destructive transition-colors p-1"
          title="Hapus"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
