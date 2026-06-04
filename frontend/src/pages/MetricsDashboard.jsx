// src/pages/MetricsDashboard.jsx
import { useEffect, useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { getMetrics } from '../utils/api';

const COLORS = ['#c026d3', '#7c3aed', '#db2777', '#9333ea', '#6d28d9'];

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMetrics().then(d => { setMetrics(d.metrics); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!metrics) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#7c3aed' }}>
      ⚠️ Metrics unavailable. Is the backend running?
    </div>
  );

  const radarData = [
    { subject: 'Accuracy', value: metrics.accuracy },
    { subject: 'Precision', value: metrics.precision },
    { subject: 'Recall', value: metrics.recall },
    { subject: 'F1-Score', value: metrics.f1_score },
    { subject: 'ROC-AUC', value: metrics.roc_auc },
  ];

  const cvData = metrics.cv_scores.map((s, i) => ({ fold: `Fold ${i+1}`, score: s }));

  const cm = metrics.confusion_matrix;
  const confusionData = [
    { name: 'True Negative\n(Correct Safe)', value: cm.true_negative, color: '#16a34a' },
    { name: 'True Positive\n(Correct Phish)', value: cm.true_positive, color: '#dc2626' },
    { name: 'False Positive\n(Wrong Alarm)', value: cm.false_positive, color: '#d97706' },
    { name: 'False Negative\n(Missed Phish)', value: cm.false_negative, color: '#ea580c' },
  ];

  const topFeatures = metrics.feature_importance?.slice(0, 10) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Model info banner */}
      <div className="glass-card fade-up-1" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 28 }}>🤖</span>
        <div>
          <div style={{ fontWeight: 700, color: '#4c1d95', fontSize: 15 }}>{metrics.model_type}</div>
          <div style={{ fontSize: 12, color: '#7c3aed' }}>
            Trained on {metrics.train_samples} samples · Tested on {metrics.test_samples} · {metrics.feature_count} features extracted
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #c026d3, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {metrics.accuracy}%
          </div>
          <div style={{ fontSize: 11, color: '#7c3aed' }}>Accuracy</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Accuracy', value: `${metrics.accuracy}%`, icon: '🎯', color: '#7c3aed' },
          { label: 'Precision', value: `${metrics.precision}%`, icon: '🔬', color: '#c026d3' },
          { label: 'Recall', value: `${metrics.recall}%`, icon: '📡', color: '#db2777' },
          { label: 'F1-Score', value: `${metrics.f1_score}%`, icon: '⚖️', color: '#9333ea' },
          { label: 'ROC-AUC', value: `${metrics.roc_auc}%`, icon: '📈', color: '#6d28d9' },
        ].map((s, i) => (
          <div key={i} className={`glass-card-sm stat-card fade-up-${Math.min(i+1,4)}`}
            style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'rgba(109,40,217,0.6)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Radar chart */}
        <div className="glass-card fade-up-2" style={{ padding: 20 }}>
          <ChartTitle icon="🕸️" title="Performance Radar" />
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(196,181,253,0.4)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#7c3aed' }} />
              <Radar dataKey="value" stroke="#c026d3" fill="#c026d3" fillOpacity={0.18} strokeWidth={2} dot={{ fill: '#7c3aed', r: 4 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* CV scores bar */}
        <div className="glass-card fade-up-2" style={{ padding: 20 }}>
          <ChartTitle icon="🔁" title={`Cross-Validation (${metrics.cv_mean}% ± ${metrics.cv_std}%)`} />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cvData} barSize={28}>
              <XAxis dataKey="fold" tick={{ fontSize: 11, fill: '#7c3aed' }} axisLine={false} tickLine={false} />
              <YAxis domain={[90, 100]} tick={{ fontSize: 10, fill: '#7c3aed' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(196,181,253,0.5)', borderRadius: 10, fontSize: 12 }}
                formatter={v => [`${v}%`, 'Accuracy']}
              />
              <Bar dataKey="score" radius={[6,6,0,0]}>
                {cvData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Confusion matrix */}
        <div className="glass-card fade-up-3" style={{ padding: 20 }}>
          <ChartTitle icon="🧩" title="Confusion Matrix" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
            {[
              { label: 'True Negative', sub: 'Correctly safe', value: cm.true_negative, color: '#16a34a', bg: 'rgba(220,252,231,0.6)' },
              { label: 'False Positive', sub: 'Wrong alarm', value: cm.false_positive, color: '#d97706', bg: 'rgba(255,237,213,0.6)' },
              { label: 'False Negative', sub: 'Missed phish', value: cm.false_negative, color: '#ea580c', bg: 'rgba(254,226,226,0.6)' },
              { label: 'True Positive', sub: 'Caught phish', value: cm.true_positive, color: '#dc2626', bg: 'rgba(254,226,226,0.7)' },
            ].map((c, i) => (
              <div key={i} style={{ background: c.bg, borderRadius: 12, padding: '14px', textAlign: 'center', border: `1px solid ${c.color}33` }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: c.color }}>{c.label}</div>
                <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>{c.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature importance bar */}
        <div className="glass-card fade-up-3" style={{ padding: 20 }}>
          <ChartTitle icon="📊" title="Top Feature Importance" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topFeatures} layout="vertical" barSize={12} margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#7c3aed' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="feature" tick={{ fontSize: 9, fill: '#6d28d9' }} axisLine={false} tickLine={false} width={110} />
              <Tooltip
                contentStyle={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(196,181,253,0.5)', borderRadius: 10, fontSize: 12 }}
                formatter={v => [`${v.toFixed(2)}%`, 'Importance']}
              />
              <Bar dataKey="importance" radius={[0,6,6,0]}>
                {topFeatures.map((_, i) => <Cell key={i} fill={`hsl(${270 + i*12}, 70%, ${55 + i*2}%)`} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confusion pie */}
      <div className="glass-card fade-up-4" style={{ padding: 20 }}>
        <ChartTitle icon="🥧" title="Prediction Distribution" />
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={confusionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${(percent*100).toFixed(0)}%`} labelLine={false}>
              {confusionData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Legend formatter={(v) => <span style={{ fontSize: 12, color: '#6d28d9' }}>{v.replace('\\n', ' ')}</span>} />
            <Tooltip formatter={v => [v, 'Emails']} contentStyle={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(196,181,253,0.5)', borderRadius: 10, fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ChartTitle({ icon, title }) {
  return (
    <div style={{ fontSize: 14, fontWeight: 700, color: '#4c1d95', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span>{icon}</span>{title}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[80, 160, 220, 220].map((h, i) => (
        <div key={i} className="shimmer" style={{ height: h, borderRadius: 16 }} />
      ))}
    </div>
  );
}
