import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from './useProjects'
import { useCopy } from './useCopy'
import { useToast } from './useToast'
import EditProjectModal from '../components/EditProjectModal'
import ConfirmModal from '../components/ConfirmModal'

/** Shared behaviour for the project three-dot menu (cards + detail page). */
export function useProjectActions() {
  const navigate = useNavigate()
  const { rebuildProject, deleteProject, rebuilds } = useProjects()
  const { copy } = useCopy()
  const toast = useToast()
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const actions = {
    open: (p) => navigate(`/projects/${p.slug}`),
    copyLink: (p) => copy(p.shareUrl, 'Share link copied'),
    edit: (p) => setEditing(p),
    rebuild: (p) => rebuildProject(p.id),
    remove: (p) => setDeleting(p),
    isRebuilding: (p) => rebuilds[p.id] !== undefined,
  }

  const modals = (
    <>
      <EditProjectModal project={editing} onClose={() => setEditing(null)} />
      <ConfirmModal
        open={!!deleting}
        title={`Delete ${deleting?.name}?`}
        description="The demo and its share link will stop working for everyone. This can't be undone."
        confirmLabel="Delete project"
        busy={busy}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          setBusy(true)
          const p = deleting
          await deleteProject(p.id)
          setBusy(false)
          setDeleting(null)
          toast(`${p.name} deleted`)
          if (window.location.pathname.startsWith('/projects/')) navigate('/')
        }}
      />
    </>
  )

  return { actions, modals }
}
