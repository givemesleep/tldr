import React, { useState, useRef } from 'react';
import { GROUPED } from './sysadmin';

function debounce(fn: (...args: any[]) => void, ms: number) {
  let t: number;
  return (...args: any[]) => {
    clearTimeout(t);
    t = window.setTimeout(() => fn(...args), ms);
  };
}

const S = {
  app: { minHeight: '100vh', background: '#1a1a2e', color: '#e0e0e0', fontFamily: 'system-ui, sans-serif', display: 'flex' } as React.CSSProperties,
  sidebar: { width: 260, minHeight: '100vh', background: '#16213e', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column' as const, gap: '0.75rem', borderRight: '1px solid #0f3460', overflowY: 'auto' as const },
  sideLabel: { color: '#a0a0c0', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const },
  sideTitle: { fontSize: 26, fontWeight: 800, color: '#e94560', lineHeight: 1 },
  sideDesc: { fontSize: 12, color: '#8888aa', lineHeight: 1.5 },
  input: { width: '100%', padding: '0.55rem 0.8rem', borderRadius: 8, border: '1px solid #0f3460', background: '#0f3460', color: '#e0e0e0', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const },
  catLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: '#444466', marginTop: '0.5rem', paddingBottom: 2, borderBottom: '1px solid #1a1a3e' },
  cmdBtn: (active: boolean): React.CSSProperties => ({ background: active ? '#e94560' : 'transparent', color: active ? '#fff' : '#9090b0', border: 'none', borderRadius: 5, padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: 12, textAlign: 'left', width: '100%', marginBottom: 1 }),
  main: { flex: 1, padding: '2rem 2.5rem', maxWidth: 820, overflowY: 'auto' as const },
  title: { fontSize: 32, fontWeight: 800, margin: 0, color: '#ffffff' },
  accent: { width: 4, height: 36, background: '#e94560', borderRadius: 2 },
  desc: { background: '#16213e', borderLeft: '3px solid #0f3460', padding: '0.7rem 1rem', borderRadius: 4, marginBottom: '1.5rem', color: '#b0b0cc', fontSize: 14 },
  section: { fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#555577', marginBottom: '0.6rem', marginTop: '0.25rem' },
  exampleWrap: { marginBottom: '1rem' },
  exampleDesc: { color: '#c0c0dd', fontSize: 13, marginBottom: 4 },
  code: { background: '#0f3460', color: '#e0e0e0', padding: '0.4rem 0.8rem', borderRadius: 6, fontSize: 13, fontFamily: 'monospace', flex: 1, wordBreak: 'break-all' as const, display: 'block' },
  copyBtn: (copied: boolean): React.CSSProperties => ({ background: copied ? '#1a7a4a' : '#0f3460', color: copied ? '#7fffb2' : '#8888aa', border: 'none', borderRadius: 6, padding: '0.35rem 0.7rem', cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap', transition: 'all 0.2s' }),
  optRow: { display: 'flex', gap: 12, padding: '0.35rem 0', borderBottom: '1px solid #1a1a3e' } as React.CSSProperties,
  flag: { color: '#e94560', fontFamily: 'monospace', fontSize: 12, minWidth: 100 },
  optDesc: { color: '#8888aa', fontSize: 12 },
  bpCard: { background: '#16213e', border: '1px solid #0f3460', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '0.6rem' } as React.CSSProperties,
  bpTip: { color: '#c0c0dd', fontSize: 13, marginBottom: 4 },
  bpCode: { background: '#0a1628', color: '#7ec8e3', padding: '0.3rem 0.7rem', borderRadius: 5, fontSize: 12, fontFamily: 'monospace', display: 'block', marginTop: 4 },
  empty: { color: '#555577', fontSize: 15, marginTop: 60, textAlign: 'center' as const },
  footer: { marginTop: '1.5rem', fontSize: 11, color: '#444466', borderTop: '1px solid #1a1a3e', paddingTop: '0.75rem' },
};

export default function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const [activeCmd, setActiveCmd] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchCommand = async (q: string) => {
    if (!q.trim()) { setData(null); setError(''); setActiveCmd(''); return; }
    setLoading(true);
    setError('');
    setData(null);
    setActiveCmd(q.trim());
    try {
      const res = await fetch(`/api/command/${encodeURIComponent(q.trim())}`);
      if (!res.ok) throw new Error('Not found');
      setData(await res.json());
    } catch {
      setError('Command not found. Try another.');
      setActiveCmd('');
    } finally {
      setLoading(false);
    }
  };

  const doSearch = debounce(fetchCommand, 400);

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    doSearch(e.target.value);
  }

  function clickCmd(cmd: string) {
    if (inputRef.current) inputRef.current.value = cmd;
    fetchCommand(cmd);
  }

  function copy(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  }

  const grouped = GROUPED;

  return (
    <div style={S.app}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={S.sideLabel}>Linux Commands</div>
        <div style={S.sideTitle}>tl;dr</div>
        <div style={S.sideDesc}>Offline command reference for sysadmins. Search or click a command.</div>
        <div style={{ marginTop: '0.5rem' }}>
          <input ref={inputRef} onChange={onInput} autoFocus placeholder="Search a command…" style={S.input} />
        </div>
        {loading && <div style={{ color: '#8888aa', fontSize: 12 }}>Loading…</div>}
        {error && <div style={{ color: '#e94560', fontSize: 12 }}>{error}</div>}

        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ ...S.sideLabel, marginBottom: '0.4rem' }}>Useful SysAdmin Commands</div>
          {Object.entries(grouped).map(([cat, cmds]) => (
            <div key={cat}>
              <div style={S.catLabel}>{cat}</div>
              {cmds.map((c: any) => (
                <button key={c.command} style={S.cmdBtn(activeCmd === c.command)} onClick={() => clickCmd(c.command)} title={c.description}>
                  {c.command}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={S.main}>
        {!data && !loading && !error && (
          <div style={S.empty}>
            Click a command or search above.<br />
            <span style={{ fontSize: 12 }}>e.g.{' '}
              {['ls', 'grep', 'tar', 'systemctl'].map(cmd => (
                <code key={cmd} onClick={() => clickCmd(cmd)} style={{ background: '#0f3460', padding: '1px 7px', borderRadius: 4, color: '#e94560', cursor: 'pointer', marginRight: 4 }}>{cmd}</code>
              ))}
            </span>
          </div>
        )}

        {data && (
          <div>
            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.5rem' }}>
              <div style={S.accent} />
              <h1 style={S.title}>{data.command}</h1>
            </div>

            {/* Description */}
            {data.meaning && <div style={S.desc}>{data.meaning}</div>}

            {/* Examples */}
            {data.examples?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={S.section}>Examples</div>
                {data.examples.map((ex: any, i: number) => (
                  <div key={i} style={S.exampleWrap}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                      <span style={{ color: '#e94560', fontWeight: 700 }}>•</span>
                      <span style={S.exampleDesc}>{ex.description}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <code style={S.code}>
                        {ex.cmd.split(/(<[^>]+>|\{\{[^}]+\}\})/).map((part: string, pi: number) =>
                          /^(<[^>]+>|\{\{[^}]+\}\})$/.test(part)
                            ? <span key={pi} style={{ color: '#e94560' }}>{part}</span>
                            : part
                        )}
                      </code>
                      <button style={S.copyBtn(copied === i)} onClick={() => copy(ex.cmd, i)}>
                        {copied === i ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Best Practices */}
            {data.bestPractices?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={S.section}>Best Practices</div>
                {data.bestPractices.map((bp: any, i: number) => (
                  <div key={i} style={S.bpCard}>
                    <div style={S.bpTip}>💡 {bp.tip}</div>
                    {bp.example && <code style={S.bpCode}>{bp.example}</code>}
                  </div>
                ))}
              </div>
            )}

            {/* Options */}
            {data.options?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={S.section}>Options</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {data.options.map((o: any, i: number) => (
                    <div key={i} style={S.optRow}>
                      <code style={S.flag}>{o.flag}</code>
                      <span style={S.optDesc}>{o.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={S.footer}>
              Sources: {Object.entries(data.sources).filter(([, v]) => v).map(([k]) => k).join(', ') || 'tldr'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
