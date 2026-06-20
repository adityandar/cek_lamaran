import { Inbox } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
      <div className="mb-6 rounded-full bg-muted p-4">
        <Inbox className="h-10 w-10" />
      </div>
      <p className="text-lg font-medium">Belum ada job yang dicatat</p>
      <p className="text-sm mt-1 max-w-sm text-center">
        Tempel link lowongan atau ketik catatan di atas untuk memulai
      </p>
    </div>
  )
}
