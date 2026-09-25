import type { SavedIdea } from '../types';

interface SavedIdeasProps {
  ideas: SavedIdea[];
  onViewAll: () => void;
}

export default function SavedIdeas({ ideas, onViewAll }: SavedIdeasProps) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #ece4da',
      borderRadius: 14,
      padding: '16px 18px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#3d2f2f' }}>Saved Ideas</span>
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

      {/* Ideas list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ideas.map((idea) => (
          <div key={idea.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Lightbulb icon */}
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#fdf3c0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a88a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="9" y1="18" x2="15" y2="18"/>
                <line x1="10" y1="22" x2="14" y2="22"/>
                <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
              </svg>
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
                {idea.title}
              </div>
              <div style={{ fontSize: 10.5, color: '#8a7a72' }}>{idea.type}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
