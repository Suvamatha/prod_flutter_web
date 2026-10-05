import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { useToast } from './useToast'
import { useAuth } from './useAuth'

const ProjectsContext = createContext(null)

/**
 * Client-side project store. Projects are created once and persisted; opening
 * a project only reads it. Rebuilds are explicit and keep the same demoId.
 */
export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [rebuilds, setRebuilds] = useState({}) // { [projectId]: currentStepIndex }
  const toast = useToast()
  const { user, loading: authLoading } = useAuth()

  const refresh = useCallback(async () => {
    setStatus('loading')
    try {
      setProjects(await api.listProjects())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setProjects([])
      setStatus('ready')
      return
    }
    refresh()
  }, [refresh, user, authLoading])

  const replace = (project) => setProjects((ps) => ps.map((p) => (p.id === project.id ? project : p)))

  const addProject = useCallback((project) => setProjects((ps) => [project, ...ps.filter((p) => p.id !== project.id)]), [])

  const updateProject = useCallback(async (id, patch) => {
    const updated = await api.updateProject(id, patch)
    replace(updated)
    return updated
  }, [])

  const deleteProject = useCallback(async (id) => {
    await api.deleteProject(id)
    setProjects((ps) => ps.filter((p) => p.id !== id))
  }, [])

  const rebuildProject = useCallback(async (id) => {
    if (rebuilds[id] !== undefined) return
    const before = projects.find((p) => p.id === id)?.status
    setRebuilds((r) => ({ ...r, [id]: 0 }))
    setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, status: 'building' } : p)))
    try {
      const updated = await api.rebuildProject(id, { onStep: (i) => setRebuilds((r) => ({ ...r, [id]: i })) })
      replace(updated)
      toast(before === 'not_built' ? 'Demo built' : 'Demo updated', { description: 'Built from the latest commit. Same share link.' })
    } catch (e) {
      setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, status: before || 'live' } : p)))
      toast(e.message || "Couldn't build the demo", { description: e.hint || (before === 'live' ? 'Your previous demo is still live.' : undefined), tone: 'error', duration: 9000 })
    } finally {
      setRebuilds(({ [id]: _, ...rest }) => rest)
    }
  }, [rebuilds, projects, toast])

  const restoreSamples = useCallback(async () => {
    setProjects(await api.restoreSamples())
  }, [])

  const value = useMemo(() => ({
    projects, status, rebuilds, refresh, addProject, updateProject, deleteProject, rebuildProject, restoreSamples,
  }), [projects, status, rebuilds, refresh, addProject, updateProject, deleteProject, rebuildProject, restoreSamples])

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

export function useProjects() {
  const ctx = useContext(ProjectsContext)
  if (!ctx) throw new Error('useProjects must be used inside <ProjectsProvider>')
  return ctx
}
