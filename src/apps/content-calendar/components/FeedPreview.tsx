import type { ContentPost } from '../types';

interface FeedPreviewProps {
  posts: ContentPost[];
}

const EXTRA_COLORS = ['#d8c8b8', '#c8b8a0', '#e0d0c0', '#b8a888', '#d0c0b0'];

export default function FeedPreview({ posts }: FeedPreviewProps) {
  const cells = [
    ...posts.slice(0, 9).map((p) => p.thumbnailBg),
    ...EXTRA_COLORS,
  ].slice(0, 9);

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #ece4da',
      borderRadius: 14,
      padding: '16px 18px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#3d2f2f' }}>Feed Preview</span>
        <button style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#8a7a72',
          display: 'flex',
          alignItems: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </button>
      </div>

      {/* 3×3 grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 3,
        borderRadius: 6,
        overflow: 'hidden',
      }}>
        {cells.map((color, i) => (
          <div key={i} style={{
            aspectRatio: '1',
            background: color,
            borderRadius: 3,
          }} />
        ))}
      </div>
    </div>
  );
}
