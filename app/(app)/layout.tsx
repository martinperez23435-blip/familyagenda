'use client';

import AuthGuard from '@/components/layout/AuthGuard';
import BottomNav from '@/components/layout/BottomNav';
import Header from '@/components/layout/Header';
import { useGenerateEvents } from '@/lib/hooks/useGenerateEvents';

function AppContent({ children }: { children: React.ReactNode }) {
  useGenerateEvents();
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #a8c8a8 0%, #b8d4b8 40%, #d4e8d4 100%)' }} className="flex flex-col">
      <Header />
      <main className="flex-1 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppContent>{children}</AppContent>
    </AuthGuard>
  );
}
