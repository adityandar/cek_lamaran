import { Inbox } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="mb-6 border-4 border-black bg-white p-4 shadow-[5px_5px_0_0_#000]">
        <Inbox className="h-10 w-10" />
      </div>
      <p className="text-lg font-black">Belum ada job yang dicatat</p>
      <p className="text-sm font-medium mt-1 max-w-sm text-center">
        Tempel link lowongan atau ketik catatan di atas untuk memulai
      </p>
    </div>
  )
}
