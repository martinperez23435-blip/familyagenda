'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getMinors } from '@/lib/services/minorService';
import { getUsers } from '@/lib/services/userService';
import { CalendarEvent } from '@/lib/types/event.types';
import { Minor } from '@/lib/types/minor.types';
import { User } from '@/lib/types/user.types';
import { useAuthStore } from '@/store/authStore';
import EventDetailSheet from '@/components/events/EventDetailSheet';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function isEventOver(event: CalendarEvent): boolean {
  const now = new Date();
  const [hours, minutes] = event.endTime.split(':').map(Number);
  const endDate = new Date();
  endDate.setHours(hours, minutes, 0, 0);
  return now > endDate;
}

function getPickupStatus(event: CalendarEvent): { status: string; assignedTo: string | null } {
  const pickup = event.pickup as any;
  const keys = event.minorIds;
  if (!keys.length) return { status: 'pending', assignedTo: null };
  const first = pickup[keys[0]];
  if (!first) return { status: 'pending', assignedTo: null };
  return { status: first.status, assignedTo: first.assignedTo };
}

export default function TodayPage() {
  const { user: currentUser } = useAuthStore();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [minors, setMinors] = useState<Minor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [, setNow] = useState(new Date());

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLabel = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  useEffect(() => {
    // Load minors and users once
    Promise.all([getMinors(), getUsers()]).then(([minorsData, usersData]) => {
      setMinors(minorsData);
      setUsers(usersData);
    });

    // Real-time listener for today's events
    const q = query(
      collection(db, 'calendar_events'),
      where('date', '==', today),
      where('isActive', '==', true),
      where('isCancelled', '==', false)
    );

    const unsub = onSnapshot(q, (snap) => {
      const eventsData = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CalendarEvent));
      setEvents(eventsData.sort((a, b) => a.startTime.localeCompare(b.startTime)));
      setLoading(false);

      // Update selectedEvent if open
      setSelectedEvent((prev) => {
        if (!prev) return null;
        const updated = eventsData.find((e) => e.id === prev.id);
        return updated ?? null;
      });
    });

    // Recalculate every minute to hide finished events
    const interval = setInterval(() => setNow(new Date()), 60000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [today]);

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

  const visibleEvents = events.filter((e) => !isEventOver(e));

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold capitalize">{todayLabel}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {visibleEvents.length === 0 ? 'Sin actividades pendientes' : `${visibleEvents.length} actividad${visibleEvents.length > 1 ? 'es' : ''}`}
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : visibleEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-6xl mb-4">🎉</span>
          <p className="text-lg font-medium text-gray-400">¡Todo listo por hoy!</p>
          <p className="text-sm text-gray-300">No hay actividades pendientes</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleEvents.map((event) => {
            const dropoff = getStatusChip(event.dropoff.status, 'dropoff', event.dropoff.assignedTo);
            const pickupInfo = getPickupStatus(event);
            const pickup = getStatusChip(pickupInfo.status, 'pickup', pickupInfo.assignedTo);
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
          onUpdate={() => {}}
        />
      )}
    </div>
  );
}
