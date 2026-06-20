import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Briefcase, Heart, HelpCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Button } from './ui/button'

interface Props {
  children: React.ReactNode
  onHelp?: () => void
}

export function Layout({ children, onHelp }: Props) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const isWishlist = location.pathname === '/wishlist'

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <Briefcase className="h-5 w-5 text-primary" />
              <span>Job Tracker</span>
            </div>
            <nav className="flex items-center gap-1 text-sm">
              <Button
                variant={isWishlist ? 'ghost' : 'secondary'}
                size="sm"
                onClick={() => navigate('/')}
              >
                <Briefcase className="h-4 w-4 mr-1" />
                Active
              </Button>
              <Button
                variant={isWishlist ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => navigate('/wishlist')}
              >
                <Heart className="h-4 w-4 mr-1" />
                Wishlist
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button variant="ghost" size="icon" onClick={onHelp} title="Bantuan">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <span className="hidden sm:inline">{user?.email}</span>
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
