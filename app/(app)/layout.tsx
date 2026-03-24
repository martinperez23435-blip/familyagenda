'use client';

import AuthGuard from '@/components/layout/AuthGuard';
import BottomNav from '@/components/layout/BottomNav';
import Header from '@/components/layout/Header';
import { useGenerateEvents } from '@/lib/hooks/useGenerateEvents';

function AppContent({ children }: { children: React.ReactNode }) {
  useGenerateEvents();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
