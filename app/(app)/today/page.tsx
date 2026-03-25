'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getMinors } from '@/lib/services/minorService';
import { getUsers } from '@/lib/services/userService';
import { getFeriados, initFeriados } from '@/lib/services/feriadoService';
import { getMensajeComico, Feriado } from '@/lib/data/feriados2026';
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

const CARD_COLORS = [
  { bg: '#d4e9d4', border: '#1b4332', title: '#1b4332' },
  { bg: '#d6e4f0', border: '#1a4971', title: '#1a4971' },
  { bg: '#f0e6d4', border: '#7a4a1a', title: '#7a4a1a' },
  { bg: '#e9d4e9', border: '#4a1a7a', title: '#4a1a7a' },
  { bg: '#f0d4d4', border: '#7a1a1a', title: '#7a1a1a' },
];

export default function TodayPage() {
  const { user: currentUser } = useAuthStore();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [minors, setMinors] = useState<Minor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [, setNow] = useState(new Date());
  const [mensajeComico] = useState(getMensajeComico());

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLabel = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  useEffect(() => {
    Promise.all([getMinors(), getUsers()]).then(([minorsData, usersData]) => {
      setMinors(minorsData);
      setUsers(usersData);
    });

    initFeriados().then(() => getFeriados()).then(setFeriados);

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
      setSelectedEvent((prev) => {
        if (!prev) return null;
        const updated = eventsData.find((e) => e.id === prev.id);
        return updated ?? null;
      });
    });

    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => { unsub(); clearInterval(interval); };
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

  function getStatusChip(status: string, type: 'dropoff' | 'pickup', assignedTo: string | null, minorName?: string) {
    const quien = getUserName(assignedTo!);
    const aQuien = minorName ? ` a ${minorName}` : '';
    if (status === 'done') return { label: `✓ ${type === 'dropoff' ? 'Llevó' : `Retiró${aQuien}`}: ${quien}`, bg: '#1b4332', color: '#b7e4c7' };
    if (status === 'assigned') return { label: `👤 ${type === 'dropoff' ? 'Lleva' : `Retira${aQuien}`}: ${quien}`, bg: '#2d6a4f', color: '#fff' };
    return { label: type === 'dropoff' ? '🚗 Sin llevar' : '🏠 Sin retirar', bg: 'rgba(0,0,0,0.08)', color: '#333' };
  }

  function getPickupChips(event: CalendarEvent) {
    const pickup = event.pickup as any;
    const endTimes = event.minorIds.map((id) => pickup[id]?.endTime ?? event.endTime);
    const allSame = endTimes.every((t: string) => t === endTimes[0]);
    if (allSame || event.minorIds.length === 1) {
      const p = pickup[event.minorIds[0]];
      return [getStatusChip(p?.status ?? 'pending', 'pickup', p?.assignedTo ?? null)];
    }
    return event.minorIds.map((id) => {
      const p = pickup[id];
      return getStatusChip(p?.status ?? 'pending', 'pickup', p?.assignedTo ?? null, getMinorName(id));
    });
  }

  const visibleEvents = events.filter((e) => !isEventOver(e));
  const feriadoHoy = feriados.find((f) => f.date === today);

  return (
    <div className="p-4">
      <div className="mb-5">
        <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#1b4332', textTransform: 'capitalize' }}>{todayLabel}</h1>
      </div>

      {loading ? (
        <p style={{ color: '#2d5a3d' }}>Cargando...</p>
      ) : feriadoHoy ? (
        // FERIADO — no se muestran actividades
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span style={{ fontSize: '72px', marginBottom: '16px' }}>🎉</span>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#7a4a1a', marginBottom: '8px' }}>
            {feriadoHoy.nombre}
          </p>
          <p style={{ fontSize: '16px', color: '#a0522d', maxWidth: '280px', lineHeight: '1.5' }}>
            {mensajeComico}
          </p>
        </div>
      ) : visibleEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span style={{ fontSize: '60px' }}>🎉</span>
          <p style={{ fontSize: '18px', fontWeight: 500, color: '#2d5a3d', marginTop: '16px' }}>¡Todo listo por hoy!</p>
          <p style={{ fontSize: '13px', color: '#52796f', marginTop: '4px' }}>No hay actividades pendientes</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleEvents.map((event, index) => {
            const colors = CARD_COLORS[index % CARD_COLORS.length];
            const dropoff = getStatusChip(event.dropoff.status, 'dropoff', event.dropoff.assignedTo);
            return (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                style={{ background: colors.bg, borderRadius: '16px', padding: '14px', borderLeft: `4px solid ${colors.border}`, cursor: 'pointer' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 600, color: colors.title }}>{event.title}</h3>
                    <p style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>
                      {event.startTime}
                      {event.location ? ` · ${event.location}` : ''}
                    </p>
                    {event.minorIds.length > 1 && (() => {
                      const pickup = event.pickup as any;
                      const times = event.minorIds.map((id) => ({ name: getMinorName(id), time: pickup[id]?.endTime ?? event.endTime }));
                      const allSame = times.every((t) => t.time === times[0].time);
                      if (allSame) return <p style={{ fontSize: '12px', color: '#555' }}>hasta {times[0].time}</p>;
                      return <p style={{ fontSize: '12px', color: '#555' }}>{times.map((t) => `${t.name} hasta ${t.time}`).join(' · ')}</p>;
                    })()}
                  </div>
                  <div className="flex gap-2">
                    {event.minorIds.map((id) => (
                      <div key={id} className="flex flex-col items-center gap-1">
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: getMinorColor(id), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 500 }}>
                          {getMinorName(id)[0]}
                        </div>
                        <span style={{ fontSize: '10px', color: '#444', fontWeight: 500 }}>{getMinorName(id)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: 500, background: dropoff.bg, color: dropoff.color }}>
                    {dropoff.label}
                  </span>
                  {getPickupChips(event).map((chip, i) => (
                    <span key={i} style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: 500, background: chip.bg, color: chip.color }}>
                      {chip.label}
                    </span>
                  ))}
                </div>
                {event.notes && <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>{event.notes}</p>}
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
