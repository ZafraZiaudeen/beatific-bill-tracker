const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
const COLS_PER_MONTH = [4, 4, 5, 4, 4];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const INTENSITY = ['#e4e9e5', '#b8d4c4', '#7aaa90', '#4a7c5f', '#2d4a3e'];
const CELL = 10, GAP = 2;

export const DEFAULT_COLS: number[][] = [
  [0,0,1,0,0,0,0],[0,1,0,0,1,0,0],[0,0,0,1,0,0,1],[1,0,0,0,1,0,0],
  [0,0,1,1,0,0,1],[0,1,0,0,1,0,0],[1,0,1,0,0,1,0],[0,1,0,1,0,1,0],
  [0,1,2,0,1,0,1],[1,2,0,1,0,1,0],[0,1,1,2,1,1,0],[2,0,1,2,1,0,2],[0,2,1,2,2,1,0],
  [2,1,1,2,1,2,1],[1,2,3,1,2,1,2],[2,3,2,1,3,2,1],[1,2,2,3,1,3,2],
  [3,2,3,2,3,1,2],[2,3,4,2,3,2,3],[3,4,3,3,2,3,2],[2,3,3,4,3,2,3],
];

export default function Heatmap({ cols = DEFAULT_COLS }: { cols?: number[][] }) {
  return (
    <div>
      {/* Month labels */}
      <div style={{ display: 'flex', paddingLeft: 28, marginBottom: 3 }}>
        {MONTHS.map((m, i) => {
          const n = COLS_PER_MONTH[i];
          const w = n * CELL + (n - 1) * GAP;
          return (
            <div
              key={m}
              style={{ width: w, flexShrink: 0, fontSize: 10, color: '#8a8a8a', marginLeft: i > 0 ? GAP : 0 }}
            >
              {m}
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', gap: GAP }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, marginRight: 2 }}>
          {DAY_LABELS.map((d, i) => (
            <div
              key={d}
              style={{
                fontSize: 8.5, color: '#8a8a8a',
                height: CELL, lineHeight: `${CELL}px`,
                width: 22, textAlign: 'right',
                visibility: [0, 2, 4].includes(i) ? 'visible' : 'hidden',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Columns */}
        <div style={{ display: 'flex', gap: GAP }}>
          {cols.map((col, ci) => (
            <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
              {col.map((v, ri) => (
                <div
                  key={ri}
                  style={{ width: CELL, height: CELL, borderRadius: 2, background: INTENSITY[v] ?? INTENSITY[0] }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 6, justifyContent: 'flex-end', fontSize: 10, color: '#8a8a8a' }}>
        <span>Less</span>
        {INTENSITY.map((c, i) => (
          <div key={i} style={{ width: CELL, height: CELL, borderRadius: 2, background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
