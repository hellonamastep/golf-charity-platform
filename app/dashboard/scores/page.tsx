'use client'
import { useState, useEffect, useCallback } from 'react'
import { formatDate } from '@/lib/utils'
import { Plus, Trash2, Info } from 'lucide-react'
import toast from 'react-hot-toast'

interface Score {
  id: string
  score: number
  played_at: string
  course_name?: string
  notes?: string
}

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ score: '', played_at: '', course_name: '', notes: '' })

  const fetchScores = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/scores')
    const data = await res.json()
    setScores(data.scores || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchScores() }, [fetchScores])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const scoreNum = Number(form.score)
    if (scoreNum < 1 || scoreNum > 45) {
      toast.error('Score must be between 1 and 45')
      return
    }
    setAdding(true)
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, score: scoreNum }),
    })
    const data = await res.json()
    if (data.error) {
      toast.error(data.error)
    } else {
      toast.success('Score added!')
      setForm({ score: '', played_at: '', course_name: '', notes: '' })
      setShowForm(false)
      fetchScores()
    }
    setAdding(false)
  }

  const handleDelete = async (id: string) => {
    const res = await fetch('/api/scores', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      toast.success('Score removed')
      fetchScores()
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>My Scores</h1>
          <p className="text-[var(--text-secondary)] mt-1">Your last 5 Stableford scores — newest score replaces oldest</p>
        </div>
        {scores.length < 5 && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold btn-glow"
            style={{ background: 'var(--accent-emerald)', color: '#080810' }}
          >
            <Plus size={15} />
            Add Score
          </button>
        )}
      </div>

      {/* Info box */}
      <div className="flex gap-3 p-4 rounded-xl" style={{ background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.15)' }}>
        <Info size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-emerald)' }} />
        <div className="text-sm text-[var(--text-secondary)]">
          Only your <strong className="text-[var(--text-primary)]">last 5 scores</strong> are used as your monthly draw numbers.
          Scores range from <strong className="text-[var(--text-primary)]">1 to 45</strong> (Stableford format).
          Adding a 6th score automatically removes the oldest one.
        </div>
      </div>

      {/* Score balls */}
      {loading ? (
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="score-ball animate-pulse" style={{ background: 'var(--bg-elevated)', color: 'transparent' }}>0</div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {scores.map((s, i) => (
            <div key={s.id} className="text-center group">
              <div className="score-ball mb-1 relative">
                {s.score}
                <button
                  onClick={() => handleDelete(s.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'var(--accent-rose)', color: 'white' }}
                  title="Remove"
                >
                  <Trash2 size={9} />
                </button>
              </div>
              <div className="text-xs text-[var(--text-muted)]">{formatDate(s.played_at)}</div>
              {s.course_name && <div className="text-xs text-[var(--text-muted)] max-w-[60px] truncate mx-auto">{s.course_name}</div>}
            </div>
          ))}
          {Array.from({ length: 5 - scores.length }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="score-ball mb-1" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', boxShadow: 'none' }}>—</div>
              <div className="text-xs text-[var(--text-muted)]">Empty</div>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-5">Add a new score</h3>
          <form onSubmit={handleAdd} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">
                Stableford Score (1–45) *
              </label>
              <input
                type="number" min={1} max={45} required
                value={form.score}
                onChange={(e) => setForm({ ...form, score: e.target.value })}
                className={inputClass} style={inputStyle} placeholder="e.g. 32"
                onFocus={(e) => (e.target.style.borderColor = 'rgba(0,200,150,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">
                Date Played *
              </label>
              <input
                type="date" required
                value={form.played_at}
                onChange={(e) => setForm({ ...form, played_at: e.target.value })}
                className={inputClass} style={{ ...inputStyle, colorScheme: 'dark' }}
                max={new Date().toISOString().split('T')[0]}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(0,200,150,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">
                Course Name (optional)
              </label>
              <input
                type="text"
                value={form.course_name}
                onChange={(e) => setForm({ ...form, course_name: e.target.value })}
                className={inputClass} style={inputStyle} placeholder="e.g. Royal St George's"
                onFocus={(e) => (e.target.style.borderColor = 'rgba(0,200,150,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">
                Notes (optional)
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className={inputClass} style={inputStyle} placeholder="Any notes…"
                onFocus={(e) => (e.target.style.borderColor = 'rgba(0,200,150,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-1">
              <button
                type="submit" disabled={adding}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold btn-glow disabled:opacity-50"
                style={{ background: 'var(--accent-emerald)', color: '#080810' }}
              >
                {adding ? 'Adding…' : 'Save Score'}
              </button>
              <button
                type="button" onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] glass"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Score history table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-semibold">Score History</h3>
        </div>
        {scores.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Score</th>
                <th>Date</th>
                <th>Course</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold" style={{ background: 'rgba(0,200,150,0.1)', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                      {s.score}
                    </span>
                  </td>
                  <td className="text-[var(--text-secondary)]">{formatDate(s.played_at)}</td>
                  <td className="text-[var(--text-secondary)]">{s.course_name || '—'}</td>
                  <td className="text-[var(--text-secondary)]">{s.notes || '—'}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 rounded-lg hover:text-[var(--accent-rose)] text-[var(--text-muted)] transition-colors"
                      title="Remove score"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">⛳</div>
            <div className="text-[var(--text-secondary)]">No scores yet — add your first round</div>
          </div>
        )}
      </div>

      {/* Need Toaster */}
      <div id="toast-root" />
    </div>
  )
}
