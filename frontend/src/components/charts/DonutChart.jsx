function DonutChart({ segments }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = 55;
  const stroke = 22;
  const circumference = 2 * Math.PI * radius;
  let offsetSoFar = 0;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
        <g transform="rotate(-90 70 70)">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
          {segments.map((s) => {
            const fraction = s.value / total;
            const dash = fraction * circumference;
            const el = (
              <circle
                key={s.label}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offsetSoFar}
                strokeLinecap="butt"
              />
            );
            offsetSoFar += dash;
            return el;
          })}
        </g>
      </svg>

      <div className="space-y-2 flex-1 min-w-[120px]">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-gray-600 flex-1 truncate">{s.label}</span>
            <span className="text-gray-400 font-medium">
              {Math.round((s.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DonutChart;
