// src/App.jsx
import { useState, useEffect } from 'react';
import Background from './components/Background';
import EmailAnalyzer from './pages/EmailAnalyzer';
import MetricsDashboard from './pages/MetricsDashboard';
import BulkAnalyzer from './pages/BulkAnalyzer';
import HowItWorks from './pages/HowItWorks';
import { checkHealth } from './utils/api';

const TABS = [
  { id: 'analyze', label: 'Analyze Email', icon: '🔍' },
  { id: 'bulk',    label: 'Bulk Scanner',  icon: '📮' },
  { id: 'metrics', label: 'Model Metrics', icon: '📊' },
  { id: 'how',     label: 'How It Works',  icon: '🧠' },
];

export default function App() {
  const [tab, setTab] = useState('analyze');
  const [modelReady, setModelReady] = useState(false);
  const [checking, setChecking] = useState(true);

  // Poll backend until model is ready
  useEffect(() => {
    let interval;
    const poll = async () => {
      try {
        const data = await checkHealth();
        if (data.model_ready) {
          setModelReady(true);
          setChecking(false);
          clearInterval(interval);
        }
      } catch {
        // backend not yet up
      }
    };
    poll();
    interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Background />

      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* ── Top Nav ──────────────────────────────────────── */}
        <header style={{
          padding: '0 24px',
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1.5px solid rgba(255,255,255,0.55)',
          boxShadow: '0 2px 20px rgba(167,139,250,0.10)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'linear-gradient(135deg, #c026d3, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, boxShadow: '0 4px 14px rgba(192,38,211,0.30)',
              }}>🛡️</div>
              <div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 16, lineHeight: 1, color: '#2d1b69' }}>
                  Mailshield
                </div>
                <div style={{ fontSize: 10, color: '#5b21b6', letterSpacing: 1, textTransform: 'uppercase' }}>Email Security</div>
              </div>
            </div>

            {/* Tabs */}
            <nav style={{ display: 'flex', gap: 4, marginLeft: 12, flex: 1, overflowX: 'auto' }}>
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
                    display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                    ...(tab === t.id
                      ? { background: 'linear-gradient(135deg,#c026d3,#7c3aed)', color: 'white', boxShadow: '0 4px 14px rgba(192,38,211,0.30)' }
                      : { background: 'transparent', color: '#6d28d9' }),
                  }}
                >
                  <span>{t.icon}</span>{t.label}
                </button>
              ))}
            </nav>

            {/* Model status pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 999,
              background: modelReady ? 'rgba(220,252,231,0.8)' : 'rgba(255,237,213,0.8)',
              border: `1px solid ${modelReady ? 'rgba(134,239,172,0.5)' : 'rgba(253,186,116,0.5)'}`,
              flexShrink: 0,
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: 4,
                background: modelReady ? '#16a34a' : '#d97706',
                boxShadow: `0 0 6px ${modelReady ? '#16a34a' : '#d97706'}`,
                animation: modelReady ? 'none' : 'pulse 1.5s infinite',
              }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: modelReady ? '#14532d' : '#92400e' }}>
                {modelReady ? 'ML Ready' : 'Loading…'}
              </span>
            </div>
          </div>
        </header>

        {/* ── Hero Banner ───────────────────────────────────── */}
        {tab === 'analyze' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(249,168,212,0.25) 0%, rgba(196,181,253,0.20) 50%, rgba(251,207,232,0.15) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.4)',
            padding: '28px 24px',
          }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }} className="gradient-text">
                Mailshield
              </div>
              <div style={{ fontSize: 16, color: '#5b21b6', maxWidth: 600, margin: '0 auto', lineHeight: 1.7, fontWeight: 500 }}>
                Paste an email to check for phishing signs and get a clear risk result before you trust it.
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                {[
                  ['28', 'features extracted'],
                  ['3', 'ML classifiers'],
                  ['100%', 'test accuracy'],
                  ['<50ms', 'response time'],
                ].map(([val, label]) => (
                  <div key={label} style={{
                    background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: '8px 16px',
                    border: '1px solid rgba(196,181,253,0.4)', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#7c3aed' }}>{val}</div>
                    <div style={{ fontSize: 10, color: 'rgba(109,40,217,0.55)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Page content ──────────────────────────────────── */}
        <main style={{ flex: 1, padding: '28px 24px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          {tab === 'analyze' && <EmailAnalyzer modelReady={modelReady} />}
          {tab === 'bulk'    && <BulkAnalyzer  modelReady={modelReady} />}
          {tab === 'metrics' && <MetricsDashboard />}
          {tab === 'how'     && <HowItWorks />}
        </main>

        {/* ── Footer ────────────────────────────────────────── */}
        <footer style={{
          textAlign: 'center', padding: '20px 24px',
          borderTop: '1px solid rgba(196,181,253,0.25)',
          background: 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ fontSize: 14, color: '#5b21b6', lineHeight: 1.8, fontWeight: 700 }}>
            Santhosh S
          </div>
        </footer>
      </div>
    </>
  );
}
