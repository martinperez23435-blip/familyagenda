import { doc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { notifyAssignment } from './notificationService';
import { getUsers } from './userService';

type AssignmentType = 'dropoff' | 'pickup';

function getField(type: AssignmentType, minorId?: string) {
  return type === 'pickup' && minorId ? `pickup.${minorId}` : type;
}

export async function takeAssignment(
  eventId: string, eventTitle: string, eventDate: string,
  type: AssignmentType, userId: string, userName: string, minorId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const field = getField(type, minorId);
    await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, 'calendar_events', eventId);
      const eventDoc = await transaction.get(eventRef);
      if (!eventDoc.exists()) throw new Error('Evento no encontrado');
      const data = eventDoc.data();
      const assignment = type === 'pickup' && minorId ? data.pickup?.[minorId] : data[type];
      if (assignment?.status !== 'pending') throw new Error('Ya fue asignado');
      transaction.update(eventRef, {
        [`${field}.assignedTo`]: userId,
        [`${field}.assignedAt`]: new Date(),
        [`${field}.status`]: 'assigned',
      });
    });
    const users = await getUsers();
    await notifyAssignment(
      type === 'dropoff' ? 'dropoff_assigned' : 'pickup_assigned',
      eventId, eventDate, eventTitle, { id: userId, displayName: userName }, users
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function releaseAssignment(
  eventId: string, eventTitle: string, eventDate: string,
  type: AssignmentType, userId: string, userName: string, minorId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const field = getField(type, minorId);
    await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, 'calendar_events', eventId);
      const eventDoc = await transaction.get(eventRef);
      if (!eventDoc.exists()) throw new Error('Evento no encontrado');
      const data = eventDoc.data();
      const assignment = type === 'pickup' && minorId ? data.pickup?.[minorId] : data[type];
      if (assignment?.assignedTo !== userId) throw new Error('No sos el asignado');
      transaction.update(eventRef, {
        [`${field}.assignedTo`]: null,
        [`${field}.assignedAt`]: null,
        [`${field}.status`]: 'pending',
      });
    });
    const users = await getUsers();
    await notifyAssignment(
      type === 'dropoff' ? 'dropoff_released' : 'pickup_released',
      eventId, eventDate, eventTitle, { id: userId, displayName: userName }, users
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markDone(
  eventId: string, eventTitle: string, eventDate: string,
  type: AssignmentType, userId: string, userName: string, minorId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const field = getField(type, minorId);
    await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, 'calendar_events', eventId);
      const eventDoc = await transaction.get(eventRef);
      if (!eventDoc.exists()) throw new Error('Evento no encontrado');
      const data = eventDoc.data();
      const assignment = type === 'pickup' && minorId ? data.pickup?.[minorId] : data[type];
      if (assignment?.assignedTo !== userId) throw new Error('No sos el asignado');
      transaction.update(eventRef, {
        [`${field}.status`]: 'done',
        [`${field}.doneAt`]: new Date(),
      });
    });
    const users = await getUsers();
    await notifyAssignment(
      type === 'dropoff' ? 'dropoff_done' : 'pickup_done',
      eventId, eventDate, eventTitle, { id: userId, displayName: userName }, users
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
