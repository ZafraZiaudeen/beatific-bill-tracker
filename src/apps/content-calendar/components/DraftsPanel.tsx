import type { Draft } from '../types';

const TYPE_BADGE: Record<string, { bg: string; color: string }> = {
  Carousel: { bg: '#fce8e3', color: '#c27b6a' },
  Reel:     { bg: '#fde8d0', color: '#b5672b' },
  Story:    { bg: '#e3f0e8', color: '#4a7c5f' },
  Static:   { bg: '#e8e9ec', color: '#555f72' },
};

interface DraftsPanelProps {
  drafts: Draft[];
}

export default function DraftsPanel({ drafts }: DraftsPanelProps) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #ece4da',
      borderRadius: 14,
      padding: '16px 18px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#3d2f2f' }}>Drafts Needing Attention</span>
        <span style={{
          background: '#f97316',
          color: '#fff',
          fontSize: 10,
          fontWeight: 700,
          padding: '1px 6px',
          borderRadius: 99,
          minWidth: 18,
          textAlign: 'center',
        }}>
          {drafts.length}
        </span>
      </div>

      {/* Draft list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {drafts.map((d) => {
          const badge = TYPE_BADGE[d.type] ?? TYPE_BADGE.Static;
          return (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Thumbnail placeholder */}
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 6,
                background: '#f3ede6',
                flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#3d2f2f',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {d.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <span style={{
                    fontSize: 9.5,
                    fontWeight: 600,
                    padding: '1px 5px',
                    borderRadius: 99,
                    background: badge.bg,
                    color: badge.color,
                  }}>
                    {d.type}
                  </span>
                  <span style={{ fontSize: 10.5, color: '#8a7a72' }}>{d.updatedAt}</span>
                </div>
              </div>
              <button style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#8a7a72',
                padding: 2,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
