// src/components/ResultCard.jsx
import ConfidenceRing from './ConfidenceRing';

const RISK_META = {
  Critical: { bg: 'rgba(254,226,226,0.9)', border: 'rgba(252,165,165,0.6)', text: '#991b1b', bar: '#dc2626' },
  High:     { bg: 'rgba(255,237,213,0.9)', border: 'rgba(253,186,116,0.6)', text: '#92400e', bar: '#ea580c' },
  Medium:   { bg: 'rgba(254,249,195,0.9)', border: 'rgba(253,224,71,0.6)',  text: '#713f12', bar: '#d97706' },
  Low:      { bg: 'rgba(220,252,231,0.9)', border: 'rgba(134,239,172,0.6)', text: '#14532d', bar: '#16a34a' },
  Minimal:  { bg: 'rgba(220,252,231,0.9)', border: 'rgba(134,239,172,0.6)', text: '#14532d', bar: '#16a34a' },
};

export default function ResultCard({ result }) {
  if (!result) return null;
  const { prediction, is_phishing, confidence, phishing_probability, safe_probability,
          risk_score, risk_level, explanations, features, analysis_time_ms } = result;

  const meta = RISK_META[risk_level] || RISK_META.Minimal;
  const cardClass = is_phishing ? 'result-phishing' : 'result-safe';

  return (
    <div className={`glass-card p-6 pop-in ${cardClass}`} style={{ marginTop: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 48 }}>{is_phishing ? '🚨' : '✅'}</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 26, fontWeight: 700, fontFamily: 'Playfair Display, serif',
            color: is_phishing ? '#991b1b' : '#14532d', marginBottom: 4,
          }}>
            {is_phishing ? 'Phishing Detected!' : 'Email is Safe'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: meta.bg, color: meta.text, border: `1px solid ${meta.border}`,
            }}>
              {risk_level} Risk
            </span>
            <span style={{
              padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500,
              background: 'rgba(237,233,254,0.8)', color: '#6d28d9', border: '1px solid rgba(196,181,253,0.5)',
            }}>
              ⚡ {analysis_time_ms}ms
            </span>
          </div>
        </div>
        <ConfidenceRing value={confidence} isPhishing={is_phishing} />
      </div>

      {/* Probability bars */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <ProbBar label="Phishing Probability" value={phishing_probability} color="#dc2626" bg="rgba(254,226,226,0.5)" />
        <ProbBar label="Safe Probability" value={safe_probability} color="#16a34a" bg="rgba(220,252,231,0.5)" />
      </div>

      {/* Risk score bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#6d28d9' }}>Risk Score</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: meta.text }}>{Math.round(risk_score)}/100</span>
        </div>
        <div className="risk-bar-track">
          <div className="risk-bar-fill" style={{ width: `${risk_score}%`, background: meta.bar }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: 'rgba(109,40,217,0.4)' }}>Safe</span>
          <span style={{ fontSize: 11, color: 'rgba(109,40,217,0.4)' }}>Dangerous</span>
        </div>
      </div>

      {/* Explanations */}
      {explanations && explanations.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#6d28d9', marginBottom: 10 }}>
            🔍 Detection Signals
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {explanations.map((exp, i) => (
              <div key={i} className={`badge-${exp.type}`} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
                borderRadius: 10, fontSize: 13, fontWeight: 500,
              }}>
                <span style={{ fontSize: 16 }}>{exp.icon}</span>
                {exp.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature grid */}
      <details style={{ cursor: 'pointer' }}>
        <summary style={{
          fontSize: 13, fontWeight: 600, color: '#7c3aed', padding: '8px 0',
          userSelect: 'none', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>📊</span> View Raw Features ({Object.keys(features || {}).length} extracted)
        </summary>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 8, marginTop: 12,
        }}>
          {features && Object.entries(features).map(([key, val]) => (
            <div key={key} style={{
              background: 'rgba(237,233,254,0.4)', borderRadius: 8, padding: '6px 10px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              border: '1px solid rgba(196,181,253,0.3)',
            }}>
              <span style={{ fontSize: 11, color: '#6d28d9', fontFamily: 'JetBrains Mono, monospace' }}>
                {key.replace(/_/g, ' ')}
              </span>
              <span style={{
                fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                color: val > 0 && typeof val === 'number' ? '#c026d3' : '#7c3aed',
              }}>
                {typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(2)) : String(val)}
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function ProbBar({ label, value, color, bg }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#6d28d9', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, marginBottom: 6 }}>{value.toFixed(1)}%</div>
      <div style={{ height: 6, borderRadius: 999, background: 'rgba(0,0,0,0.08)' }}>
        <div style={{
          height: '100%', borderRadius: 999, background: color,
          width: `${value}%`, transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>
    </div>
  );
}
