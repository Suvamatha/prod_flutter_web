import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="container-page flex flex-col items-center py-32 text-center">
      <p className="font-mono text-sm text-zinc-400">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Page not found</h1>
      <Link to="/" className="btn btn-secondary btn-md mt-8">Back to My Projects</Link>
    </div>
  )
}
