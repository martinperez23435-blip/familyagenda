'use client';

import { useState } from 'react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { markAllRead } from '@/lib/services/notificationService';
import { useAuthStore } from '@/store/authStore';

export default function NotificationBell() {
  const { user } = useAuthStore();
  const { notifications, unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  async function handleClose() {
    setOpen(false);
    if (user && unreadCount > 0) {
      await markAllRead(user.id);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="relative p-2">
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50" onClick={handleClose}>
          <div
            className="bg-white rounded-t-3xl w-full max-w-lg max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold">Notificaciones</h2>
              <button onClick={handleClose} className="text-gray-400 text-sm">Cerrar</button>
            </div>

            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <span className="text-4xl mb-3">🔕</span>
                <p className="text-gray-400 text-sm">Sin notificaciones</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.slice(0, 30).map((n) => (
                  <div
                    key={n.id}
                    className={`px-5 py-3 border-b border-gray-50 ${!n.isRead ? 'bg-blue-50' : ''}`}
                  >
                    <p className="text-sm text-gray-800">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.eventDate}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
