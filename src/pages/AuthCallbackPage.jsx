import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  useEffect(() => {
    supabase.auth.getSession().finally(() => navigate('/', { replace: true }))
  }, [navigate])
  return <div className="grid min-h-svh place-items-center"><LoaderCircle className="h-6 w-6 animate-spin" /></div>
}