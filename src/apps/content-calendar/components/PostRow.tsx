import type { ContentPost, Platform } from '../types';

const IgIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

const TikTokIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.15 8.15 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.4 2.8 12 2.8 12 2.8s-4.4 0-6.8.2c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.2.7 11.5v2.1C.7 16 1 18 1 18s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.6 22.1 12 22.1 12 22.1s4.4 0 6.8-.2c.6-.1 1.9-.1 3-1.3C22.7 19 23 17 23 17s.3-2.2.3-4.5v-2.1C23.3 8.2 23 7 23 7zm-13.7 8.8V8.2l7.4 3.8-7.4 3.8z"/>
  </svg>
);

const PinterestIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
  </svg>
);

const PLATFORM_CONFIG: Record<Platform, { icon: React.ReactNode; bg: string; color: string }> = {
  instagram: { icon: <IgIcon />, bg: '#fce8f3', color: '#b0468a' },
  tiktok: { icon: <TikTokIcon />, bg: '#f0f0f0', color: '#1a1a1a' },
  youtube: { icon: <YouTubeIcon />, bg: '#fde8e8', color: '#cc0000' },
  pinterest: { icon: <PinterestIcon />, bg: '#fde8e8', color: '#e60023' },
};

const TYPE_BADGE: Record<string, { bg: string; color: string }> = {
  Carousel: { bg: '#fce8e3', color: '#c27b6a' },
  Reel:     { bg: '#fde8d0', color: '#b5672b' },
  Story:    { bg: '#e3f0e8', color: '#4a7c5f' },
  Static:   { bg: '#e8e9ec', color: '#555f72' },
};

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  Scheduled: { bg: '#ede8f8', color: '#6b52a8' },
  Planned:   { bg: '#fdf0e5', color: '#b56e2f' },
  Published: { bg: '#e3f0e8', color: '#4a7c5f' },
  Idea:      { bg: '#fdf3c0', color: '#8a6a00' },
};

interface PostRowProps {
  post: ContentPost;
}

export default function PostRow({ post }: PostRowProps) {
  const typeBadge = TYPE_BADGE[post.type] ?? TYPE_BADGE.Static;
  const statusBadge = STATUS_BADGE[post.status] ?? STATUS_BADGE.Planned;

  const meta = post.imageCount
    ? `${post.imageCount} image${post.imageCount > 1 ? 's' : ''}`
    : post.duration ?? '';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid #f3ede6',
    }}>
      {/* Thumbnail */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 8,
        background: post.thumbnailBg,
        flexShrink: 0,
      }} />

      {/* Type badge + title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 99,
            background: typeBadge.bg,
            color: typeBadge.color,
          }}>
            {post.type}
          </span>
        </div>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#3d2f2f',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {post.title}
        </div>
        <div style={{ fontSize: 11, color: '#8a7a72', marginTop: 1 }}>
          {meta}{meta && post.category ? ' • ' : ''}{post.category}
        </div>
      </div>

      {/* Platform icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {post.platforms.map((p) => {
          const cfg = PLATFORM_CONFIG[p];
          return (
            <div key={p} style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: cfg.bg,
              color: cfg.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {cfg.icon}
            </div>
          );
        })}
      </div>

      {/* Status badge */}
      <span style={{
        fontSize: 11,
        fontWeight: 500,
        padding: '4px 10px',
        borderRadius: 99,
        background: statusBadge.bg,
        color: statusBadge.color,
        flexShrink: 0,
      }}>
        {post.status}
      </span>

      {/* More */}
      <button style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#8a7a72',
        padding: 4,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
        </svg>
      </button>
    </div>
  );
}
