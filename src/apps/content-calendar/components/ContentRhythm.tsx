import sparkleImg from '../../../assets/budget-assets/sun-sparkles/sun-sparkles-02.png';

interface RhythmItem {
  type: string;
  targetPerWeek: number;
  color: string;
}

interface ContentRhythmProps {
  items: RhythmItem[];
}

export default function ContentRhythm({ items }: ContentRhythmProps) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #ece4da',
      borderRadius: 14,
      padding: '16px 18px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#3d2f2f' }}>Content Rhythm</span>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, color: '#c27b6a', fontWeight: 500 }}>
          View details →
        </button>
      </div>

      {/* Rhythm rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        {items.map((item) => (
          <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: '#3d2f2f', flex: 1 }}>{item.type}</span>
            <span style={{ fontSize: 12, color: '#8a7a72', whiteSpace: 'nowrap' }}>{item.targetPerWeek} / week</span>
          </div>
        ))}
      </div>

      {/* Inspirational card */}
      <div style={{
        background: '#fdf6f0',
        border: '1px solid #f0e4d8',
        borderRadius: 10,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#c27b6a', fontStyle: 'italic', lineHeight: 1.4 }}>
            Consistent beats perfect.
          </div>
        </div>
        <img src={sparkleImg} alt="" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
      </div>
    </div>
  );
}
