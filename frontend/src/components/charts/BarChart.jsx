const DEFAULT_PALETTE = ["#f472b6", "#fb923c", "#facc15", "#34d399", "#38bdf8", "#a78bfa", "#fb7185"];

function BarChart({ data, palette = DEFAULT_PALETTE, height = 160 }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="flex items-end justify-between gap-3" style={{ height }}>
      {data.map((d, i) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-2 h-full">
          <div className="w-full flex-1 flex items-end">
            <div
              className="w-full rounded-t-xl transition-all"
              style={{
                height: `${Math.max(4, (d.value / max) * 100)}%`,
                backgroundColor: palette[i % palette.length],
              }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <span className="text-xs text-gray-400 font-medium">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default BarChart;
