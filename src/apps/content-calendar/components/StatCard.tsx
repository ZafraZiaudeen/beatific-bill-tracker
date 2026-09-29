import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: number;
  iconBg: string;
  icon: ReactNode;
  underlineColor: string;
}

export default function StatCard({ label, value, iconBg, icon, underlineColor }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--cc-card)',
      border: '1px solid var(--cc-border)',
      borderRadius: 12,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      flex: 1,
      minWidth: 0,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="cc-stat-icon" style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--cc-text)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--cc-text-3)', marginTop: 3 }}>{label}</div>
        <div style={{ width: 28, height: 2, background: underlineColor, borderRadius: 2, marginTop: 6 }} />
      </div>
    </div>
  );
}
