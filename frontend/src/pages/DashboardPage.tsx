import { useEffect, useState, useMemo } from 'react'
import { AlertCircle, ArrowUpDown } from 'lucide-react'
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
import type { Job, JobStatus } from '../types'
import * as jobsApi from '../api/jobs'

type SortBy = 'newest' | 'oldest' | 'status'

const STATUS_ORDER: Record<JobStatus, number> = {
  WISHLIST: 0,
  APPLIED: 1,
  IN_PROGRESS: 2,
  REJECTED: 3,
  OFFERED: 4,
}

const sortBtnBase = 'font-bold border-2 border-black text-xs px-3 py-1.5 transition-all'
const sortBtnActive = `${sortBtnBase} bg-black text-white shadow-[2px_2px_0_0_#000]`
const sortBtnInactive = `${sortBtnBase} bg-white hover:bg-gray-100 shadow-[2px_2px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px]`

export function DashboardPage() {
  const token = useAuthStore((s) => s.token)
  const { jobs, viewMode, loading, error, fetchJobs, addJob, updateStatus, updateJob, removeJob, setViewMode } = useJobStore()
  const [filter, setFilter] = useState<JobStatus | 'ALL'>('ALL')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
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

  const sorted = useMemo(() => {
    const list = [...filtered]
    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
    } else if (sortBy === 'status') {
      list.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
    }
    return list
  }, [filtered, sortBy])

  return (
    <Layout onHelp={() => setShowHelp(true)}>
      <OnboardingPopup />

      <JobInput onAdd={handleAdd} />

      {error && (
        <div className="flex items-center gap-2 bg-red-100 border-4 border-red-600 text-red-700 font-bold text-sm p-3 mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}. Pastikan backend berjalan.</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="font-bold">Memuat data...</div>
        </div>
      ) : activeJobs.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <ViewToggle
              viewMode={viewMode}
              onViewChange={setViewMode}
              activeFilter={filter}
              onFilterChange={setFilter}
            />

            <div className="flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5" />
              {(['newest', 'oldest', 'status'] as const).filter(s => viewMode === 'LIST' || s !== 'status').map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={sortBy === s ? sortBtnActive : sortBtnInactive}
                >
                  {s === 'newest' ? 'Terbaru' : s === 'oldest' ? 'Terlama' : 'Status'}
                </button>
              ))}
            </div>
          </div>

          {viewMode === 'LIST' ? (
            <JobList
              jobs={sorted}
              onStatusChange={handleStatus}
              onDelete={handleDelete}
              onDetail={handleDetail}
            />
          ) : (
            <KanbanBoard
              jobs={sorted}
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
        <p className="text-sm font-medium mb-4">
          Job yang dihapus tidak bisa dikembalikan.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteTarget(null)} className="font-bold text-sm px-4 py-2 border-4 border-black bg-white hover:bg-gray-100 shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            Batal
          </button>
          <button onClick={confirmDelete} className="font-bold text-sm px-4 py-2 border-4 border-black bg-red-500 text-white hover:bg-red-600 shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            Hapus
          </button>
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
        <div className="space-y-3 text-sm font-medium">
          <p><span className="font-black">Applied</span> — Lamaran sudah dikirim.</p>
          <p><span className="font-black">In Progress</span> — Ada perkembangan (interview, dll).</p>
          <p><span className="font-black">Rejected</span> — Ditolak. Status final, tidak bisa diubah.</p>
          <p><span className="font-black">Offered</span> — Dapat offer. Status final, tidak bisa diubah.</p>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={() => setShowHelp(false)} className="font-bold text-sm px-4 py-2 border-4 border-black bg-white hover:bg-gray-100 shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            Tutup
          </button>
        </div>
      </Dialog>
    </Layout>
  )
}
