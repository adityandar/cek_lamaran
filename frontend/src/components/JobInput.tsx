import { useState } from 'react'
import { Plus, Link, FileText, Search, Loader2, AlertCircle } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { scrapeJob } from '../api/jobs'
import { useAuthStore } from '../store/authStore'

interface Props {
  onAdd: (input: string, companyName?: string, role?: string) => void
  submitLabel?: string
  hint?: string
}

export function JobInput({ onAdd, submitLabel = 'Tambah', hint }: Props) {
  const token = useAuthStore((s) => s.token)
  const [input, setInput] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')
  const [scraping, setScraping] = useState(false)
  const [scrapeError, setScrapeError] = useState(false)

  const isUrl = /^https?:\/\//i.test(input.trim()) || /^www\./i.test(input.trim())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    onAdd(input.trim(), companyName.trim() || undefined, role.trim() || undefined)
    setInput('')
    setCompanyName('')
    setRole('')
    setScrapeError(false)
  }

  const handleCheckDetail = async () => {
    if (!input.trim() || !isUrl || !token) return
    setScraping(true)
    setScrapeError(false)
    try {
      const data = await scrapeJob(token, input.trim())
      if (data?.title || data?.companyName) {
        if (data.title && !role) setRole(data.title)
        if (data.companyName && !companyName) setCompanyName(data.companyName)
      } else {
        setScrapeError(true)
      }
    } catch {
      setScrapeError(true)
    }
    setScraping(false)
  }

  const handleInputChange = (val: string) => {
    setInput(val)
    setScrapeError(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {isUrl ? <Link className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          </div>
          <Input
            className="pl-9 h-10"
            placeholder={isUrl ? "Tempel link lowongan..." : "Ketik nama perusahaan / catatan singkat..."}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
          />
        </div>
        {isUrl && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-10 shrink-0"
            onClick={handleCheckDetail}
            disabled={scraping || !input.trim()}
          >
            {scraping ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-1" />
            )}
            Check Detail
          </Button>
        )}
        <Button type="submit" disabled={!input.trim()} className="h-10 shrink-0">
          <Plus className="h-4 w-4 mr-1" />
          {submitLabel}
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          className="flex-1 h-10"
          placeholder="Nama perusahaan"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <Input
          className="flex-1 h-10"
          placeholder="Posisi / role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </div>

      {scrapeError && (
        <p className="flex items-center gap-1.5 text-xs text-amber-600 ml-1">
          <AlertCircle className="h-3.5 w-3.5" />
          Tidak bisa mengambil detail otomatis. Isi manual atau lanjutkan.
        </p>
      )}

      {!scrapeError && input.trim() && (
        <p className="text-xs text-muted-foreground ml-1">
          {hint || (isUrl
            ? '🔗 Link — klik "Check Detail" untuk isi otomatis'
            : '📝 Teks — kata pertama jadi nama perusahaan default'
          )}
        </p>
      )}
    </form>
  )
}
