import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { CalendarEvent, ActivityTemplate } from '@/lib/types/event.types';

// ── CALENDAR EVENTS ──────────────────────────────────────────

export async function createCalendarEvent(
  data: Omit<CalendarEvent, 'id' | 'createdAt'>
) {
  const ref = await addDoc(collection(db, 'calendar_events'), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateCalendarEvent(
  id: string,
  data: Partial<CalendarEvent>
) {
  await updateDoc(doc(db, 'calendar_events', id), data);
}

export async function deleteCalendarEvent(id: string) {
  await deleteDoc(doc(db, 'calendar_events', id));
}

export async function getEventsByDate(date: string): Promise<CalendarEvent[]> {
  const q = query(
    collection(db, 'calendar_events'),
    where('date', '==', date),
    where('isActive', '==', true),
    where('isCancelled', '==', false)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CalendarEvent));
}

export async function getEventsByDateRange(
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {
  const q = query(
    collection(db, 'calendar_events'),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    where('isActive', '==', true),
    where('isCancelled', '==', false),
    orderBy('date'),
    orderBy('startTime')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CalendarEvent));
}

// ── ACTIVITY TEMPLATES ───────────────────────────────────────

export async function createTemplate(
  data: Omit<ActivityTemplate, 'id' | 'createdAt'>
) {
  const ref = await addDoc(collection(db, 'activity_templates'), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateTemplate(
  id: string,
  data: Partial<ActivityTemplate>
) {
  await updateDoc(doc(db, 'activity_templates', id), data);
}

export async function deleteTemplate(id: string) {
  await deleteDoc(doc(db, 'activity_templates', id));
}

export async function getTemplates(): Promise<ActivityTemplate[]> {
  const q = query(
    collection(db, 'activity_templates'),
    where('isActive', '==', true)
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as ActivityTemplate)
  );
}

export async function getEventsByTemplateAndDateRange(
  templateId: string,
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {
  const q = query(
    collection(db, 'calendar_events'),
    where('templateId', '==', templateId),
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CalendarEvent));
}
