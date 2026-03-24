'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
      <Link
        href="/today"
        className={`flex flex-col items-center gap-1 text-xs font-medium ${
          isActive('/today') ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        <span className="text-xl">📅</span>
        <span>Hoy</span>
      </Link>

      <Link
        href="/week"
        className={`flex flex-col items-center gap-1 text-xs font-medium ${
          isActive('/week') ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        <span className="text-xl">📆</span>
        <span>Semana</span>
      </Link>

      {user?.role === 'admin' && (
        <Link
          href="/admin"
          className={`flex flex-col items-center gap-1 text-xs font-medium ${
            isActive('/admin') ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <span className="text-xl">⚙️</span>
          <span>Admin</span>
        </Link>
      )}
    </nav>
  );
}