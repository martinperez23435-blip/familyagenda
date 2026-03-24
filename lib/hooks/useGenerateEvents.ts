import { useEffect } from 'react';
import { getTemplates, getEventsByTemplateAndDateRange, createCalendarEvent } from '@/lib/services/eventService';
import { format, addDays, addWeeks, startOfToday, getISODay } from 'date-fns';

let alreadyRan = false;

export function useGenerateEvents() {
  useEffect(() => {
    if (alreadyRan) return;
    alreadyRan = true;
    generateUpcomingEvents();
  }, []);
}

export async function generateUpcomingEvents() {
  try {
    const templates = await getTemplates();
    if (templates.length === 0) return;

    const today = startOfToday();
    const endDate = addWeeks(today, 4);
    const startStr = format(today, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');

    for (const template of templates) {
      const existing = await getEventsByTemplateAndDateRange(template.id, startStr, endStr);
      const existingDates = new Set(existing.map((e) => e.date));

      let current = today;
      while (current <= endDate) {
        const isoDay = getISODay(current);
        const dateStr = format(current, 'yyyy-MM-dd');

        if (isoDay === template.dayOfWeek && !existingDates.has(dateStr)) {
          // Build pickup per minor
          const pickup: { [minorId: string]: any } = {};
          template.minorIds.forEach((id) => {
            pickup[id] = {
              assignedTo: null,
              assignedAt: null,
              status: 'pending',
              doneAt: null,
              endTime: template.endTimes?.[id] ?? template.endTime,
            };
          });

          await createCalendarEvent({
            templateId: template.id,
            title: template.title,
            type: 'recurring_instance',
            minorIds: template.minorIds,
            date: dateStr,
            startTime: template.startTime,
            endTime: template.endTime,
            location: template.location,
            notes: template.notes,
            isActive: true,
            isCancelled: false,
            createdBy: template.createdBy,
            dropoff: { assignedTo: null, assignedAt: null, status: 'pending', doneAt: null },
            pickup,
          });
        }
        current = addDays(current, 1);
      }
    }
  } catch (err) {
    console.error('Error generando eventos:', err);
  }
}
