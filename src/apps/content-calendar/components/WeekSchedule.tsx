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
      {days.map((day) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayPosts = postsByDate[dateKey] ?? [];
        const dayLabel = format(day, 'EEE');
        const dateLabel = format(day, 'MMM d');

        return (
          <div key={dateKey} style={{ display: 'flex', gap: 14, minHeight: 60 }}>
            {/* Day label column */}
            <div style={{ width: 52, flexShrink: 0, paddingTop: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cc-text)' }}>{dayLabel}</div>
              <div style={{ fontSize: 11, color: 'var(--cc-text-3)' }}>{dateLabel}</div>
            </div>

            {/* Posts */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {dayPosts.length > 0
                ? dayPosts.map((p) => <PostRow key={p.id} post={p} mediaItems={mediaItems} mediaUrls={mediaUrls} />)
                : (
                  <div style={{
                    height: 44, marginTop: 8, borderRadius: 8,
                    border: '1.5px dashed var(--cc-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 8,
                  }}>
                    <span style={{ fontSize: 11, color: 'var(--cc-text-3)' }}>No post scheduled</span>
                  </div>
                )
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}
