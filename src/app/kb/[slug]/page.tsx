'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import type { Tool, Section } from '@/lib/supabase'

export default function ToolPage() {
  const params = useParams()
  const slug = params.slug as string
  const [tool, setTool] = useState<Tool | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [sectionTools, setSectionTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/kb/tool?slug=${slug}`).then(r => r.json()),
      fetch('/api/kb/sections').then(r => r.json()),
      fetch('/api/kb/tools').then(r => r.json()),
    ]).then(([t, s, allTools]) => {
      setTool(t.error ? null : t)
      setSections(s)
      setSectionTools(allTools.filter((x: Tool) => x.section_id === t.section_id))
      setLoading(false)
    })
  }, [slug])

  const section = sections.find(s => s.id === tool?.section_id)
  const currentIdx = sectionTools.findIndex(t => t.id === tool?.id)
  const prev = currentIdx > 0 ? sectionTools[currentIdx - 1] : null
  const next = currentIdx < sectionTools.length - 1 ? sectionTools[currentIdx + 1] : null

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>Loading…</span>
    </div>
  )

  if (!tool) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>Tool not found.</span>
    </div>
  )

  return (
    <>
      <style>{`
        .sidebar-link {
          display: block; padding: 6px 20px 6px 28px; font-size: 13px;
          color: var(--text-muted); border-left: 2px solid transparent;
          transition: color 0.15s; text-decoration: none;
        }
        .sidebar-link:hover { color: var(--text); }
        .sidebar-link.active { color: var(--text); border-left-color: var(--red); background: var(--red-dim); }
        .nav-btn {
          flex: 1; padding: 14px 18px; background: var(--bg-panel);
          border: 1px solid var(--border); border-radius: 10px;
          transition: border-color 0.15s, box-shadow 0.15s;
          text-decoration: none; color: inherit; display: block;
        }
        .nav-btn:hover { border-color: var(--text-muted); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .tip-card {
          display: flex; gap: 12px; align-items: flex-start;
          padding: 12px 16px; background: var(--bg-input);
          border: 1px solid var(--border); border-radius: 8px;
        }
        .breadcrumb-link { color: var(--text-muted); text-decoration: none; font-size: 13px; }
        .breadcrumb-link:hover { color: var(--text); }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

        {/* Header */}
        <header style={{
          borderBottom: '1px solid var(--border)', padding: '0 40px', height: 60,
          display: 'flex', alignItems: 'center', gap: 6,
          position: 'sticky', top: 0, background: 'rgba(245,244,242,0.95)',
          backdropFilter: 'blur(12px)', zIndex: 100,
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%', background: '#1a1816', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 11, color: '#C0303F',
          }}>K</div>
          <a href="/kb" className="breadcrumb-link" style={{ fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '0.05em', fontWeight: 500, color: 'var(--text)' }}>KENNA AI</a>
          <span style={{ color: 'var(--border)', fontSize: 14 }}>/</span>
          <a href="/kb" className="breadcrumb-link">Knowledge Base</a>
          <span style={{ color: 'var(--border)', fontSize: 14 }}>/</span>
          <span style={{ color: 'var(--text)', fontSize: 13 }}>{tool.name}</span>
        </header>

        <div style={{ display: 'flex', flex: 1 }}>

          {/* Sidebar */}
          <nav style={{
            width: 220, flexShrink: 0, padding: '28px 0',
            borderRight: '1px solid var(--border)',
            position: 'sticky', top: 60, height: 'calc(100vh - 60px)', overflowY: 'auto',
            background: 'var(--bg-panel)',
          }}>
            <div style={{ padding: '0 20px 14px', fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: '0.18em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {section?.title}
            </div>
            {sectionTools.map(t => (
              <a key={t.id} href={`/kb/${t.slug}`}
                className={`sidebar-link${t.id === tool.id ? ' active' : ''}`}>
                {t.icon} {t.name}
              </a>
            ))}
            <div style={{ padding: '20px 20px 0', borderTop: '1px solid var(--border)', marginTop: 14 }}>
              <a href="/kb" style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)', textDecoration: 'none' }}>← All tools</a>
            </div>
          </nav>

          {/* Content */}
          <main style={{ flex: 1, padding: '48px 56px', maxWidth: 780 }}>

            {/* Tool header */}
            <div style={{ marginBottom: 44 }}>
              <div style={{ fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: '0.16em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 18 }}>
                {section?.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <span style={{ fontSize: 32 }}>{tool.icon}</span>
                <h1 style={{ fontSize: 32, fontWeight: 400, letterSpacing: '-0.01em', color: 'var(--text)' }}>{tool.name}</h1>
              </div>
              <p style={{ fontSize: 15, color: 'var(--text-sec)', fontStyle: 'italic', lineHeight: 1.6 }}>{tool.tagline}</p>
            </div>

            {/* Steps */}
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 18 }}>
                How to use it
              </h2>
              <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tool.steps.map((step, i) => (
                  <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{
                      flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
                      background: 'var(--red)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 10, fontFamily: 'var(--mono)',
                      fontWeight: 600, color: '#fff', marginTop: 2,
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text)' }}>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tips */}
            {tool.tips.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <h2 style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 18 }}>
                  Pro tips
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {tool.tips.map((tip, i) => (
                    <div key={i} className="tip-card">
                      <span style={{ color: 'var(--red)', flexShrink: 0, fontSize: 14, lineHeight: 1.65 }}>✦</span>
                      <span style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text-sec)' }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {tool.notes.length > 0 && (
              <div style={{
                marginBottom: 36, padding: '14px 18px',
                border: '1px solid var(--border)', borderLeft: '3px solid var(--text-muted)',
                borderRadius: 8, background: 'var(--bg-input)',
              }}>
                {tool.notes.map((note, i) => (
                  <p key={i} style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.65, fontStyle: 'italic' }}>
                    <strong style={{ color: 'var(--text-sec)', fontStyle: 'normal' }}>Note: </strong>{note}
                  </p>
                ))}
              </div>
            )}

            {/* Prev / Next */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 56, paddingTop: 28, borderTop: '1px solid var(--border)', gap: 14 }}>
              {prev ? (
                <a href={`/kb/${prev.slug}`} className="nav-btn">
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.04em' }}>← Previous</div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{prev.icon} {prev.name}</div>
                </a>
              ) : <div style={{ flex: 1 }} />}
              {next ? (
                <a href={`/kb/${next.slug}`} className="nav-btn" style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.04em' }}>Next →</div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{next.icon} {next.name}</div>
                </a>
              ) : <div style={{ flex: 1 }} />}
            </div>

          </main>
        </div>
      </div>
    </>
  )
}
