import { useState } from 'react'
import { Heart, ExternalLink, Trash2, Plus, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useJobStore } from '../store/jobStore'
import { Layout } from '../components/Layout'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Dialog, DialogHeader, DialogTitle } from '../components/ui/dialog'
import type { JobStatus } from '../types'
import * as jobsApi from '../api/jobs'

export function WishlistPage() {
  const token = useAuthStore((s) => s.token)
  const { jobs, fetchJobs, removeJob, updateStatus } = useJobStore()
  const [input, setInput] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  const wishlistJobs = jobs.filter((j) => j.status === 'WISHLIST')

  const handleAdd = async () => {
    if (!token || !input.trim()) return
    try {
      await jobsApi.createJob(token, input.trim(), companyName.trim() || undefined, role.trim() || undefined, 'WISHLIST')
      await fetchJobs(token)
      setInput('')
      setCompanyName('')
      setRole('')
    } catch {}
  }

  const handleMoveToApplied = async (id: string) => {
    if (!token) return
    await updateStatus(token, id, 'APPLIED' as JobStatus)
  }

  return (
    <Layout onHelp={() => setShowHelp(true)}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-primary" />
          Wishlist
        </h2>
        <div className="space-y-2">
          <Input
            placeholder="Tempel link atau catat lowongan..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex gap-2">
            <Input placeholder="Nama perusahaan (opsional)" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            <Input placeholder="Posisi (opsional)" value={role} onChange={(e) => setRole(e.target.value)} />
            <Button onClick={handleAdd} disabled={!input.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Simpan
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {wishlistJobs.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Belum ada wishlist. Simpan lowongan yang menarik untuk ditindaklanjuti nanti.
          </p>
        )}
        {wishlistJobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{job.companyName}</p>
                {job.role && <p className="text-xs text-muted-foreground">{job.role}</p>}
                {job.sourceUrl ? (
                  <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-0.5">
                    <ExternalLink className="h-3 w-3" /> {job.sourceUrl}
                  </a>
                ) : job.description ? (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{job.description}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="default" size="sm" onClick={() => handleMoveToApplied(job.id)}>
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Apply
                </Button>
                <button onClick={() => token && removeJob(token, job.id)} className="text-muted-foreground hover:text-destructive p-1.5">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogHeader>
          <DialogTitle>Wishlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Simpan lowongan yang belum kamu apply di sini.</p>
          <p>Setelah kamu apply, tekan tombol <strong>Apply</strong> untuk memindahkannya ke halaman Active.</p>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => setShowHelp(false)}>Tutup</Button>
        </div>
      </Dialog>
    </Layout>
  )
}
