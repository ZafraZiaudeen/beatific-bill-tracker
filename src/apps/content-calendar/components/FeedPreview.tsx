import type { ContentPost } from '../types';
import type { StoredMediaItem } from '../mediaStorage';
import { mediaUrl } from '../mediaStorage';

interface FeedPreviewProps {
  posts: ContentPost[];
  mediaItems?: StoredMediaItem[];
  mediaUrls?: Record<string, string>;
  onViewAll?: () => void;
}

export default function FeedPreview({ posts, mediaItems = [], mediaUrls = {}, onViewAll }: FeedPreviewProps) {
  const cells = posts.slice(0, 9).map(post => {
    const media = (post.mediaIds ?? []).map(id => mediaItems.find(item => item.id === id)).find(Boolean);
    return { post, src: media ? mediaUrl(media, mediaUrls) : '' };
  });

  return (
    <div style={{
      background: 'var(--cc-card)',
      border: '1px solid var(--cc-border)',
      borderRadius: 14,
      padding: '16px 18px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--cc-text)' }}>Feed Preview</span>
        <button onClick={onViewAll} style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--cc-text-3)',
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
      {cells.length ? <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 3,
        borderRadius: 6,
        overflow: 'hidden',
      }}>
        {cells.map(({ post, src }) => (
          <div key={post.id} style={{
            aspectRatio: '1',
            background: post.thumbnailBg || 'var(--cc-bg-2)',
            borderRadius: 3,
            overflow: 'hidden',
          }}>{src ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--cc-text-3)', fontSize: 9 }}>IMG</span>}</div>
        ))}
      </div> : <div style={{ padding: '28px 10px', border: '1px dashed var(--cc-border)', borderRadius: 6, textAlign: 'center', fontSize: 11, color: 'var(--cc-text-3)' }}>No content to preview.</div>}
    </div>
  );
}
