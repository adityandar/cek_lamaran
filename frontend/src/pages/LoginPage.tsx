import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export function LoginPage() {
  const { token, login, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (token) return <Navigate to="/" replace />

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, password)
  }

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border-4 border-black shadow-[8px_8px_0_0_#000] p-6">
        <div className="text-center mb-6">
          <div className="bg-black p-2 w-fit mx-auto mb-3">
            <Briefcase className="h-6 w-6 text-[#FFE600]" />
          </div>
          <h1 className="font-black text-xl -rotate-1">CekLamaran</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm font-bold text-center bg-red-100 border-2 border-red-600 text-red-700 py-2 px-3">
              {error}
            </p>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border-4 border-black px-3 py-2.5 text-sm font-medium bg-white focus:outline-none focus:shadow-[3px_3px_0_0_#000] transition-all placeholder:text-gray-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border-4 border-black px-3 py-2.5 text-sm font-medium bg-white focus:outline-none focus:shadow-[3px_3px_0_0_#000] transition-all placeholder:text-gray-400"
          />
          <button type="submit" className="w-full font-bold text-sm px-6 py-2.5 border-4 border-black bg-black text-white shadow-[5px_5px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
            Login
          </button>
          <p className="text-xs font-bold text-center">
            Belum punya akun?{' '}
            <Link to="/register" className="underline hover:no-underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
