// src/components/ConfidenceRing.jsx
export default function ConfidenceRing({ value, isPhishing, size = 140 }) {
  const r = 52;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  const color = isPhishing
    ? value > 80 ? '#dc2626' : value > 60 ? '#ea580c' : '#d97706'
    : '#16a34a';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx} cy={cy} r={r}
        fill="none" strokeWidth="10"
        stroke="rgba(221,214,254,0.35)"
      />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none" strokeWidth="10"
        stroke={color}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1), stroke 0.4s' }}
      />
      <text
        x={cx} y={cy - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize="22"
        fontWeight="700"
        fontFamily="DM Sans, sans-serif"
      >
        {Math.round(value)}%
      </text>
      <text
        x={cx} y={cy + 16}
        textAnchor="middle"
        fill="rgba(109,40,217,0.55)"
        fontSize="10"
        fontFamily="DM Sans, sans-serif"
        fontWeight="500"
      >
        confidence
      </text>
    </svg>
  );
}
