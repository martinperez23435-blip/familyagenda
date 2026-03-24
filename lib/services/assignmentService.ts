import { doc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

type AssignmentType = 'dropoff' | 'pickup';

export async function takeAssignment(
  eventId: string,
  type: AssignmentType,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, 'calendar_events', eventId);
      const eventDoc = await transaction.get(eventRef);

      if (!eventDoc.exists()) throw new Error('Evento no encontrado');

      const data = eventDoc.data();
      const assignment = data[type];

      if (assignment.status !== 'pending') {
        throw new Error('Ya fue asignado');
      }

      transaction.update(eventRef, {
        [`${type}.assignedTo`]: userId,
        [`${type}.assignedAt`]: new Date(),
        [`${type}.status`]: 'assigned',
      });
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function releaseAssignment(
  eventId: string,
  type: AssignmentType,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, 'calendar_events', eventId);
      const eventDoc = await transaction.get(eventRef);

      if (!eventDoc.exists()) throw new Error('Evento no encontrado');

      const data = eventDoc.data();
      const assignment = data[type];

      if (assignment.assignedTo !== userId) {
        throw new Error('No sos el asignado');
      }

      transaction.update(eventRef, {
        [`${type}.assignedTo`]: null,
        [`${type}.assignedAt`]: null,
        [`${type}.status`]: 'pending',
      });
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markDone(
  eventId: string,
  type: AssignmentType,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, 'calendar_events', eventId);
      const eventDoc = await transaction.get(eventRef);

      if (!eventDoc.exists()) throw new Error('Evento no encontrado');

      const data = eventDoc.data();
      const assignment = data[type];

      if (assignment.assignedTo !== userId) {
        throw new Error('No sos el asignado');
      }

      transaction.update(eventRef, {
        [`${type}.status`]: 'done',
        [`${type}.doneAt`]: new Date(),
      });
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
