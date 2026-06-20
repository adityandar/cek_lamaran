import { LogOut, Briefcase } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Button } from './ui/button'

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Briefcase className="h-5 w-5 text-primary" />
            <span>Job Tracker</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-6">{children}</main>
    </div>
  )
}
