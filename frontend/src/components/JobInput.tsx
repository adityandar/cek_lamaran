import { useState } from 'react'
import { Plus, Link, FileText } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'

interface Props {
  onAdd: (input: string, companyName?: string) => void
}

export function JobInput({ onAdd }: Props) {
  const [input, setInput] = useState('')
  const [companyName, setCompanyName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    onAdd(input.trim(), companyName.trim() || undefined)
    setInput('')
    setCompanyName('')
  }

  const isUrl = /^https?:\/\//i.test(input.trim()) || /^www\./i.test(input.trim())

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {isUrl ? <Link className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          </div>
          <Input
            className="pl-9 h-10"
            placeholder="Tempel link lowongan atau ketik catatan..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <Input
          className="w-48 h-10"
          placeholder="Nama perusahaan (opsional)"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <Button type="submit" disabled={!input.trim()} className="h-10">
          <Plus className="h-4 w-4 mr-1" />
          Tambah
        </Button>
      </div>
      {input.trim() && (
        <p className="text-xs text-muted-foreground mt-1.5 ml-1">
          {isUrl
            ? '🔗 Link terdeteksi — nama perusahaan akan diekstrak otomatis'
            : '📝 Teks biasa — potongan awal akan jadi nama perusahaan'
          }
        </p>
      )}
    </form>
  )
}
