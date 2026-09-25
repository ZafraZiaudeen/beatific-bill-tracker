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
      background: '#fff',
      border: '1px solid #ece4da',
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
      <div style={{
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
        <div style={{ fontSize: 26, fontWeight: 700, color: '#3d2f2f', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#8a7a72', marginTop: 3 }}>{label}</div>
        <div style={{ width: 28, height: 2, background: underlineColor, borderRadius: 2, marginTop: 6 }} />
      </div>
    </div>
  );
}
