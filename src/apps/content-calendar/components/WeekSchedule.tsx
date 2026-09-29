import { format, parseISO, eachDayOfInterval, addDays } from 'date-fns';
import type { ContentPost } from '../types';
import PostRow from './PostRow';
import sparkleImg from '../../../assets/budget-assets/sun-sparkles/sun-sparkles-02.png';
import type { StoredMediaItem } from '../mediaStorage';

interface WeekScheduleProps {
  posts: ContentPost[];
  weekOf: string;
  onViewMonth: () => void;
  mediaItems?: StoredMediaItem[];
  mediaUrls?: Record<string, string>;
}

export default function WeekSchedule({ posts, weekOf, onViewMonth, mediaItems, mediaUrls }: WeekScheduleProps) {
  const monday = parseISO(weekOf);
  const days = eachDayOfInterval({ start: monday, end: addDays(monday, 6) });

  const postsByDate: Record<string, ContentPost[]> = {};
  for (const p of posts) {
    if (!postsByDate[p.date]) postsByDate[p.date] = [];
    postsByDate[p.date].push(p);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--cc-text)', fontFamily: '"DM Serif Display", Georgia, serif' }}>
            This Week's Schedule
          </span>
          <img src={sparkleImg} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
        </div>
        <button
          onClick={onViewMonth}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: 'var(--cc-text-3)', display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          View month →
        </button>
      </div>

      {/* Day rows */}
      <div>
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayPosts = postsByDate[dateKey] ?? [];
          const visiblePosts = dayPosts.slice(0, 2);
          const hiddenCount = Math.max(0, dayPosts.length - 2);
          const dayLabel = format(day, 'EEE');
          const dateLabel = format(day, 'MMM d');

          return (
            <div key={dateKey} style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
              {/* Day label column */}
              <div style={{ width: 52, flexShrink: 0, paddingTop: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cc-text)' }}>{dayLabel}</div>
                <div style={{ fontSize: 11, color: 'var(--cc-text-3)' }}>{dateLabel}</div>
              </div>

              {/* Posts */}
              <div style={{
                flex: 1, minWidth: 0,
                background: 'var(--cc-bg-2)',
                borderRadius: 7,
                padding: dayPosts.length > 0 ? '2px 8px 0' : '0',
              }}>
                {dayPosts.length > 0 ? (
                  <>
                    {visiblePosts.map((p) => <PostRow key={p.id} post={p} mediaItems={mediaItems} mediaUrls={mediaUrls} />)}
                    {hiddenCount > 0 && (
                      <button
                        onClick={onViewMonth}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: 10, color: 'var(--cc-text-3)', padding: '3px 0 6px',
                          display: 'block', fontFamily: 'inherit',
                        }}
                      >
                        +{hiddenCount} more · view all →
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{
                    height: 42, borderRadius: 7,
                    border: '1.5px dashed var(--cc-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 11, color: 'var(--cc-text-3)' }}>No post scheduled</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
