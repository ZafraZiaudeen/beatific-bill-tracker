const C = { text: '#1a1f2e', text2: '#6b7280', surface: '#fff', border: '#e5e2db', accent: '#22c55e', accentBg: '#dcfce7', accentText: '#16a34a' };

interface PlaceholderPageProps {
  title: string;
  subtitle?: string;
  iconPath?: string;
}

export function PlaceholderPage({ title, subtitle, iconPath }: PlaceholderPageProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '60px 28px', textAlign: 'center', gap: 16 }}>
      <div style={{ width: 72, height: 72, borderRadius: 18, background: C.surface, boxShadow: '0 1px 3px rgba(0,0,0,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
          {iconPath ? <path d={iconPath} /> : <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />}
        </svg>
      </div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: C.text, margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: '.875rem', color: C.text2, margin: 0, maxWidth: 380, lineHeight: 1.6 }}>{subtitle}</p>}
      <span style={{ display: 'inline-block', background: C.accentBg, color: C.accentText, fontSize: '.8rem', fontWeight: 600, padding: '4px 12px', borderRadius: 99, marginTop: 4 }}>Coming Soon</span>
    </div>
  );
}
