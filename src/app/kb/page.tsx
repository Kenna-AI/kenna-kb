'use client'
import { useState, useEffect } from 'react'
import type { Section, Tool } from '@/lib/supabase'

export default function KBPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/kb/sections').then(r => r.json()),
      fetch('/api/kb/tools').then(r => r.json()),
    ]).then(([s, t]) => { setSections(s); setTools(t); setLoading(false) })
  }, [])

  const bySection = sections.reduce<Record<string, Tool[]>>((acc, s) => {
    acc[s.id] = tools.filter(t => t.section_id === s.id)
    return acc
  }, {})

  return (
    <>
      <style>{`
        .tool-card {
          display: block; padding: 20px 22px;
          background: var(--bg-panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          transition: border-color 0.15s, box-shadow 0.15s, transform 0.12s;
          color: inherit; text-decoration: none;
        }
        .tool-card:hover {
          border-color: rgba(192,48,63,0.3);
          box-shadow: 0 2px 12px rgba(192,48,63,0.06);
          transform: translateY(-1px);
        }
        .nav-link {
          display: block; padding: 5px 20px 5px 28px;
          font-size: 13px; color: var(--text-muted);
          border-left: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
          text-decoration: none; font-family: var(--sans);
        }
        .nav-link:hover { color: var(--text); border-left-color: var(--border); }
        .admin-link {
          font-size: 11px; font-family: var(--mono); color: var(--text-muted);
          padding: 5px 10px; border: 1px solid var(--border); border-radius: 6px;
          transition: color 0.15s, border-color 0.15s; text-decoration: none;
          letter-spacing: 0.04em;
        }
        .admin-link:hover { color: var(--text-sec); border-color: var(--text-muted); }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header style={{
          borderBottom: '1px solid var(--border)', padding: '0 40px', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: 'rgba(245,244,242,0.95)',
          backdropFilter: 'blur(12px)', zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: '#1a1816',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 12, color: '#C0303F',
            }}>K</div>
            <span style={{ fontFamily: 'var(--mono)', fontWeight: 500, fontSize: 13, letterSpacing: '0.06em', color: 'var(--text)' }}>
              KENNA AI
            </span>
            <span style={{ color: 'var(--border)', fontSize: 14, margin: '0 2px' }}>/</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--sans)' }}>Knowledge Base</span>
          </div>
          <a href="/admin" className="admin-link">Admin</a>
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
              Contents
            </div>
            {sections.map(s => (
              <div key={s.id} style={{ marginBottom: 20 }}>
                <a href={`#section-${s.id}`} style={{
                  display: 'block', padding: '3px 20px',
                  fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: '0.14em',
                  color: 'var(--red)', textTransform: 'uppercase', marginBottom: 4,
                  textDecoration: 'none',
                }}>{s.title}</a>
                {bySection[s.id]?.map(t => (
                  <a key={t.id} href={`/kb/${t.slug}`} className="nav-link">
                    {t.icon} {t.name}
                  </a>
                ))}
              </div>
            ))}
          </nav>

          {/* Main */}
          <main style={{ flex: 1, padding: '48px 56px', maxWidth: 880 }}>

            {/* Hero */}
            <div style={{ marginBottom: 56 }}>
              <div style={{
                display: 'inline-block', fontSize: 9, fontFamily: 'var(--mono)',
                letterSpacing: '0.16em', color: 'var(--red)', textTransform: 'uppercase',
                marginBottom: 16, padding: '4px 10px',
                border: '1px solid rgba(192,48,63,0.2)', borderRadius: 4,
                background: 'rgba(192,48,63,0.04)',
              }}>User Guide</div>
              <h1 style={{ fontSize: 42, fontWeight: 300, lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                Everything you need to<br />
                <em style={{ fontStyle: 'italic', color: 'var(--red)' }}>master Kenna AI</em>
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-sec)', maxWidth: 500, lineHeight: 1.7 }}>
                Step-by-step guides for every tool, pro tips from real design workflows, and everything you need to get production-ready results inside Photoshop.
              </p>
            </div>

            {loading && (
              <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>Loading tools…</div>
            )}

            {sections.map(s => (
              <div key={s.id} id={`section-${s.id}`} style={{ marginBottom: 56 }}>
                <div style={{ marginBottom: 24, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                  <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 3, color: 'var(--text)' }}>{s.title}</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.02em' }}>{s.subtitle}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                  {bySection[s.id]?.map(t => (
                    <a key={t.id} href={`/kb/${t.slug}`} className="tool-card">
                      <div style={{ fontSize: 20, marginBottom: 10 }}>{t.icon}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 5, color: 'var(--text)' }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-sec)', lineHeight: 1.5 }}>{t.tagline}</div>
                      <div style={{ marginTop: 14, fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--red)', letterSpacing: '0.04em' }}>
                        {t.steps?.length || 0} steps →
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </main>
        </div>

        <footer style={{
          borderTop: '1px solid var(--border)', padding: '20px 40px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--bg-panel)',
          color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.04em',
        }}>
          <span>KENNA AI — Knowledge Base</span>
          <span>Designed for fashion and product designers</span>
        </footer>
      </div>
    </>
  )
}
