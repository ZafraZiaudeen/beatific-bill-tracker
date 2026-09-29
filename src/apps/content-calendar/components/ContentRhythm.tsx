import sparkleImg from '../../../assets/budget-assets/sun-sparkles/sun-sparkles-02.png';

interface RhythmItem {
  type: string;
  target: number;
  current: number;
  color: string;
}

interface ContentRhythmProps {
  items: RhythmItem[];
  monthlyGoal?: number;
  monthlyTotal?: number;
  onViewDetails?: () => void;
}

export default function ContentRhythm({ items, monthlyGoal = 0, monthlyTotal = 0, onViewDetails }: ContentRhythmProps) {
  return (
    <div className="cc-dashboard-rhythm-card" style={{
      background: 'var(--cc-card)',
      border: '1px solid var(--cc-border)',
      borderRadius: 14,
      padding: '16px 18px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--cc-text)' }}>Content Rhythm</span>
        <button onClick={onViewDetails} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, color: 'var(--cc-accent)', fontWeight: 500 }}>
          View details →
        </button>
      </div>

      {/* Rhythm rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        {items.length ? items.map((item) => (
          <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: 'var(--cc-text)', flex: 1 }}>{item.type}</span>
            <span style={{ fontSize: 12, color: 'var(--cc-text-3)', whiteSpace: 'nowrap' }}>{item.current} / {item.target} month</span>
          </div>
        )) : <div style={{ fontSize: 11, color: 'var(--cc-text-3)', padding: '4px 0 8px' }}>No platform targets set yet.</div>}
      </div>

      {monthlyGoal > 0 && <div style={{ fontSize: 10.5, color: 'var(--cc-text-2)', marginBottom: 10 }}>Monthly goal: {monthlyTotal} / {monthlyGoal} posts</div>}

      {/* Inspirational card */}
      <div style={{
        background: 'var(--cc-accent-light)',
        border: '1px solid var(--cc-border)',
        borderRadius: 10,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cc-accent)', fontStyle: 'italic', lineHeight: 1.4 }}>
            Consistent beats perfect.
          </div>
        </div>
        <img src={sparkleImg} alt="" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
      </div>
    </div>
  );
}
