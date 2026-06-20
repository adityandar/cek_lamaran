import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useJobStore } from '../store/jobStore'
import { Layout } from '../components/Layout'
import { JobInput } from '../components/JobInput'
import { JobList } from '../components/JobList'
import { KanbanBoard } from '../components/KanbanBoard'
import { ViewToggle } from '../components/ViewToggle'
import { EmptyState } from '../components/EmptyState'
import { Dialog, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Button } from '../components/ui/button'
import type { JobStatus } from '../types'

export function DashboardPage() {
  const token = useAuthStore((s) => s.token)
  const { jobs, viewMode, loading, error, fetchJobs, addJob, updateStatus, removeJob, setViewMode } = useJobStore()
  const [filter, setFilter] = useState<JobStatus | 'ALL'>('ALL')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  useEffect(() => {
    if (token) fetchJobs(token)
  }, [token])

  const handleAdd = (input: string, companyName?: string) => {
    if (token) addJob(token, input, companyName)
  }

  const handleStatus = (id: string, status: JobStatus) => {
    if (token) updateStatus(token, id, status)
  }

  const handleDelete = (id: string) => {
    setDeleteTarget(id)
  }

  const confirmDelete = () => {
    if (token && deleteTarget) {
      removeJob(token, deleteTarget)
      setDeleteTarget(null)
    }
  }

  const filtered = filter === 'ALL' ? jobs : jobs.filter((j) => j.status === filter)

  return (
    <Layout>
      <JobInput onAdd={handleAdd} />

      {error && (
        <div className="flex items-center gap-2 bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-4 border border-destructive/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}. Pastikan backend berjalan.</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-muted-foreground">Memuat data...</div>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <ViewToggle
            viewMode={viewMode}
            onViewChange={setViewMode}
            activeFilter={filter}
            onFilterChange={setFilter}
          />

          {viewMode === 'LIST' ? (
            <JobList jobs={filtered} onStatusChange={handleStatus} onDelete={handleDelete} />
          ) : (
            <KanbanBoard jobs={jobs} onStatusChange={handleStatus} onDelete={handleDelete} />
          )}
        </>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogHeader>
          <DialogTitle>Hapus job ini?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">
          Job yang dihapus tidak bisa dikembalikan.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Batal
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            Hapus
          </Button>
        </div>
      </Dialog>
    </Layout>
  )
}
