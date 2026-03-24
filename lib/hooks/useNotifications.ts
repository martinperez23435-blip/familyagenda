import { useState, useEffect } from 'react';
import { subscribeToNotifications } from '@/lib/services/notificationService';
import { Notification } from '@/lib/types/notification.types';
import { useAuthStore } from '@/store/authStore';

export function useNotifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToNotifications(user.id, setNotifications);
    return () => unsub();
  }, [user?.id]);

  const unread = notifications.filter((n) => !n.isRead);

  return { notifications, unread, unreadCount: unread.length };
}
