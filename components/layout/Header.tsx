'use client';

import NotificationBell from '@/components/notifications/NotificationBell';

export default function Header() {
  return (
    <header style={{ background: '#2d6a4f', padding: '22px 16px 18px' }} className="flex items-center justify-between sticky top-0 z-40">
      <span style={{ color: '#fff', fontSize: '17px', fontWeight: 500 }}>Actividades</span>
      <NotificationBell />
    </header>
  );
}
