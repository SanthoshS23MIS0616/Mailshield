// src/pages/HowItWorks.jsx
export default function HowItWorks() {
  const steps = [
    {
      icon: '📧', num: '01', title: 'Email Input',
      desc: 'You paste the email subject and body into the analyzer. The system accepts any plain-text email content.',
      detail: 'The system normalizes encoding, strips HTML tags if present, and prepares raw text for feature extraction.',
    },
    {
      icon: '🔧', num: '02', title: 'Feature Extraction',
      desc: '28 handcrafted features are extracted covering URLs, keywords, urgency signals, and text statistics.',
      detail: 'Features include: URL count, suspicious TLDs, brand spoofing patterns, phishing keyword density, exclamation marks, ALL-CAPS words, Shannon entropy, and more.',
    },
    {
      icon: '🤖', num: '03', title: 'Ensemble ML Model',
      desc: 'Three trained classifiers vote together: Random Forest (weighted 3x), Gradient Boosting (2x), and Logistic Regression (1x).',
      detail: 'Soft voting combines probability outputs. The ensemble achieves higher accuracy and robustness than any single model.',
    },
    {
      icon: '📊', num: '04', title: 'Risk Scoring',
      desc: 'A 0–100 risk score is computed from the phishing probability. Risk levels: Minimal, Low, Medium, High, Critical.',
      detail: 'The model also explains which specific signals contributed to the decision via the Detection Signals panel.',
    },
    {
      icon: '🛡️', num: '05', title: 'Result & Explanation',
      desc: 'You receive a clear verdict (Phishing / Safe), confidence score, probability bars, and human-readable signal explanations.',
      detail: 'All 28 raw features are also available in the expandable Feature Inspector panel for full transparency.',
    },
  ];

  const features = [
    { category: 'URL Analysis', icon: '🔗', items: ['Number of URLs', 'Suspicious TLD (.xyz, .tk, .ru)', 'HTTP vs HTTPS', 'IP address in URL', 'Brand spoofing in domain', '@ symbol in URL', 'Hex-encoded characters', 'URL length & dots'] },
    { category: 'Keyword Signals', icon: '🔤', items: ['Phishing keyword count', 'Legitimate keyword count', 'Keyword ratio', 'Urgency words in subject', 'Prize/lottery language'] },
    { category: 'Pressure Tactics', icon: '⏰', items: ['Exclamation mark count', 'ALL-CAPS word count', 'Time deadline mentions', 'Threat language patterns'] },
    { category: 'Info Requests', icon: '🪪', items: ['Password field mentions', 'Financial info requests', 'Personal info requests', 'HTML form presence'] },
    { category: 'Text Statistics', icon: '📐', items: ['Body length', 'Word count', 'Average word length', 'Shannon entropy (randomness)'] },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Hero */}
      <div className="glass-card fade-up-1" style={{ padding: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, marginBottom: 8 }} className="gradient-text">
          How PhishGuard AI Works
        </div>
        <div style={{ fontSize: 14, color: '#7c3aed', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
          A transparent look at the machine learning pipeline that classifies emails as phishing or safe — from raw text to verdict.
        </div>
      </div>

      {/* Pipeline steps */}
      <div className="glass-card fade-up-2" style={{ padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#4c1d95', marginBottom: 20 }}>🔄 Detection Pipeline</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: i < steps.length - 1 ? 20 : 0 }}>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div style={{ position: 'absolute', left: 28, top: 56, bottom: 0, width: 2, background: 'linear-gradient(180deg, rgba(196,181,253,0.6), rgba(196,181,253,0.1))' }} />
              )}
              {/* Step icon */}
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, rgba(237,233,254,0.8), rgba(252,231,243,0.8))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1.5px solid rgba(196,181,253,0.4)', zIndex: 1 }}>
                <div style={{ fontSize: 20 }}>{step.icon}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed', fontFamily: 'JetBrains Mono, monospace' }}>{step.num}</div>
              </div>
              {/* Content */}
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#2d1b69', marginBottom: 4 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: '#6d28d9', marginBottom: 6, lineHeight: 1.6 }}>{step.desc}</div>
                <div style={{ fontSize: 12, color: 'rgba(109,40,217,0.6)', lineHeight: 1.6 }}>{step.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features breakdown */}
      <div className="fade-up-3">
        <div style={{ fontSize: 15, fontWeight: 700, color: '#4c1d95', marginBottom: 14 }}>🔬 All 28 Extracted Features</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {features.map((cat, i) => (
            <div key={i} className="glass-card-sm" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#4c1d95' }}>{cat.category}</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {cat.items.map((item, j) => (
                  <li key={j} style={{ fontSize: 12, color: '#6d28d9', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 4, height: 4, borderRadius: 2, background: 'linear-gradient(135deg, #c026d3, #7c3aed)', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Model architecture */}
      <div className="glass-card fade-up-4" style={{ padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#4c1d95', marginBottom: 16 }}>🏗️ Ensemble Architecture</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { name: 'Random Forest', weight: '3×', icon: '🌲', desc: '200 trees, depth 15, balanced class weights. Handles non-linear feature interactions.', color: '#16a34a' },
            { name: 'Gradient Boosting', weight: '2×', icon: '🚀', desc: '150 estimators, LR 0.08. Sequential error correction for edge cases.', color: '#d97706' },
            { name: 'Logistic Regression', weight: '1×', icon: '📉', desc: 'L2 regularization, balanced weights. Linear baseline for stable calibration.', color: '#7c3aed' },
          ].map((m, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 14, padding: 16, border: `1.5px solid ${m.color}33`, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{m.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: m.color, marginBottom: 2 }}>{m.name}</div>
              <div style={{ display: 'inline-block', background: `${m.color}22`, color: m.color, padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, marginBottom: 8 }}>Weight {m.weight}</div>
              <div style={{ fontSize: 11, color: '#6d28d9', lineHeight: 1.6 }}>{m.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(237,233,254,0.5)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#4c1d95', textAlign: 'center' }}>
          ⚡ Soft voting combines probability outputs from all three models → <strong>Final Decision</strong>
        </div>
      </div>

      {/* Tips */}
      <div className="glass-card-sm fade-up-4" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#4c1d95', marginBottom: 12 }}>🛡️ Real-World Phishing Red Flags</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
          {[
            ['Always check the sender email address — not just the display name', '🔍'],
            ['Hover over links before clicking — the real URL often differs', '🖱️'],
            ['Legitimate companies never ask for passwords via email', '🔑'],
            ['Urgency and threats are classic manipulation tactics', '⏰'],
            ['Prize / lottery emails are almost always scams', '🏆'],
            ['Look for misspellings in domain names (paypa1 vs paypal)', '🎭'],
          ].map(([tip, icon], i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 12px', background: 'rgba(237,233,254,0.4)', borderRadius: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: 12, color: '#6d28d9', lineHeight: 1.6 }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
