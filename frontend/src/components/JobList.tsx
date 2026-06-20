import type { Job, JobStatus } from '../types'
import { JobCard } from './JobCard'

interface Props {
  jobs: Job[]
  onStatusChange: (id: string, status: JobStatus) => void
  onDelete: (id: string) => void
  onDetail: (id: string) => void
}

export function JobList({ jobs, onStatusChange, onDelete, onDetail }: Props) {
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} onStatusChange={onStatusChange} onDelete={onDelete} onDetail={onDetail} />
      ))}
    </div>
  )
}
