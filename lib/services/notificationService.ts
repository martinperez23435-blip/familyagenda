import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Notification, NotificationType } from '@/lib/types/notification.types';

export async function createNotification(data: Omit<Notification, 'id' | 'createdAt'>) {
  await addDoc(collection(db, 'notifications'), {
    ...data,
    createdAt: Timestamp.now(),
  });
}

export async function markNotificationRead(id: string) {
  await updateDoc(doc(db, 'notifications', id), { isRead: true });
}

export async function markAllRead(userId: string) {
  const q = query(
    collection(db, 'notifications'),
    where('toUserId', '==', userId),
    where('isRead', '==', false)
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { isRead: true })));
}

export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
) {
  const q = query(
    collection(db, 'notifications'),
    where('toUserId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const notifications = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
    callback(notifications);
  });
}

export async function notifyAssignment(
  type: NotificationType,
  eventId: string,
  eventDate: string,
  eventTitle: string,
  fromUser: { id: string; displayName: string },
  allUsers: { id: string }[]
) {
  const messages: Record<NotificationType, string> = {
    dropoff_assigned: `${fromUser.displayName} va a llevar a ${eventTitle}`,
    dropoff_released: `${fromUser.displayName} no puede llevar a ${eventTitle} — ¡queda libre!`,
    dropoff_done: `${fromUser.displayName} ya llevó a ${eventTitle} ✓`,
    pickup_assigned: `${fromUser.displayName} va a retirar de ${eventTitle}`,
    pickup_released: `${fromUser.displayName} no puede retirar de ${eventTitle} — ¡queda libre!`,
    pickup_done: `${fromUser.displayName} ya retiró de ${eventTitle} ✓`,
  };

  const otherUsers = allUsers.filter((u) => u.id !== fromUser.id);
  await Promise.all(
    otherUsers.map((u) =>
      createNotification({
        toUserId: u.id,
        fromUserId: fromUser.id,
        eventId,
        type,
        message: messages[type],
        isRead: false,
        eventDate,
      })
    )
  );
}
