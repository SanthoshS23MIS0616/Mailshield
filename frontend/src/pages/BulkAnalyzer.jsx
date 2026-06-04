// src/pages/BulkAnalyzer.jsx
import { useState } from 'react';
import { analyzeBulk } from '../utils/api';

const SAMPLE_BULK = [
  { id: 1, subject: 'URGENT: Verify your PayPal account now!', body: 'Dear user, your account has been suspended. Click http://paypa1-secure.xyz/login to verify. Provide your SSN and credit card immediately or face permanent closure.' },
  { id: 2, subject: 'Team meeting tomorrow at 10am', body: 'Hi everyone, just a reminder about our sprint review meeting tomorrow at 10am in the main conference room. Please have your updates ready. Thanks, Mike.' },
  { id: 3, subject: 'CONGRATULATIONS You won $500,000!!!', body: 'You have been selected as our winner! Claim your prize at http://prize-claim.ru/winner?id=123. Provide bank account details to receive funds. Act within 24 HOURS!' },
  { id: 4, subject: 'Your order has shipped', body: 'Hello, your Amazon order #112-987654 has shipped. Estimated delivery is Thursday. You can track your order on the Amazon website under Your Orders. Thank you!' },
  { id: 5, subject: 'Security Alert: Account compromised', body: 'We detected suspicious login to your account from an unknown device. Verify immediately: http://bank-secure.phish.net/auth. Enter PIN and SSN to confirm identity.' },
];

export default function BulkAnalyzer({ modelReady }) {
  const [emails, setEmails] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usedSample, setUsedSample] = useState(false);

  const loadSample = () => {
    const formatted = SAMPLE_BULK.map(e => `SUBJECT: ${e.subject}\nBODY: ${e.body}`).join('\n\n---\n\n');
    setEmails(formatted);
    setUsedSample(true);
    setResults(null);
  };

  const parseEmails = (raw) => {
    return raw.split('---').map((block, i) => {
      const lines = block.trim().split('\n');
      const subjectLine = lines.find(l => l.startsWith('SUBJECT:'));
      const bodyLine = lines.find(l => l.startsWith('BODY:'));
      const subject = subjectLine ? subjectLine.replace('SUBJECT:', '').trim() : '';
      const body = bodyLine ? bodyLine.replace('BODY:', '').trim() : block.trim();
      return { id: i + 1, subject, body };
    }).filter(e => e.body.length > 5);
  };

  const analyze = async () => {
    if (!emails.trim()) { setError('Please enter emails to analyze.'); return; }
    if (!modelReady) { setError('Model is still loading...'); return; }
    setError('');
    setLoading(true);
    setResults(null);
    try {
      const parsed = parseEmails(emails);
      if (parsed.length === 0) { setError('No valid emails found. Use the format shown.'); setLoading(false); return; }
      const data = await analyzeBulk(parsed);
      if (data.status === 'ok') {
        setResults(data);
      } else {
        setError(data.error || 'Analysis failed.');
      }
    } catch {
      setError('Cannot connect to backend. Make sure Flask is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header info */}
      <div className="glass-card fade-up-1" style={{ padding: '16px 24px', display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ fontSize: 32 }}>📮</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#4c1d95', marginBottom: 4 }}>Bulk Email Scanner</div>
          <div style={{ fontSize: 13, color: '#7c3aed', lineHeight: 1.6 }}>
            Analyze up to <strong>50 emails at once</strong>. Separate emails with <code style={{ background: 'rgba(237,233,254,0.6)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>---</code>, prefix each with <code style={{ background: 'rgba(237,233,254,0.6)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>SUBJECT:</code> and <code style={{ background: 'rgba(237,233,254,0.6)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>BODY:</code>
          </div>
        </div>
        <button className="btn-secondary" onClick={loadSample} style={{ fontSize: 13, padding: '8px 16px' }}>
          Load 5 Samples
        </button>
      </div>

      {/* Input */}
      <div className="fade-up-2">
        <textarea
          className="input-glass"
          value={emails}
          onChange={e => setEmails(e.target.value)}
          rows={14}
          placeholder={`SUBJECT: Your PayPal account is suspended!\nBODY: Dear user, click http://paypa1.xyz to verify immediately...\n\n---\n\nSUBJECT: Team lunch this Friday\nBODY: Hey team, let's grab lunch at noon on Friday...`}
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.8 }}
        />
      </div>

      {error && (
        <div style={{ background: 'rgba(254,226,226,0.8)', border: '1px solid rgba(252,165,165,0.5)', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#991b1b' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="fade-up-3" style={{ display: 'flex', gap: 10 }}>
        <button className="btn-primary" onClick={analyze} disabled={loading || !modelReady} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading ? '🔄 Scanning all emails...' : '🚀 Scan All Emails'}
        </button>
        <button className="btn-secondary" onClick={() => { setEmails(''); setResults(null); setUsedSample(false); }}>Clear</button>
      </div>

      {/* Results */}
      {results && (
        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Summary */}
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#4c1d95', marginBottom: 14 }}>📊 Scan Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'Total Scanned', value: results.summary.total, icon: '📧', color: '#7c3aed' },
                { label: 'Phishing', value: results.summary.phishing, icon: '🚨', color: '#dc2626' },
                { label: 'Safe', value: results.summary.safe, icon: '✅', color: '#16a34a' },
                { label: 'Threat Rate', value: `${results.summary.phishing_rate}%`, icon: '⚠️', color: '#d97706' },
              ].map((s, i) => (
                <div key={i} className="glass-card-sm" style={{ padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22 }}>{s.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(109,40,217,0.6)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Threat rate bar */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#7c3aed', marginBottom: 6, fontWeight: 600 }}>
                <span>Safe ({results.summary.safe})</span>
                <span>Phishing ({results.summary.phishing})</span>
              </div>
              <div style={{ height: 12, borderRadius: 999, background: 'rgba(220,252,231,0.6)', overflow: 'hidden', border: '1px solid rgba(134,239,172,0.3)' }}>
                <div style={{ height: '100%', width: `${results.summary.phishing_rate}%`, background: 'linear-gradient(90deg, #ea580c, #dc2626)', borderRadius: 999, transition: 'width 1.2s ease', float: 'right' }} />
              </div>
            </div>
          </div>

          {/* Individual results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.results.map((r) => (
              <div key={r.id} className="glass-card-sm" style={{
                padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                borderLeft: `4px solid ${r.is_phishing ? '#dc2626' : '#16a34a'}`,
                background: r.is_phishing ? 'rgba(255,241,242,0.85)' : 'rgba(240,253,244,0.85)',
              }}>
                <span style={{ fontSize: 24 }}>{r.is_phishing ? '🚨' : '✅'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#2d1b69', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Email #{r.id}: {r.subject}
                  </div>
                  <div style={{ fontSize: 12, color: r.is_phishing ? '#991b1b' : '#14532d', marginTop: 2 }}>
                    {r.prediction} · Risk score: {Math.round(r.risk_score)}%
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: r.is_phishing ? '#dc2626' : '#16a34a' }}>
                    {Math.round(r.risk_score)}%
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(109,40,217,0.5)' }}>risk</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
