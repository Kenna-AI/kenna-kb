'use client'
import { useState, useEffect } from 'react'

type Section = { id: string; title: string; subtitle: string; sort_order: number }
type Tool = {
  id: string; section_id: string; name: string; slug: string
  icon: string; tagline: string; steps: string[]; tips: string[]
  notes: string[]; published: boolean; sort_order: number; updated_at: string
}

const EMPTY: Omit<Tool, 'id' | 'updated_at'> = {
  section_id: '', name: '', slug: '', icon: '◎', tagline: '',
  steps: [''], tips: [''], notes: [''], published: true, sort_order: 0,
}

export default function AdminPage() {
  const [authed, setAuthed]       = useState(false)
  const [password, setPassword]   = useState('')
  const [authError, setAuthError] = useState('')
  const [sections, setSections]   = useState<Section[]>([])
  const [tools, setTools]         = useState<Tool[]>([])
  const [view, setView]           = useState<'list' | 'edit' | 'new'>('list')
  const [editing, setEditing]     = useState<Tool | null>(null)
  const [form, setForm]           = useState<Omit<Tool, 'id' | 'updated_at'>>(EMPTY)
  const [saving, setSaving]       = useState(false)
  const [msg, setMsg]             = useState('')
  const [token, setToken]         = useState('')

  async function login() {
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      const { token: t } = await res.json()
      setToken(t); setAuthed(true); loadData(t)
    } else { setAuthError('Incorrect password') }
  }

  async function loadData(t: string) {
    const [sr, tr] = await Promise.all([
      fetch('/api/sections', { headers: { 'x-admin-token': t } }),
      fetch('/api/tools', { headers: { 'x-admin-token': t } }),
    ])
    setSections(await sr.json()); setTools(await tr.json())
  }

  function startNew() {
    setForm({ ...EMPTY, section_id: sections[0]?.id || '' })
    setEditing(null); setView('new')
  }

  function startEdit(tool: Tool) {
    setForm({
      section_id: tool.section_id, name: tool.name, slug: tool.slug,
      icon: tool.icon, tagline: tool.tagline,
      steps: tool.steps.length ? tool.steps : [''],
      tips: tool.tips.length ? tool.tips : [''],
      notes: tool.notes.length ? tool.notes : [''],
      published: tool.published, sort_order: tool.sort_order,
    })
    setEditing(tool); setView('edit')
  }

  async function save() {
    setSaving(true); setMsg('')
    try {
      const body = {
        ...form,
        steps: form.steps.filter(Boolean),
        tips: form.tips.filter(Boolean),
        notes: form.notes.filter(Boolean),
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }
      const url = view === 'edit' ? `/api/tools/${editing!.id}` : '/api/tools'
      const method = view === 'edit' ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setMsg(view === 'edit' ? 'Saved.' : 'Tool created.')
        await loadData(token)
        setTimeout(() => setView('list'), 800)
      } else {
        const { error } = await res.json(); setMsg('Error: ' + error)
      }
    } finally { setSaving(false) }
  }

  async function deleteTool(id: string) {
    if (!confirm('Delete this tool?')) return
    await fetch(`/api/tools/${id}`, { method: 'DELETE', headers: { 'x-admin-token': token } })
    await loadData(token)
  }

  async function togglePublish(tool: Tool) {
    await fetch(`/api/tools/${tool.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ ...tool, published: !tool.published }),
    })
    await loadData(token)
  }

  function listField(key: 'steps' | 'tips' | 'notes', label: string) {
    return (
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>{label}</label>
        {form[key].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--red)', paddingTop: 10, flexShrink: 0 }}>{i + 1}.</span>
            <textarea value={item}
              onChange={e => { const arr = [...form[key]]; arr[i] = e.target.value; setForm(f => ({ ...f, [key]: arr })) }}
              rows={2} style={textareaStyle} placeholder={`${label} item ${i + 1}`} />
            <button onClick={() => {
              const arr = form[key].filter((_, j) => j !== i)
              setForm(f => ({ ...f, [key]: arr.length ? arr : [''] }))
            }} style={iconBtnStyle}>✕</button>
          </div>
        ))}
        <button onClick={() => setForm(f => ({ ...f, [key]: [...f[key], ''] }))}
          style={{ ...smallBtnStyle, marginTop: 4 }}>
          + Add {label.toLowerCase().replace(' *', '')}
        </button>
      </div>
    )
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 360, padding: 40, background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%', background: '#1a1816',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 11, color: '#C0303F',
          }}>K</div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>KENNA AI / Admin</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 400, marginBottom: 24, color: 'var(--text)' }}>Sign in to console</h1>
        <input type="password" placeholder="Admin password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          style={{ ...inputStyle, marginBottom: 12, width: '100%' }} />
        {authError && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{authError}</p>}
        <button onClick={login} style={{ ...btnStyle, width: '100%' }}>Sign in</button>
        <p style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'var(--mono)' }}>
          Set ADMIN_PASSWORD in Vercel env vars
        </p>
      </div>
    </div>
  )

  // ── Tool form ──────────────────────────────────────────────────────────────
  if (view === 'edit' || view === 'new') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setView('list')} style={{ ...smallBtnStyle }}>← Back</button>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)' }}>
            {view === 'new' ? 'New tool' : `Editing: ${editing?.name}`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {msg && <span style={{ fontSize: 13, color: msg.startsWith('Error') ? 'var(--red)' : 'var(--success)' }}>{msg}</span>}
          <button onClick={save} disabled={saving} style={btnStyle}>
            {saving ? 'Saving…' : view === 'new' ? 'Create tool' : 'Save changes'}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Tool name *</label>
            <input value={form.name} onChange={e => setForm(f => ({
              ...f, name: e.target.value,
              slug: f.slug || e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            }))} style={inputStyle} placeholder="e.g. Sketch to Image" />
          </div>
          <div>
            <label style={labelStyle}>URL slug *</label>
            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              style={inputStyle} placeholder="e.g. sketch-to-image" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr 100px', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Icon</label>
            <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
              style={{ ...inputStyle, textAlign: 'center', fontSize: 20 }} />
          </div>
          <div>
            <label style={labelStyle}>Section *</label>
            <select value={form.section_id} onChange={e => setForm(f => ({ ...f, section_id: e.target.value }))}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Order</label>
            <input type="number" value={form.sort_order}
              onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
              style={inputStyle} />
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Tagline *</label>
          <input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
            style={inputStyle} placeholder="One-line description of what the tool does" />
        </div>
        {listField('steps', 'Steps *')}
        {listField('tips', 'Pro tips')}
        {listField('notes', 'Notes')}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-sec)' }}>
            <input type="checkbox" checked={form.published}
              onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
              style={{ accentColor: 'var(--red)' }} />
            Published (visible on KB)
          </label>
        </div>
      </div>
    </div>
  )

  // ── Tool list ──────────────────────────────────────────────────────────────
  const bySection = sections.reduce<Record<string, Tool[]>>((acc, s) => {
    acc[s.id] = tools.filter(t => t.section_id === s.id)
    return acc
  }, {})

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%', background: '#1a1816',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 11, color: '#C0303F',
          }}>K</div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.06em', color: 'var(--text)' }}>Admin Console</span>
          <span style={{ color: 'var(--border)', fontSize: 14 }}>·</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--mono)' }}>{tools.length} tools</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/kb" target="_blank" style={{ ...smallBtnStyle, color: 'var(--text-muted)' }}>View KB ↗</a>
          <button onClick={startNew} style={btnStyle}>+ New tool</button>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 40px' }}>
        {sections.map(s => (
          <div key={s.id} style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{s.title}</h2>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{s.subtitle}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(bySection[s.id] || []).map(t => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10,
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 1, color: 'var(--text)' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.tagline}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>{t.steps.length}s · {t.tips.length}t</span>
                    <button onClick={() => togglePublish(t)} style={{
                      ...smallBtnStyle, fontSize: 10,
                      color: t.published ? 'var(--success)' : 'var(--text-muted)',
                      borderColor: t.published ? '#c0e0c0' : 'var(--border)',
                      background: t.published ? '#f0faf0' : 'transparent',
                    }}>{t.published ? 'Live' : 'Draft'}</button>
                    <a href={`/kb/${t.slug}`} target="_blank" style={{ ...smallBtnStyle, fontSize: 10 }}>View ↗</a>
                    <button onClick={() => startEdit(t)} style={{ ...smallBtnStyle, fontSize: 10 }}>Edit</button>
                    <button onClick={() => deleteTool(t.id)} style={{ ...smallBtnStyle, fontSize: 10, color: 'var(--red)', borderColor: '#f0c0c4' }}>Delete</button>
                  </div>
                </div>
              ))}
              {(!bySection[s.id] || bySection[s.id].length === 0) && (
                <div style={{ padding: '14px', color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>No tools in this section yet.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const headerStyle: React.CSSProperties = {
  height: 58, padding: '0 40px', borderBottom: '1px solid var(--border)',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  background: 'rgba(245,244,242,0.95)', backdropFilter: 'blur(12px)',
  position: 'sticky', top: 0, zIndex: 50,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', background: 'var(--bg-input)',
  border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)',
  fontSize: 13, fontFamily: 'var(--sans)', outline: 'none',
}
const textareaStyle: React.CSSProperties = {
  flex: 1, padding: '8px 12px', background: 'var(--bg-input)',
  border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)',
  fontSize: 13, fontFamily: 'var(--sans)', outline: 'none', resize: 'vertical',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 9, fontFamily: 'var(--mono)',
  color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8,
}
const btnStyle: React.CSSProperties = {
  padding: '8px 18px', background: 'var(--red)', color: '#fff',
  border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer',
  fontFamily: 'var(--sans)', fontWeight: 500,
}
const smallBtnStyle: React.CSSProperties = {
  padding: '5px 10px', background: 'transparent', color: 'var(--text-sec)',
  border: '1px solid var(--border)', borderRadius: 6, fontSize: 12,
  cursor: 'pointer', fontFamily: 'var(--sans)', textDecoration: 'none', display: 'inline-block',
}
const iconBtnStyle: React.CSSProperties = {
  padding: '8px', background: 'transparent', color: 'var(--text-muted)',
  border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer',
  flexShrink: 0, alignSelf: 'flex-start', marginTop: 4,
}
