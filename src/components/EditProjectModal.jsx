import { useEffect, useState } from 'react'
import Modal from './Modal'
import { useProjects } from '../hooks/useProjects'
import { useToast } from '../hooks/useToast'

export default function EditProjectModal({ project, onClose }) {
  const { updateProject } = useProjects()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', description: '', screenId: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (project) setForm({ name: project.name, description: project.description, screenId: project.selectedDemo?.id })
  }, [project])

  if (!project) return null
  const save = async (e) => {
    e?.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    await updateProject(project.id, {
      name: form.name.trim(),
      description: form.description.trim(),
      selectedDemo: project.screens.find((s) => s.id === form.screenId) || project.selectedDemo,
    })
    setSaving(false)
    toast('Project saved', { description: 'No rebuild needed — your share link is unchanged.' })
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit project"
      description="Changes apply instantly to your demo page."
      footer={
        <>
          <button className="btn btn-secondary btn-md" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-md" onClick={save} disabled={saving || !form.name.trim()}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </>
      }
    >
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="label" htmlFor="pname">Name</label>
          <input id="pname" className="input h-11" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={60} autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="pdesc">Description</label>
          <textarea id="pdesc" rows={3} className="input h-auto resize-none py-3 leading-relaxed" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={160} />
        </div>
        <div>
          <span className="label">Starting screen</span>
          <div className="flex flex-wrap gap-2">
            {project.screens.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => setForm({ ...form, screenId: s.id })}
                className={`rounded-lg border px-3 py-1.5 text-[13px] transition ${form.screenId === s.id ? 'border-brand-500 bg-brand-50 font-medium text-brand-700' : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}
