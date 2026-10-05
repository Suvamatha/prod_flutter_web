import { Github, LoaderCircle } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../hooks/useAuth'

export default function AuthGate({ children }) {
  const { user, loading, signIn } = useAuth()

  if (loading) {
    return (
      <div className="grid min-h-svh place-items-center bg-[#FAFAFA]">
        <LoaderCircle className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    )
  }
  if (user) return children

  return (
    <main className="grid min-h-svh place-items-center bg-[#FAFAFA] px-5">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-card sm:p-10">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-9 text-3xl font-semibold tracking-tight">Show what your app can do.</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">
          Build a real, interactive Flutter web demo and share it with one permanent link.
        </p>
        <button className="btn btn-dark btn-lg mt-8 w-full" onClick={signIn}>
          <Github className="h-[18px] w-[18px]" /> Continue with GitHub
        </button>
        <p className="mt-4 text-xs text-zinc-400">No repository changes. Public repositories only during the MVP.</p>
      </div>
    </main>
  )
}