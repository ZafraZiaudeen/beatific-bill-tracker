import type { HashtagSet } from '../types';

const VARIANT_COLORS: Record<string, { tag: string; badge: string; badgeText: string }> = {
  default:  { tag: '#f3ede6', badge: '#f0e6da', badgeText: '#8a7a72' },
  travel:   { tag: '#e3eef8', badge: '#d0e6f5', badgeText: '#2a6090' },
  wellness: { tag: '#e3f0e8', badge: '#cfe8d5', badgeText: '#2d6040' },
  product:  { tag: '#e8f0e3', badge: '#d8ead0', badgeText: '#3a6025' },
};

const VARIANT_LABELS: Record<string, string> = {
  default:  'Default',
  travel:   'Travel',
  wellness: 'Wellness',
  product:  'Product',
};

interface HashtagSetsProps {
  sets: HashtagSet[];
  onViewAll: () => void;
}

export default function HashtagSets({ sets, onViewAll }: HashtagSetsProps) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #ece4da',
      borderRadius: 14,
      padding: '16px 18px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#3d2f2f' }}>Hashtag Sets</span>
        <button
          onClick={onViewAll}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 11.5,
            color: '#8a7a72',
          }}
        >
          View all →
        </button>
      </div>

      {/* Sets list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sets.map((set) => {
          const colors = VARIANT_COLORS[set.variant] ?? VARIANT_COLORS.default;
          const label = VARIANT_LABELS[set.variant] ?? 'Default';
          return (
            <div key={set.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Hashtag icon */}
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: colors.tag,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 13,
                color: '#8a7a72',
                fontWeight: 700,
              }}>
                #
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#3d2f2f',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {set.name}
                </div>
                <div style={{ fontSize: 10.5, color: '#8a7a72' }}>{set.count} hashtags</div>
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: 99,
                background: colors.badge,
                color: colors.badgeText,
                flexShrink: 0,
              }}>
                {label}
              </span>
              <button style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#8a7a72',
                padding: 2,
                flexShrink: 0,
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
