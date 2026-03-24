'use client';

import NotificationBell from '@/components/notifications/NotificationBell';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <span className="font-bold text-gray-900">Actividades</span>
      <NotificationBell />
    </header>
  );
}
