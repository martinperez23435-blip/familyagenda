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

const CARD_COLORS = [
  { bg: '#d4e9d4', border: '#1b4332', title: '#1b4332' },
  { bg: '#d6e4f0', border: '#1a4971', title: '#1a4971' },
  { bg: '#f0e6d4', border: '#7a4a1a', title: '#7a4a1a' },
  { bg: '#e9d4e9', border: '#4a1a7a', title: '#4a1a7a' },
  { bg: '#f0d4d4', border: '#7a1a1a', title: '#7a1a1a' },
];

export default function WeekPage() {
  const { user: currentUser } = useAuthStore();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [minors, setMinors] = useState<Minor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const today = format(new Date(), 'yyyy-MM-dd');

  // All 7 days of the week
  const allDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Future/today days first, past days at the end
  const futureDays = allDays.filter((d) => format(d, 'yyyy-MM-dd') >= today);
  const pastDays = allDays.filter((d) => format(d, 'yyyy-MM-dd') < today);
  const orderedDays = [...futureDays, ...pastDays];

  useEffect(() => {
    loadData();
  }, []);

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
    if (status === 'done') return { label: `✓ ${getUserName(assignedTo!)}`, bg: '#1b4332', color: '#b7e4c7' };
    if (status === 'assigned') return { label: `👤 ${getUserName(assignedTo!)}`, bg: '#2d6a4f', color: '#fff' };
    return { label: type === 'dropoff' ? '🚗' : '🏠', bg: 'rgba(0,0,0,0.08)', color: '#333' };
  }

  return (
    <div className="p-4">
      <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#1b4332', marginBottom: '16px' }}>Semana</h1>

      {loading ? (
        <p style={{ color: '#2d5a3d' }}>Cargando...</p>
      ) : (
        <div className="flex flex-col gap-6">
          {orderedDays.map((day, dayIndex) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isPast = dateStr < today;
            const isToday = dateStr === today;
            const dayEvents = events
              .filter((e) => e.date === dateStr)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div key={dateStr}>
                {/* Separador visual entre presente y pasado */}
                {dayIndex === futureDays.length && pastDays.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', opacity: 0.6 }}>
                    <div style={{ flex: 1, height: '1px', background: '#2d6a4f' }} />
                    <span style={{ fontSize: '11px', color: '#2d6a4f', fontWeight: 500 }}>días anteriores</span>
                    <div style={{ flex: 1, height: '1px', background: '#2d6a4f' }} />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: isToday ? '#2d6a4f' : isPast ? 'rgba(0,0,0,0.12)' : 'rgba(45,106,79,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 500,
                    color: isToday ? '#fff' : isPast ? '#888' : '#1b4332'
                  }}>
                    {format(day, 'd')}
                  </div>
                  <p style={{
                    fontSize: '13px', fontWeight: isToday ? 600 : 500,
                    color: isToday ? '#2d6a4f' : isPast ? '#888' : '#1b4332',
                    textTransform: 'capitalize'
                  }}>
                    {format(day, 'EEEE', { locale: es })}
                  </p>
                </div>

                {dayEvents.length === 0 ? (
                  <p style={{ fontSize: '12px', color: isPast ? '#aaa' : '#52796f', marginLeft: '36px' }}>Sin actividades</p>
                ) : (
                  <div className="flex flex-col gap-2" style={{ marginLeft: '36px', opacity: isPast ? 0.65 : 1 }}>
                    {dayEvents.map((event, idx) => {
                      const colors = CARD_COLORS[idx % CARD_COLORS.length];
                      const dropoff = getStatusChip(event.dropoff.status, 'dropoff', event.dropoff.assignedTo);
                      const pickupInfo = getPickupStatus(event);
                      const pickup = getStatusChip(pickupInfo.status, 'pickup', pickupInfo.assignedTo);
                      return (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          style={{ background: colors.bg, borderRadius: '14px', padding: '12px', borderLeft: `4px solid ${colors.border}`, cursor: 'pointer' }}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 500, color: colors.title }}>{event.title}</p>
                              <p style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
                                {event.startTime} - {event.endTime}
                                {event.location ? ` · ${event.location}` : ''}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {event.minorIds.map((id) => (
                                <div key={id} className="flex flex-col items-center gap-1">
                                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: getMinorColor(id), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 500 }}>
                                    {getMinorName(id)[0]}
                                  </div>
                                  <span style={{ fontSize: '9px', color: '#444', fontWeight: 500 }}>{getMinorName(id)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: 500, background: dropoff.bg, color: dropoff.color }}>
                              {dropoff.label}
                            </span>
                            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: 500, background: pickup.bg, color: pickup.color }}>
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
