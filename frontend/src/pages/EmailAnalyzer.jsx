// src/pages/EmailAnalyzer.jsx
import { useState, useRef, useEffect } from 'react';
import { predictEmail, getExamples } from '../utils/api';
import ResultCard from '../components/ResultCard';

const PLACEHOLDER_SUBJECT = 'e.g. URGENT: Your account has been suspended!';
const PLACEHOLDER_BODY = `Paste the full email body here...

Try one of the example emails from the sidebar, or paste any email you want to analyze.`;

export default function EmailAnalyzer({ modelReady }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [examples, setExamples] = useState([]);
  const [charCount, setCharCount] = useState(0);
  const [history, setHistory] = useState([]);
  const resultRef = useRef(null);

  useEffect(() => {
    getExamples().then(d => setExamples(d.examples || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setCharCount(body.length);
  }, [body]);

  const analyze = async () => {
    if (!body.trim()) { setError('Please enter an email body.'); return; }
    if (!modelReady) { setError('Model is still loading, please wait...'); return; }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const data = await predictEmail(subject, body);
      if (data.status === 'ok') {
        setResult(data);
        setHistory(h => [{ subject: subject || '(no subject)', prediction: data.prediction, risk: data.risk_score, time: new Date().toLocaleTimeString() }, ...h.slice(0, 9)]);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      } else {
        setError(data.message || data.error || 'Analysis failed.');
      }
    } catch (e) {
      setError('Cannot connect to backend. Make sure Flask is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (ex) => {
    setSubject(ex.subject);
    setBody(ex.body);
    setResult(null);
    setError('');
  };

  const clear = () => { setSubject(''); setBody(''); setResult(null); setError(''); };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
      {/* LEFT: Main analyzer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Subject */}
        <div className="fade-up-1">
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6d28d9', marginBottom: 8 }}>
            📧 Email Subject
          </label>
          <input
            className="input-glass"
            placeholder={PLACEHOLDER_SUBJECT}
            value={subject}
            onChange={e => setSubject(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && analyze()}
          />
        </div>

        {/* Body */}
        <div className="fade-up-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#6d28d9' }}>📄 Email Body</label>
            <span style={{ fontSize: 11, color: 'rgba(109,40,217,0.45)' }}>{charCount} chars</span>
          </div>
          <div className="scan-container" style={{ position: 'relative' }}>
            {loading && <div className="scan-line" />}
            <textarea
              className="input-glass"
              placeholder={PLACEHOLDER_BODY}
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={10}
              style={{ resize: 'vertical', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, lineHeight: 1.7 }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(254,226,226,0.8)', border: '1px solid rgba(252,165,165,0.5)', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Buttons */}
        <div className="fade-up-3" style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-primary"
            onClick={analyze}
            disabled={loading || !modelReady}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? (
              <>
                <Spinner />
                Analyzing with ML Model...
              </>
            ) : (
              <> 🔍 Analyze Email </>
            )}
          </button>
          <button className="btn-secondary" onClick={clear}>Clear</button>
        </div>

        {/* Tips */}
        {!result && !loading && (
          <div className="glass-card-sm fade-up-4" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#6d28d9', marginBottom: 10 }}>💡 What the model detects:</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                ['🔗', 'Suspicious URLs & domains'],
                ['🚨', 'Urgency / threat language'],
                ['💳', 'Financial info requests'],
                ['🎭', 'Brand spoofing patterns'],
                ['🔤', 'ALL-CAPS pressure tactics'],
                ['🏆', 'Prize / lottery scams'],
                ['⏰', 'Artificial deadlines'],
                ['🔑', 'Credential harvesting'],
              ].map(([icon, text], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#7c3aed' }}>
                  <span>{icon}</span>{text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        <div ref={resultRef}>
          {result && <ResultCard result={result} />}
        </div>
      </div>

      {/* RIGHT: Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 20 }}>

        {/* Model status */}
        <div className="glass-card-sm" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: modelReady ? '#16a34a' : '#d97706', boxShadow: modelReady ? '0 0 8px #16a34a' : '0 0 8px #d97706' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6d28d9' }}>
              {modelReady ? 'Model Ready' : 'Model Loading…'}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(109,40,217,0.5)' }}>
            Ensemble: RF + GBM + LR · 28 features
          </div>
        </div>

        {/* Example emails */}
        <div className="glass-card-sm" style={{ padding: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#4c1d95', marginBottom: 10 }}>
            📬 Example Emails
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {examples.map((ex) => (
              <button
                key={ex.id}
                onClick={() => loadExample(ex)}
                style={{
                  background: ex.type === 'phishing' ? 'rgba(254,226,226,0.6)' : 'rgba(220,252,231,0.6)',
                  border: ex.type === 'phishing' ? '1px solid rgba(252,165,165,0.4)' : '1px solid rgba(134,239,172,0.4)',
                  borderRadius: 10, padding: '8px 10px', cursor: 'pointer',
                  textAlign: 'left', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
              >
                <div style={{ fontSize: 10, fontWeight: 700, color: ex.type === 'phishing' ? '#991b1b' : '#14532d', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {ex.type === 'phishing' ? '🚨 Phishing' : '✅ Safe'} · {ex.label}
                </div>
                <div style={{ fontSize: 11, color: '#4c1d95', marginTop: 2, lineHeight: 1.4, fontWeight: 500 }}>
                  {ex.subject.length > 40 ? ex.subject.slice(0, 40) + '…' : ex.subject}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="glass-card-sm" style={{ padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4c1d95', marginBottom: 10 }}>
              🕐 Recent Scans
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {history.slice(0, 5).map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12 }}>{h.prediction === 'Phishing' ? '🚨' : '✅'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#4c1d95', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {h.subject}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(109,40,217,0.5)' }}>{h.time} · Risk {Math.round(h.risk)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
