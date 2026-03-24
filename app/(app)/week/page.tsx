'use client';

import { useState, useEffect } from 'react';
import { getEventsByDateRange } from '@/lib/services/eventService';
import { getMinors } from '@/lib/services/minorService';
import { getUsers } from '@/lib/services/userService';
import { CalendarEvent } from '@/lib/types/event.types';
import { Minor } from '@/lib/types/minor.types';
import { User } from '@/lib/types/user.types';
import { useAuthStore } from '@/store/authStore';
import EventDetailSheet from '@/components/events/EventDetailSheet';
import { format, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

function getPickupStatus(event: CalendarEvent): { status: string; assignedTo: string | null } {
  const pickup = event.pickup as any;
  const keys = event.minorIds;
  if (!keys.length) return { status: 'pending', assignedTo: null };
  const first = pickup[keys[0]];
  if (!first) return { status: 'pending', assignedTo: null };
  return { status: first.status, assignedTo: first.assignedTo };
}

export default function WeekPage() {
  const { user: currentUser } = useAuthStore();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [minors, setMinors] = useState<Minor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const startStr = format(weekStart, 'yyyy-MM-dd');
    const endStr = format(addDays(weekStart, 6), 'yyyy-MM-dd');
    const [eventsData, minorsData, usersData] = await Promise.all([
      getEventsByDateRange(startStr, endStr),
      getMinors(),
      getUsers(),
    ]);
    setEvents(eventsData);
    setMinors(minorsData);
    setUsers(usersData);
    setLoading(false);
  }

  async function handleUpdate() {
    const startStr = format(weekStart, 'yyyy-MM-dd');
    const endStr = format(addDays(weekStart, 6), 'yyyy-MM-dd');
    const eventsData = await getEventsByDateRange(startStr, endStr);
    setEvents(eventsData);
    if (selectedEvent) {
      const updated = eventsData.find((e) => e.id === selectedEvent.id);
      if (updated) setSelectedEvent(updated);
    }
  }

  function getMinorColor(id: string) {
    return minors.find((m) => m.id === id)?.color ?? '#ccc';
  }

  function getMinorName(id: string) {
    return minors.find((m) => m.id === id)?.name ?? id;
  }

  function getUserName(id: string) {
    return users.find((u) => u.id === id)?.displayName ?? 'Alguien';
  }

  function getStatusChip(status: string, type: 'dropoff' | 'pickup', assignedTo: string | null) {
    if (status === 'done') return { label: `✓ ${getUserName(assignedTo!)}`, color: 'text-green-600 bg-green-50' };
    if (status === 'assigned') return { label: `👤 ${getUserName(assignedTo!)}`, color: 'text-blue-600 bg-blue-50' };
    return { label: type === 'dropoff' ? '🚗' : '🏠', color: 'text-orange-400 bg-orange-50' };
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Semana</h1>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="flex flex-col gap-6">
          {weekDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayEvents = events
              .filter((e) => e.date === dateStr)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            const isToday = dateStr === today;

            return (
              <div key={dateStr}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${isToday ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {format(day, 'd')}
                  </div>
                  <p className={`text-sm font-semibold capitalize ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                    {format(day, 'EEEE', { locale: es })}
                  </p>
                </div>

                {dayEvents.length === 0 ? (
                  <p className="text-xs text-gray-300 ml-9">Sin actividades</p>
                ) : (
                  <div className="flex flex-col gap-2 ml-9">
                    {dayEvents.map((event) => {
                      const dropoff = getStatusChip(event.dropoff.status, 'dropoff', event.dropoff.assignedTo);
                      const pickupInfo = getPickupStatus(event);
                      const pickup = getStatusChip(pickupInfo.status, 'pickup', pickupInfo.assignedTo);
                      return (
                        <div
                          key={event.id}
                          className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-pointer"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm text-gray-900">{event.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {event.startTime} - {event.endTime}
                                {event.location ? ` · ${event.location}` : ''}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {event.minorIds.map((id) => (
                                <div key={id} className="flex flex-col items-center gap-0.5">
                                  <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                    style={{ backgroundColor: getMinorColor(id) }}
                                  >
                                    {getMinorName(id)[0]}
                                  </div>
                                  <span className="text-xs text-gray-400">{getMinorName(id)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dropoff.color}`}>
                              {dropoff.label}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pickup.color}`}>
                              {pickup.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedEvent && currentUser && (
        <EventDetailSheet
          event={selectedEvent}
          minors={minors}
          users={users}
          currentUser={currentUser}
          onClose={() => setSelectedEvent(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
