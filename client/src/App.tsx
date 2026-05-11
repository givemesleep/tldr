import React, { useState, useRef, useCallback, useEffect, lazy, Suspense } from 'react';
import { GROUPED } from './sysadmin';
const TerminalModal = lazy(() => import('./components/TerminalModal'));

function debounce(fn: (...args: any[]) => void, ms: number) {
  let t: number;
  return (...args: any[]) => {
    clearTimeout(t);
    t = window.setTimeout(() => fn(...args), ms);
  };
}

function useIsMobile() {
  const check = () =>
    /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && window.innerWidth < 1024);
  const [isMobile, setIsMobile] = useState(check);
  useEffect(() => {
    const handler = () => setIsMobile(check());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

type Theme = 'dark' | 'light';

const TC = {
  dark: {
    appBg: '#1a1a2e', sidebarBg: '#16213e', border: '#0f3460',
    primary: '#e94560', text: '#e0e0e0', textDim: '#8888aa', textMuted: '#555577',
    inputBg: '#0f3460', codeBg: '#0f3460', codeText: '#e0e0e0',
    bpCardBg: '#16213e', bpCodeBg: '#0a1628', bpCodeText: '#7ec8e3',
    catText: '#444466', catBorder: '#1a1a3e',
    descBg: '#16213e', descText: '#b0b0cc',
    dropdownBg: '#16213e', dropdownHover: '#0f3460',
    badgeBg: '#0f3460', badgeText: '#7ec8e3',
    toggleBg: '#0f3460',
  },
  light: {
    appBg: '#f0f4ff', sidebarBg: '#ffffff', border: '#d8dfef',
    primary: '#c0392b', text: '#1a1a2e', textDim: '#666688', textMuted: '#888899',
    inputBg: '#eef0f8', codeBg: '#e8ecf8', codeText: '#1a1a2e',
    bpCardBg: '#ffffff', bpCodeBg: '#d8eaf8', bpCodeText: '#1565c0',
    catText: '#999aaa', catBorder: '#e0e3f0',
    descBg: '#ffffff', descText: '#333355',
    dropdownBg: '#ffffff', dropdownHover: '#f0f4ff',
    badgeBg: '#e8ecf8', badgeText: '#1565c0',
    toggleBg: '#eef0f8',
  },
};

const PLATFORMS = [
  { value: 'all',     label: 'All' },
  { value: 'linux',   label: 'Linux' },
  { value: 'common',  label: 'Common' },
  { value: 'osx',     label: 'macOS' },
  { value: 'windows', label: 'Windows' },
  { value: 'freebsd', label: 'FreeBSD' },
  { value: 'android', label: 'Android' },
];

export default function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const [activeCmd, setActiveCmd] = useState('');
  const [termOpen, setTermOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [platform, setPlatform] = useState('all');
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [suggestions, setSuggestions] = useState<Array<{ command: string; description: string; platform: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const tc = TC[theme];
  const isMobile = useIsMobile();

  // Close suggestions when clicking outside the dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // useCallback makes fetchCommand a stable reference (only uses setState setters)
  const fetchCommand = useCallback(async (q: string) => {
    if (!q.trim()) { setData(null); setError(''); setActiveCmd(''); return; }
    setLoading(true);
    setError('');
    setData(null);
    setActiveCmd(q.trim());
    setShowSuggestions(false);
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
  }, []);

  const fetchSuggestions = useCallback(async (q: string, plt: string) => {
    if (!q.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&platform=${plt}`);
      if (!res.ok) return;
      const results = await res.json();
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch { /* network error — ignore */ }
  }, []);

  // Single stable debounce instance for suggestion fetching
  const doSearch = useRef(debounce((q: string, plt: string) => fetchSuggestions(q, plt), 300)).current;

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    doSearch(e.target.value, platform);
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

  // Stable callback so TerminalModal's useEffect deps never change on re-render
  const closeTerminal = useCallback(() => setTermOpen(false), []);

  const grouped = GROUPED;

  // ── Mobile layout ────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: tc.appBg, color: tc.text, fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>

        {/* Sticky header */}
        <div style={{ padding: '0.85rem 1rem', background: tc.sidebarBg, borderBottom: `1px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <div>
            <div style={{ color: tc.textDim, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Linux Commands</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: tc.primary, lineHeight: 1 }}>tl;dr</div>
          </div>
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{ background: tc.toggleBg, border: `1px solid ${tc.border}`, borderRadius: 8, padding: '0.45rem 0.75rem', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Search bar */}
        <div style={{ padding: '0.75rem 1rem', background: tc.sidebarBg, borderBottom: `1px solid ${tc.border}` }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <select
              value={platform}
              onChange={e => {
                const p = e.target.value;
                setPlatform(p);
                if (inputRef.current?.value) fetchSuggestions(inputRef.current.value, p);
              }}
              style={{ padding: '0.6rem 0.4rem', borderRadius: 8, border: `1px solid ${tc.border}`, background: tc.inputBg, color: tc.text, fontSize: 13, flexShrink: 0, outline: 'none', cursor: 'pointer' }}
            >
              {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>

            <div style={{ position: 'relative', flex: 1 }} ref={suggestionsRef}>
              <input
                ref={inputRef}
                onChange={onInput}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                placeholder="Search commands…"
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8, border: `1px solid ${tc.border}`, background: tc.inputBg, color: tc.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: tc.dropdownBg, border: `1px solid ${tc.border}`, borderRadius: 8, marginTop: 4, maxHeight: 280, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                  {suggestions.map(s => (
                    <div
                      key={s.command}
                      onMouseDown={() => clickCmd(s.command)}
                      onTouchStart={() => clickCmd(s.command)}
                      style={{ padding: '0.65rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${tc.catBorder}` }}
                    >
                      <span style={{ color: tc.primary, fontWeight: 700, fontSize: 14, fontFamily: 'monospace', minWidth: 80 }}>{s.command}</span>
                      {s.description && <span style={{ color: tc.textDim, fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description}</span>}
                      <span style={{ background: tc.badgeBg, color: tc.badgeText, fontSize: 10, padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>{s.platform}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {loading && <div style={{ color: tc.textDim, fontSize: 13, marginTop: 6 }}>Loading…</div>}
          {error && <div style={{ color: tc.primary, fontSize: 13, marginTop: 6 }}>{error}</div>}
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>

          {/* Welcome prompt */}
          {!data && !loading && !error && (
            <div style={{ color: tc.textMuted, fontSize: 14, marginTop: 36, textAlign: 'center' }}>
              Search or tap a command below.<br />
              <span style={{ fontSize: 13 }}>e.g.{' '}
                {['ls', 'grep', 'tar', 'systemctl'].map(cmd => (
                  <code
                    key={cmd}
                    onClick={() => clickCmd(cmd)}
                    style={{ background: tc.codeBg, padding: '3px 9px', borderRadius: 4, color: tc.primary, cursor: 'pointer', marginRight: 4, display: 'inline-block', marginTop: 6 }}
                  >
                    {cmd}
                  </code>
                ))}
              </span>
            </div>
          )}

          {/* Command result */}
          {data && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
                <div style={{ width: 4, height: 30, background: tc.primary, borderRadius: 2 }} />
                <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: tc.text }}>{data.command}</h1>
              </div>

              {data.meaning && (
                <div style={{ background: tc.descBg, borderLeft: `3px solid ${tc.border}`, padding: '0.6rem 0.9rem', borderRadius: 4, marginBottom: '1.2rem', color: tc.descText, fontSize: 13 }}>
                  {data.meaning}
                </div>
              )}

              {data.examples?.length > 0 && (
                <div style={{ marginBottom: '1.2rem' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: tc.textMuted, marginBottom: '0.5rem' }}>Examples</div>
                  {data.examples.map((ex: any, i: number) => (
                    <div key={i} style={{ marginBottom: '0.9rem' }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                        <span style={{ color: tc.primary, fontWeight: 700 }}>•</span>
                        <span style={{ color: tc.descText, fontSize: 13 }}>{ex.description}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <code style={{ background: tc.codeBg, color: tc.codeText, padding: '0.5rem 0.75rem', borderRadius: 6, fontSize: 12, fontFamily: 'monospace', flex: 1, wordBreak: 'break-all', display: 'block' }}>
                          {ex.cmd.split(/(<[^>]+>|\{\{[^}]+\}\})/).map((part: string, pi: number) =>
                            /^(<[^>]+>|\{\{[^}]+\}\})$/.test(part)
                              ? <span key={pi} style={{ color: tc.primary }}>{part}</span>
                              : part
                          )}
                        </code>
                        <button
                          style={{ background: copied === i ? '#1a7a4a' : tc.codeBg, color: copied === i ? '#7fffb2' : tc.textDim, border: 'none', borderRadius: 6, padding: '0.55rem 0.75rem', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0 }}
                          onClick={() => copy(ex.cmd, i)}
                        >
                          {copied === i ? '✓' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {data.bestPractices?.length > 0 && (
                <div style={{ marginBottom: '1.2rem' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: tc.textMuted, marginBottom: '0.5rem' }}>Best Practices</div>
                  {data.bestPractices.map((bp: any, i: number) => (
                    <div key={i} style={{ background: tc.bpCardBg, border: `1px solid ${tc.border}`, borderRadius: 8, padding: '0.65rem 0.9rem', marginBottom: '0.5rem' }}>
                      <div style={{ color: tc.descText, fontSize: 13, marginBottom: 4 }}>💡 {bp.tip}</div>
                      {bp.example && <code style={{ background: tc.bpCodeBg, color: tc.bpCodeText, padding: '0.3rem 0.6rem', borderRadius: 5, fontSize: 11, fontFamily: 'monospace', display: 'block', marginTop: 4 }}>{bp.example}</code>}
                    </div>
                  ))}
                </div>
              )}

              {data.options?.length > 0 && (
                <div style={{ marginBottom: '1.2rem' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: tc.textMuted, marginBottom: '0.5rem' }}>Options</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {data.options.map((o: any, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: 10, padding: '0.35rem 0', borderBottom: `1px solid ${tc.catBorder}` }}>
                        <code style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 12, minWidth: 90 }}>{o.flag}</code>
                        <span style={{ color: tc.textDim, fontSize: 12 }}>{o.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.relatedCommands?.length > 0 && (
                <div style={{ marginBottom: '1.2rem' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: tc.textMuted, marginBottom: '0.5rem' }}>Related</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {data.relatedCommands.map((rc: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => clickCmd(rc.command)}
                        title={rc.description || rc.command}
                        style={{ background: tc.badgeBg, color: tc.badgeText, border: `1px solid ${tc.border}`, borderRadius: 6, padding: '0.35rem 0.75rem', fontSize: 13, fontFamily: 'monospace', cursor: 'pointer', fontWeight: 600 }}
                      >
                        {rc.command}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1.2rem', fontSize: 11, color: tc.textMuted, borderTop: `1px solid ${tc.catBorder}`, paddingTop: '0.65rem' }}>
                Sources: {Object.entries(data.sources).filter(([, v]) => v).map(([k]) => k).join(', ') || 'tldr'}
              </div>
            </div>
          )}

          {/* SysAdmin accordion */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ color: tc.textDim, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: '0.5rem' }}>SysAdmin Commands</div>
            {Object.entries(grouped).map(([cat, cmds]) => {
              const open = expandedCats.has(cat);
              const hasActive = (cmds as any[]).some((c: any) => c.command === activeCmd);
              return (
                <div key={cat} style={{ marginBottom: 2 }}>
                  <button
                    onClick={() => setExpandedCats(prev => {
                      const next = new Set(prev);
                      next.has(cat) ? next.delete(cat) : next.add(cat);
                      return next;
                    })}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: open ? tc.inputBg : 'transparent', border: `1px solid ${open ? tc.border : 'transparent'}`, borderRadius: 6, padding: '0.5rem 0.7rem', cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: hasActive ? tc.primary : tc.catText }}>{cat}</span>
                    <span style={{ fontSize: 11, color: tc.catText, transition: 'transform 0.15s', display: 'inline-block', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                  </button>
                  {open && (
                    <div style={{ paddingLeft: '0.5rem', paddingTop: 4, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {(cmds as any[]).map((c: any) => (
                        <button
                          key={c.command}
                          onClick={() => clickCmd(c.command)}
                          title={c.description}
                          style={{ background: activeCmd === c.command ? tc.primary : tc.inputBg, color: activeCmd === c.command ? '#fff' : tc.textDim, border: 'none', borderRadius: 5, padding: '0.35rem 0.7rem', cursor: 'pointer', fontSize: 13, marginBottom: 1 }}
                        >
                          {c.command}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  // ── End mobile layout ────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: tc.appBg, color: tc.text, fontFamily: 'system-ui, sans-serif', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: 270, minHeight: '100vh', background: tc.sidebarBg, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderRight: `1px solid ${tc.border}`, overflowY: 'auto' }}>

        {/* Header row: title + theme toggle */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: tc.textDim, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Linux Commands</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: tc.primary, lineHeight: 1 }}>tl;dr</div>
          </div>
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{ background: tc.toggleBg, border: `1px solid ${tc.border}`, borderRadius: 8, padding: '0.3rem 0.55rem', cursor: 'pointer', fontSize: 15, lineHeight: 1, marginTop: 2 }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        <div style={{ fontSize: 12, color: tc.textDim, lineHeight: 1.5 }}>Offline command reference for sysadmins.</div>

        {/* Platform dropdown + search bar row */}
        <div style={{ display: 'flex', gap: 6, marginTop: '0.25rem' }}>
          <select
            value={platform}
            onChange={e => {
              const p = e.target.value;
              setPlatform(p);
              if (inputRef.current?.value) fetchSuggestions(inputRef.current.value, p);
            }}
            style={{ padding: '0.5rem 0.35rem', borderRadius: 8, border: `1px solid ${tc.border}`, background: tc.inputBg, color: tc.text, fontSize: 11, cursor: 'pointer', flexShrink: 0, outline: 'none' }}
          >
            {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>

          {/* Search input + suggestions dropdown */}
          <div style={{ position: 'relative', flex: 1 }} ref={suggestionsRef}>
            <input
              ref={inputRef}
              onChange={onInput}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              autoFocus
              placeholder="Search commands…"
              style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: 8, border: `1px solid ${tc.border}`, background: tc.inputBg, color: tc.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: tc.dropdownBg, border: `1px solid ${tc.border}`, borderRadius: 8, marginTop: 4, maxHeight: 260, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                {suggestions.map((s) => (
                  <div
                    key={s.command}
                    onMouseDown={() => clickCmd(s.command)}
                    style={{ padding: '0.45rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${tc.catBorder}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = tc.dropdownHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ color: tc.primary, fontWeight: 700, fontSize: 13, fontFamily: 'monospace', minWidth: 80 }}>{s.command}</span>
                    {s.description && <span style={{ color: tc.textDim, fontSize: 11, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description}</span>}
                    <span style={{ background: tc.badgeBg, color: tc.badgeText, fontSize: 10, padding: '1px 6px', borderRadius: 4, flexShrink: 0 }}>{s.platform}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Terminal button */}
        <button
          onClick={() => setTermOpen(true)}
          style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: 8, border: `1px solid ${tc.primary}`, background: 'transparent', color: tc.primary, fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span style={{ fontSize: 14 }}>{'>'}_</span> Launch Terminal
        </button>

        {loading && <div style={{ color: tc.textDim, fontSize: 12 }}>Loading…</div>}
        {error && <div style={{ color: tc.primary, fontSize: 12 }}>{error}</div>}

        {/* Sysadmin command list — collapsible by category */}
        <div style={{ marginTop: '0.25rem' }}>
          <div style={{ color: tc.textDim, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: '0.4rem' }}>SysAdmin Commands</div>
          {Object.entries(grouped).map(([cat, cmds]) => {
            const open = expandedCats.has(cat);
            const hasActive = (cmds as any[]).some((c: any) => c.command === activeCmd);
            return (
              <div key={cat} style={{ marginBottom: 2 }}>
                <button
                  onClick={() => setExpandedCats(prev => {
                    const next = new Set(prev);
                    next.has(cat) ? next.delete(cat) : next.add(cat);
                    return next;
                  })}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: open ? tc.inputBg : 'transparent', border: `1px solid ${open ? tc.border : 'transparent'}`, borderRadius: 6, padding: '0.3rem 0.5rem', cursor: 'pointer', marginTop: '0.25rem' }}
                >
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: hasActive ? tc.primary : tc.catText }}>{cat}</span>
                  <span style={{ fontSize: 10, color: tc.catText, transition: 'transform 0.15s', display: 'inline-block', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                </button>
                {open && (
                  <div style={{ paddingLeft: '0.4rem', paddingTop: 2 }}>
                    {(cmds as any[]).map((c: any) => (
                      <button key={c.command} onClick={() => clickCmd(c.command)} title={c.description}
                        style={{ background: activeCmd === c.command ? tc.primary : 'transparent', color: activeCmd === c.command ? '#fff' : tc.textDim, border: 'none', borderRadius: 5, padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: 12, textAlign: 'left', width: '100%', marginBottom: 1 }}>
                        {c.command}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: 820, overflowY: 'auto' }}>
        {!data && !loading && !error && (
          <div style={{ color: tc.textMuted, fontSize: 15, marginTop: 60, textAlign: 'center' }}>
            Click a command or search above.<br />
            <span style={{ fontSize: 12 }}>e.g.{' '}
              {['ls', 'grep', 'tar', 'systemctl'].map(cmd => (
                <code key={cmd} onClick={() => clickCmd(cmd)}
                  style={{ background: tc.codeBg, padding: '1px 7px', borderRadius: 4, color: tc.primary, cursor: 'pointer', marginRight: 4 }}>
                  {cmd}
                </code>
              ))}
            </span>
          </div>
        )}

        {data && (
          <div>
            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.5rem' }}>
              <div style={{ width: 4, height: 36, background: tc.primary, borderRadius: 2 }} />
              <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, color: tc.text }}>{data.command}</h1>
            </div>

            {/* Description */}
            {data.meaning && (
              <div style={{ background: tc.descBg, borderLeft: `3px solid ${tc.border}`, padding: '0.7rem 1rem', borderRadius: 4, marginBottom: '1.5rem', color: tc.descText, fontSize: 14 }}>
                {data.meaning}
              </div>
            )}

            {/* Examples */}
            {data.examples?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: tc.textMuted, marginBottom: '0.6rem', marginTop: '0.25rem' }}>Examples</div>
                {data.examples.map((ex: any, i: number) => (
                  <div key={i} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                      <span style={{ color: tc.primary, fontWeight: 700 }}>•</span>
                      <span style={{ color: tc.descText, fontSize: 13 }}>{ex.description}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <code style={{ background: tc.codeBg, color: tc.codeText, padding: '0.4rem 0.8rem', borderRadius: 6, fontSize: 13, fontFamily: 'monospace', flex: 1, wordBreak: 'break-all', display: 'block' }}>
                        {ex.cmd.split(/(<[^>]+>|\{\{[^}]+\}\})/).map((part: string, pi: number) =>
                          /^(<[^>]+>|\{\{[^}]+\}\})$/.test(part)
                            ? <span key={pi} style={{ color: tc.primary }}>{part}</span>
                            : part
                        )}
                      </code>
                      <button
                        style={{ background: copied === i ? '#1a7a4a' : tc.codeBg, color: copied === i ? '#7fffb2' : tc.textDim, border: 'none', borderRadius: 6, padding: '0.35rem 0.7rem', cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                        onClick={() => copy(ex.cmd, i)}>
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
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: tc.textMuted, marginBottom: '0.6rem', marginTop: '0.25rem' }}>Best Practices</div>
                {data.bestPractices.map((bp: any, i: number) => (
                  <div key={i} style={{ background: tc.bpCardBg, border: `1px solid ${tc.border}`, borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '0.6rem' }}>
                    <div style={{ color: tc.descText, fontSize: 13, marginBottom: 4 }}>💡 {bp.tip}</div>
                    {bp.example && <code style={{ background: tc.bpCodeBg, color: tc.bpCodeText, padding: '0.3rem 0.7rem', borderRadius: 5, fontSize: 12, fontFamily: 'monospace', display: 'block', marginTop: 4 }}>{bp.example}</code>}
                  </div>
                ))}
              </div>
            )}

            {/* Options */}
            {data.options?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: tc.textMuted, marginBottom: '0.6rem', marginTop: '0.25rem' }}>Options</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {data.options.map((o: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '0.35rem 0', borderBottom: `1px solid ${tc.catBorder}` }}>
                      <code style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 12, minWidth: 100 }}>{o.flag}</code>
                      <span style={{ color: tc.textDim, fontSize: 12 }}>{o.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Commands */}
            {data.relatedCommands?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: tc.textMuted, marginBottom: '0.6rem', marginTop: '0.25rem' }}>Related Commands</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {data.relatedCommands.map((rc: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => clickCmd(rc.command)}
                      title={rc.description || rc.command}
                      style={{ background: tc.badgeBg, color: tc.badgeText, border: `1px solid ${tc.border}`, borderRadius: 6, padding: '0.25rem 0.65rem', fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', fontWeight: 600 }}
                    >
                      {rc.command}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: '1.5rem', fontSize: 11, color: tc.textMuted, borderTop: `1px solid ${tc.catBorder}`, paddingTop: '0.75rem' }}>
              Sources: {Object.entries(data.sources).filter(([, v]) => v).map(([k]) => k).join(', ') || 'tldr'}
            </div>
          </div>
        )}
      </div>

      {termOpen && (
        <Suspense fallback={null}>
          <TerminalModal onClose={closeTerminal} />
        </Suspense>
      )}
    </div>
  );
}
