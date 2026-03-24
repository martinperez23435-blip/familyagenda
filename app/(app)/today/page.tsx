'use client';

import { useState, useEffect } from 'react';
import { getEventsByDate } from '@/lib/services/eventService';
import { getMinors } from '@/lib/services/minorService';
import { getUsers } from '@/lib/services/userService';
import { CalendarEvent } from '@/lib/types/event.types';
import { Minor } from '@/lib/types/minor.types';
import { User } from '@/lib/types/user.types';
import { useAuthStore } from '@/store/authStore';
import EventDetailSheet from '@/components/events/EventDetailSheet';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TodayPage() {
  const { user: currentUser } = useAuthStore();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [minors, setMinors] = useState<Minor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLabel = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [eventsData, minorsData, usersData] = await Promise.all([
      getEventsByDate(today),
      getMinors(),
      getUsers(),
    ]);
    setEvents(eventsData.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    setMinors(minorsData);
    setUsers(usersData);
    setLoading(false);
  }

  async function handleUpdate() {
    const eventsData = await getEventsByDate(today);
    const sorted = eventsData.sort((a, b) => a.startTime.localeCompare(b.startTime));
    setEvents(sorted);
    if (selectedEvent) {
      const updated = sorted.find((e) => e.id === selectedEvent.id);
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
    if (status === 'done') return { label: `✓ ${type === 'dropoff' ? 'Llevó' : 'Retiró'}: ${getUserName(assignedTo!)}`, color: 'text-green-600 bg-green-50' };
    if (status === 'assigned') return { label: `👤 ${type === 'dropoff' ? 'Lleva' : 'Retira'}: ${getUserName(assignedTo!)}`, color: 'text-blue-600 bg-blue-50' };
    return { label: type === 'dropoff' ? '🚗 Sin llevar' : '🏠 Sin retirar', color: 'text-orange-500 bg-orange-50' };
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold capitalize">{todayLabel}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {events.length === 0 ? 'Sin actividades hoy' : `${events.length} actividad${events.length > 1 ? 'es' : ''}`}
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-6xl mb-4">🎉</span>
          <p className="text-lg font-medium text-gray-400">¡Día libre!</p>
          <p className="text-sm text-gray-300">No hay actividades para hoy</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event) => {
            const dropoff = getStatusChip(event.dropoff.status, 'dropoff', event.dropoff.assignedTo);
            const pickup = getStatusChip(event.pickup.status, 'pickup', event.pickup.assignedTo);
            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {event.startTime} - {event.endTime}
                      {event.location ? ` · ${event.location}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    {event.minorIds.map((id) => (
                      <div key={id} className="flex flex-col items-center gap-0.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: getMinorColor(id) }}
                        >
                          {getMinorName(id)[0]}
                        </div>
                        <span className="text-xs text-gray-500">{getMinorName(id)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${dropoff.color}`}>
                    {dropoff.label}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${pickup.color}`}>
                    {pickup.label}
                  </span>
                </div>
                {event.notes && (
                  <p className="text-xs text-gray-400 mt-2">{event.notes}</p>
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
