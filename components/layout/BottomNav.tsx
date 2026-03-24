'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const isActive = (path: string) => pathname === path;

  return (
    <nav style={{ background: '#fff', borderTop: '1px solid rgba(45,106,79,0.2)', boxShadow: '0 -2px 8px rgba(45,106,79,0.08)' }} className="fixed bottom-0 left-0 right-0 flex justify-around items-center h-16 z-50">
      <Link href="/today" className="flex flex-col items-center gap-1" style={{ color: isActive('/today') ? '#1b4332' : '#2d5a3d', fontWeight: isActive('/today') ? 600 : 500, fontSize: '11px' }}>
        <span style={{ fontSize: '22px' }}>📅</span>
        <span>Hoy</span>
      </Link>

      <Link href="/week" className="flex flex-col items-center gap-1" style={{ color: isActive('/week') ? '#1b4332' : '#2d5a3d', fontWeight: isActive('/week') ? 600 : 500, fontSize: '11px' }}>
        <span style={{ fontSize: '22px' }}>📆</span>
        <span>Semana</span>
      </Link>

      {user?.role === 'admin' && (
        <Link href="/admin" className="flex flex-col items-center gap-1" style={{ color: isActive('/admin') ? '#1b4332' : '#2d5a3d', fontWeight: isActive('/admin') ? 600 : 500, fontSize: '11px' }}>
          <span style={{ fontSize: '22px' }}>⚙️</span>
          <span>Admin</span>
        </Link>
      )}
    </nav>
  );
}
