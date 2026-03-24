import { doc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { notifyAssignment } from './notificationService';
import { getUsers } from './userService';

type AssignmentType = 'dropoff' | 'pickup';

export async function takeAssignment(
  eventId: string,
  eventTitle: string,
  eventDate: string,
  type: AssignmentType,
  userId: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, 'calendar_events', eventId);
      const eventDoc = await transaction.get(eventRef);
      if (!eventDoc.exists()) throw new Error('Evento no encontrado');
      const data = eventDoc.data();
      if (data[type].status !== 'pending') throw new Error('Ya fue asignado');
      transaction.update(eventRef, {
        [`${type}.assignedTo`]: userId,
        [`${type}.assignedAt`]: new Date(),
        [`${type}.status`]: 'assigned',
      });
    });
    const users = await getUsers();
    await notifyAssignment(
      type === 'dropoff' ? 'dropoff_assigned' : 'pickup_assigned',
      eventId, eventDate, eventTitle,
      { id: userId, displayName: userName },
      users
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function releaseAssignment(
  eventId: string,
  eventTitle: string,
  eventDate: string,
  type: AssignmentType,
  userId: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, 'calendar_events', eventId);
      const eventDoc = await transaction.get(eventRef);
      if (!eventDoc.exists()) throw new Error('Evento no encontrado');
      const data = eventDoc.data();
      if (data[type].assignedTo !== userId) throw new Error('No sos el asignado');
      transaction.update(eventRef, {
        [`${type}.assignedTo`]: null,
        [`${type}.assignedAt`]: null,
        [`${type}.status`]: 'pending',
      });
    });
    const users = await getUsers();
    await notifyAssignment(
      type === 'dropoff' ? 'dropoff_released' : 'pickup_released',
      eventId, eventDate, eventTitle,
      { id: userId, displayName: userName },
      users
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markDone(
  eventId: string,
  eventTitle: string,
  eventDate: string,
  type: AssignmentType,
  userId: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, 'calendar_events', eventId);
      const eventDoc = await transaction.get(eventRef);
      if (!eventDoc.exists()) throw new Error('Evento no encontrado');
      const data = eventDoc.data();
      if (data[type].assignedTo !== userId) throw new Error('No sos el asignado');
      transaction.update(eventRef, {
        [`${type}.status`]: 'done',
        [`${type}.doneAt`]: new Date(),
      });
    });
    const users = await getUsers();
    await notifyAssignment(
      type === 'dropoff' ? 'dropoff_done' : 'pickup_done',
      eventId, eventDate, eventTitle,
      { id: userId, displayName: userName },
      users
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
