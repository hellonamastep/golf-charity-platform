'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import toast from 'react-hot-toast'

interface Charity {
  id: string
  name: string
  slug: string
  description: string
  website?: string
  is_featured: boolean
  is_active: boolean
  total_raised: number
}

const emptyForm = { name: '', slug: '', description: '', website: '', is_featured: false, is_active: true }

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Charity | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('charities').select('*').order('name')
    setCharities(data || [])
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true) }
  const openEdit = (c: Charity) => {
    setEditing(c)
    setForm({ name: c.name, slug: c.slug, description: c.description, website: c.website || '', is_featured: c.is_featured, is_active: c.is_active })
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    if (editing) {
      const { error } = await supabase.from('charities').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id)
      if (error) { toast.error(error.message) } else { toast.success('Charity updated'); setShowForm(false); load() }
    } else {
      const { error } = await supabase.from('charities').insert(form)
      if (error) { toast.error(error.message) } else { toast.success('Charity added!'); setShowForm(false); load() }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this charity? This cannot be undone.')) return
    const supabase = createClient()
    const { error } = await supabase.from('charities').delete().eq('id', id)
    if (error) { toast.error(error.message) } else { toast.success('Charity deleted'); load() }
  }

  const toggleActive = async (c: Charity) => {
    const supabase = createClient()
    await supabase.from('charities').update({ is_active: !c.is_active }).eq('id', c.id)
    load()
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Charities</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage the charity directory</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold btn-glow" style={{ background: 'var(--accent-emerald)', color: '#080810' }}>
          <Plus size={15} /> Add Charity
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-5">{editing ? 'Edit Charity' : 'Add New Charity'}</h3>
          <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} style={inputStyle} placeholder="Charity name"
                onFocus={(e) => (e.target.style.borderColor = 'rgba(0,200,150,0.4)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">Slug *</label>
              <input type="text" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className={inputClass} style={inputStyle} placeholder="url-friendly-slug"
                onFocus={(e) => (e.target.style.borderColor = 'rgba(0,200,150,0.4)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">Description *</label>
              <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass} style={{ ...inputStyle, resize: 'none' }} placeholder="Brief description of the charity's mission"
                onFocus={(e) => (e.target.style.borderColor = 'rgba(0,200,150,0.4)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">Website</label>
              <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={inputClass} style={inputStyle} placeholder="https://charity.org"
                onFocus={(e) => (e.target.style.borderColor = 'rgba(0,200,150,0.4)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
            </div>
            <div className="flex gap-6 items-center pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4" style={{ accentColor: 'var(--accent-gold)' }} />
                <span>Featured on homepage</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4" style={{ accentColor: 'var(--accent-emerald)' }} />
                <span>Active (visible)</span>
              </label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-semibold btn-glow disabled:opacity-50" style={{ background: 'var(--accent-emerald)', color: '#080810' }}>
                {saving ? 'Saving…' : editing ? 'Update Charity' : 'Add Charity'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl text-sm glass text-[var(--text-secondary)]">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Website</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {charities.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{c.slug}</div>
                </td>
                <td>
                  <button onClick={() => toggleActive(c)}>
                    <span className={`badge badge-${c.is_active ? 'active' : 'inactive'}`}>{c.is_active ? 'Active' : 'Inactive'}</span>
                  </button>
                </td>
                <td>
                  {c.is_featured && <Star size={14} style={{ color: 'var(--accent-gold)' }} />}
                </td>
                <td>
                  {c.website ? (
                    <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent-emerald)] hover:underline">Visit →</a>
                  ) : '—'}
                </td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-emerald)] transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-rose)] transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
