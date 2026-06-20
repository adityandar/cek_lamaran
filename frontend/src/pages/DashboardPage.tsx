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
import { OnboardingPopup } from '../components/OnboardingPopup'
import { JobDetailModal } from '../components/JobDetailModal'
import { ResolveNoteDialog } from '../components/ResolveNoteDialog'
import { Dialog, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Button } from '../components/ui/button'
import type { Job, JobStatus } from '../types'
import * as jobsApi from '../api/jobs'

export function DashboardPage() {
  const token = useAuthStore((s) => s.token)
  const { jobs, viewMode, loading, error, fetchJobs, addJob, updateStatus, updateJob, removeJob, setViewMode } = useJobStore()
  const [filter, setFilter] = useState<JobStatus | 'ALL'>('ALL')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [detailTarget, setDetailTarget] = useState<Job | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [resolveTarget, setResolveTarget] = useState<{ id: string; status: JobStatus } | null>(null)

  useEffect(() => {
    if (token) fetchJobs(token)
  }, [token])

  const handleAdd = (input: string, companyName?: string, role?: string) => {
    if (token) addJob(token, input, companyName, role, 'APPLIED')
  }

  const handleStatus = (id: string, status: JobStatus) => {
    if (status === 'REJECTED' || status === 'OFFERED') {
      setResolveTarget({ id, status })
      return
    }
    if (token) updateStatus(token, id, status)
  }

  const handleResolveConfirm = async (note: string) => {
    if (!token || !resolveTarget) return
    const { id, status } = resolveTarget
    try {
      const updated = await jobsApi.resolveJob(token, id, status, note)
      useJobStore.setState((s) => ({
        jobs: s.jobs.map((j) => (j.id === id ? updated : j)),
      }))
    } catch (e: unknown) {
      useJobStore.setState({ error: (e as Error).message })
    }
    setResolveTarget(null)
  }

  const handleUpdate = (id: string, data: { companyName?: string; role?: string }) => {
    if (token) updateJob(token, id, data)
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

  const handleDetail = async (id: string) => {
    const res = await fetch(`/api/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    const job = await res.json()
    if (job) setDetailTarget(job)
  }

  const activeJobs = jobs.filter((j) => j.status !== 'WISHLIST')
  const filtered = filter === 'ALL' ? activeJobs : activeJobs.filter((j) => j.status === filter)

  return (
    <Layout onHelp={() => setShowHelp(true)}>
      <OnboardingPopup />

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
      ) : activeJobs.length === 0 ? (
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
            <JobList
              jobs={filtered}
              onStatusChange={handleStatus}
              onDelete={handleDelete}
              onDetail={handleDetail}
            />
          ) : (
            <KanbanBoard
              jobs={filtered}
              onStatusChange={handleStatus}
              onDelete={handleDelete}
              onDetail={handleDetail}
            />
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
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
          <Button variant="destructive" onClick={confirmDelete}>Hapus</Button>
        </div>
      </Dialog>

      <JobDetailModal
        key={detailTarget?.id}
        job={detailTarget}
        onClose={() => setDetailTarget(null)}
        onStatusChange={handleStatus}
        onUpdate={handleUpdate}
      />

      <ResolveNoteDialog
        open={!!resolveTarget}
        targetStatus={resolveTarget?.status ?? null}
        onConfirm={handleResolveConfirm}
        onCancel={() => setResolveTarget(null)}
      />

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogHeader>
          <DialogTitle>Penjelasan Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p><span className="font-medium">Applied</span> — Lamaran sudah dikirim.</p>
          <p><span className="font-medium">In Progress</span> — Ada perkembangan (interview, dll).</p>
          <p><span className="font-medium">Rejected</span> — Ditolak. Status final, tidak bisa diubah.</p>
          <p><span className="font-medium">Offered</span> — Dapat offer. Status final, tidak bisa diubah.</p>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => setShowHelp(false)}>Tutup</Button>
        </div>
      </Dialog>
    </Layout>
  )
}
