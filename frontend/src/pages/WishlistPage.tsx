import { useState, useEffect } from 'react'
import { Heart, ExternalLink, Trash2, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useJobStore } from '../store/jobStore'
import { Layout } from '../components/Layout'
import { JobInput } from '../components/JobInput'
import { Dialog, DialogHeader, DialogTitle } from '../components/ui/dialog'
import type { JobStatus } from '../types'
import * as jobsApi from '../api/jobs'

export function WishlistPage() {
  const token = useAuthStore((s) => s.token)
  const { jobs, fetchJobs, removeJob, updateStatus } = useJobStore()
  const [showHelp, setShowHelp] = useState(false)

  const wishlistJobs = jobs.filter((j) => j.status === 'WISHLIST')

  useEffect(() => {
    if (token) fetchJobs(token)
  }, [token])

  const handleAdd = async (input: string, companyName?: string, role?: string) => {
    if (!token) return
    await jobsApi.createJob(token, input, companyName, role, 'WISHLIST')
    await fetchJobs(token)
  }

  const handleMoveToApplied = async (id: string) => {
    if (!token) return
    await updateStatus(token, id, 'APPLIED' as JobStatus)
  }

  return (
    <Layout onHelp={() => setShowHelp(true)}>
      <div className="mb-6">
        <h2 className="text-lg font-black flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5" />
          Wishlist
        </h2>
        <JobInput onAdd={handleAdd} submitLabel="Simpan" hint="📝 Simpan lowongan untuk ditindaklanjuti nanti" />
      </div>

      <div className="space-y-2">
        {wishlistJobs.length === 0 && (
          <p className="text-sm font-medium text-center py-10">
            Belum ada wishlist. Simpan lowongan yang menarik untuk ditindaklanjuti nanti.
          </p>
        )}
        {wishlistJobs.map((job) => (
          <div key={job.id} className="border-4 border-black bg-white p-3 shadow-[5px_5px_0_0_#000] flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm">{job.companyName}</p>
              {job.role && <p className="text-xs font-medium">{job.role}</p>}
              {job.sourceUrl ? (
                <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold underline hover:no-underline inline-flex items-center gap-1 mt-0.5">
                  <ExternalLink className="h-3 w-3" /> {job.sourceUrl}
                </a>
              ) : job.description ? (
                <p className="text-xs font-medium mt-0.5 truncate">{job.description}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => handleMoveToApplied(job.id)} className="font-bold text-xs px-3 py-1.5 border-4 border-black bg-black text-white shadow-[3px_3px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                <ArrowRight className="h-3 w-3 mr-1 inline -mt-0.5" />
                Apply
              </button>
              <button onClick={() => token && removeJob(token, job.id)} className="p-1.5 border-2 border-black bg-white shadow-[2px_2px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all hover:bg-red-100">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogHeader>
          <DialogTitle>Wishlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm font-medium">
          <p>Simpan lowongan yang belum kamu apply di sini.</p>
          <p>Setelah kamu apply, tekan tombol <strong>Apply</strong> untuk memindahkannya ke halaman Active.</p>
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
