import { useState } from 'react'
import { Plus, Link, FileText } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'

interface Props {
  onAdd: (input: string, companyName?: string, role?: string) => void
}

export function JobInput({ onAdd }: Props) {
  const [input, setInput] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')

  const isUrl = /^https?:\/\//i.test(input.trim()) || /^www\./i.test(input.trim())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    onAdd(input.trim(), companyName.trim() || undefined, role.trim() || undefined)
    setInput('')
    setCompanyName('')
    setRole('')
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
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={!input.trim()} className="h-10 shrink-0">
          <Plus className="h-4 w-4 mr-1" />
          Tambah
        </Button>
      </div>
      <div className="flex gap-2">
        <Input
          className="flex-1 h-10"
          placeholder="Nama perusahaan (opsional)"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <Input
          className="flex-1 h-10"
          placeholder="Posisi / role (opsional)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </div>
      {input.trim() && (
        <p className="text-xs text-muted-foreground ml-1">
          {isUrl
            ? '🔗 Link — nama perusahaan & role akan diekstrak otomatis'
            : '📝 Teks — kata pertama jadi nama perusahaan default. Catatan detail bisa ditambah nanti.'
          }
        </p>
      )}
    </form>
  )
}
