import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Briefcase, Heart, HelpCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

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
    <div className="min-h-screen bg-[#FFFDF7]">
      <header className="sticky top-0 z-40 bg-[#FFE600] border-b-4 border-black shadow-[0_6px_0_0_#000]">
        <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 gap-2">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2 font-black text-lg sm:text-xl tracking-tight shrink-0">
              <div className="bg-black p-1.5">
                <Briefcase className="h-5 w-5 text-[#FFE600]" />
              </div>
              <span className="-rotate-1 hidden sm:inline">CekLamaran</span>
            </div>
            <nav className="flex items-center gap-1 sm:gap-2 text-sm whitespace-nowrap shrink-0">
              <button
                onClick={() => navigate('/dashboard')}
                className={`inline-flex items-center gap-1 font-bold px-2 sm:px-3 py-1.5 border-2 border-black transition-all text-xs sm:text-sm ${
                  isWishlist
                    ? 'bg-white hover:bg-gray-100 shadow-[3px_3px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px]'
                    : 'bg-black text-white shadow-[3px_3px_0_0_#000]'
                }`}
              >
                <Briefcase className="h-4 w-4 -mt-0.5" />
                <span className="hidden sm:inline">Active</span>
              </button>
              <button
                onClick={() => navigate('/wishlist')}
                className={`inline-flex items-center gap-1 font-bold px-2 sm:px-3 py-1.5 border-2 border-black transition-all text-xs sm:text-sm ${
                  isWishlist
                    ? 'bg-black text-white shadow-[3px_3px_0_0_#000]'
                    : 'bg-white hover:bg-gray-100 shadow-[3px_3px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px]'
                }`}
              >
                <Heart className="h-4 w-4 -mt-0.5" />
                <span className="hidden sm:inline">Wishlist</span>
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-sm shrink-0">
            <button onClick={onHelp} className="inline-flex items-center justify-center p-1.5 border-2 border-black bg-white shadow-[3px_3px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all" title="Bantuan">
              <HelpCircle className="h-4 w-4" />
            </button>
            <span className="hidden sm:inline text-sm font-bold truncate max-w-[100px] xl:max-w-[200px]">{user?.email}</span>
            <button onClick={() => { logout(); navigate('/'); }} className="inline-flex items-center gap-1 font-bold px-2 sm:px-3 py-1.5 border-2 border-black bg-white hover:bg-gray-100 shadow-[3px_3px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xs sm:text-sm">
              <LogOut className="h-4 w-4 sm:mr-1 -mt-0.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-6">{children}</main>
    </div>
  )
}
