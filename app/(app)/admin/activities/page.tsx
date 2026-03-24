'use client';

import { useState, useEffect } from 'react';
import { getMinors } from '@/lib/services/minorService';
import { createCalendarEvent, getEventsByDateRange, updateCalendarEvent, createTemplate, getTemplates, updateTemplate } from '@/lib/services/eventService';
import { Minor } from '@/lib/types/minor.types';
import { CalendarEvent, ActivityTemplate } from '@/lib/types/event.types';
import { useAuthStore } from '@/store/authStore';
import { Timestamp } from 'firebase/firestore';
import { generateUpcomingEvents } from '@/lib/hooks/useGenerateEvents';

const DAYS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

type ActivityType = 'recurring' | 'unique';

export default function ActivitiesPage() {
  const { user } = useAuthStore();
  const [minors, setMinors] = useState<Minor[]>([]);
  const [templates, setTemplates] = useState<ActivityTemplate[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [activityType, setActivityType] = useState<ActivityType>('recurring');
  const [title, setTitle] = useState('');
  const [selectedMinors, setSelectedMinors] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTimes, setEndTimes] = useState<{ [minorId: string]: string }>({});
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [minorsData, templatesData] = await Promise.all([getMinors(), getTemplates()]);
    const today = new Date();
    const in30 = new Date();
    in30.setDate(today.getDate() + 30);
    const eventsData = await getEventsByDateRange(
      today.toISOString().split('T')[0],
      in30.toISOString().split('T')[0]
    );
    setMinors(minorsData);
    setTemplates(templatesData);
    setEvents(eventsData.filter((e) => e.type === 'unique'));
    setLoading(false);
  }

  function openNew() {
    setActivityType('recurring');
    setTitle('');
    setSelectedMinors([]);
    setSelectedDays([]);
    setDate('');
    setStartTime('');
    setEndTimes({});
    setLocation('');
    setNotes('');
    setShowForm(true);
  }

  function toggleMinor(id: string) {
    setSelectedMinors((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  }

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function setEndTime(minorId: string, value: string) {
    setEndTimes((prev) => ({ ...prev, [minorId]: value }));
  }

  function getLatestEndTime() {
    const times = selectedMinors.map((id) => endTimes[id] || '').filter(Boolean);
    if (times.length === 0) return '';
    return times.sort().reverse()[0];
  }

  function allEndTimesFilled() {
    return selectedMinors.every((id) => endTimes[id]);
  }

  async function handleSave() {
    if (!title.trim() || selectedMinors.length === 0 || !startTime || !allEndTimesFilled() || !user) return;
    if (activityType === 'recurring' && selectedDays.length === 0) return;
    if (activityType === 'unique' && !date) return;
    setSaving(true);
    try {
      const latestEndTime = getLatestEndTime();
      if (activityType === 'recurring') {
        await Promise.all(
          selectedDays.map((day) =>
            createTemplate({
              title,
              minorIds: selectedMinors,
              dayOfWeek: day as 1 | 2 | 3 | 4 | 5 | 6 | 7,
              startTime,
              endTime: latestEndTime,
              endTimes,
              location,
              notes: notes || null,
              isActive: true,
              createdBy: user.id,
              validFrom: Timestamp.now() as any,
              validUntil: null,
            })
          )
        );
        await generateUpcomingEvents();
      } else {
        // Build pickup per minor
        const pickup: { [minorId: string]: any } = {};
        selectedMinors.forEach((id) => {
          pickup[id] = { assignedTo: null, assignedAt: null, status: 'pending', doneAt: null, endTime: endTimes[id] };
        });
        await createCalendarEvent({
          templateId: null,
          title,
          type: 'unique',
          minorIds: selectedMinors,
          date,
          startTime,
          endTime: latestEndTime,
          location,
          notes: notes || null,
          isActive: true,
          isCancelled: false,
          createdBy: user.id,
          dropoff: { assignedTo: null, assignedAt: null, status: 'pending', doneAt: null },
          pickup,
        });
      }
      setShowForm(false);
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivateTemplate(t: ActivityTemplate) {
    if (!confirm(`¿Desactivar "${t.title}"?`)) return;
    await updateTemplate(t.id, { isActive: false });
    await loadData();
  }

  async function handleCancelEvent(e: CalendarEvent) {
    if (!confirm(`¿Cancelar "${e.title}"?`)) return;
    await updateCalendarEvent(e.id, { isCancelled: true });
    await loadData();
  }

  function getMinorName(id: string) {
    return minors.find((m) => m.id === id)?.name ?? id;
  }

  function getMinorColor(id: string) {
    return minors.find((m) => m.id === id)?.color ?? '#ccc';
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Actividades</h1>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Nueva
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <>
          <h2 className="text-base font-semibold text-gray-500 mb-2">Recurrentes</h2>
          {templates.length === 0 ? (
            <p className="text-gray-400 text-sm mb-4">Sin actividades recurrentes.</p>
          ) : (
            <div className="flex flex-col gap-3 mb-6">
              {templates.map((t) => (
                <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-sm text-gray-500">
                        {DAYS.find((d) => d.value === t.dayOfWeek)?.label} · {t.startTime} - {t.endTime}
                      </p>
                      {t.location && <p className="text-sm text-gray-400">{t.location}</p>}
                      <div className="flex gap-1 mt-2">
                        {t.minorIds.map((id) => (
                          <span key={id} className="text-xs text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: getMinorColor(id) }}>
                            {getMinorName(id)}{t.endTimes?.[id] && t.endTimes[id] !== t.endTime ? ` (hasta ${t.endTimes[id]})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => handleDeactivateTemplate(t)} className="text-sm text-red-500 font-medium ml-2">
                      Desactivar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-base font-semibold text-gray-500 mb-2">Únicas (próximos 30 días)</h2>
          {events.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin actividades únicas.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {events.map((e) => (
                <div key={e.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{e.title}</p>
                      <p className="text-sm text-gray-500">{e.date} · {e.startTime} - {e.endTime}</p>
                      {e.location && <p className="text-sm text-gray-400">{e.location}</p>}
                      <div className="flex gap-1 mt-2">
                        {e.minorIds.map((id) => (
                          <span key={id} className="text-xs text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: getMinorColor(id) }}>
                            {getMinorName(id)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => handleCancelEvent(e)} className="text-sm text-red-500 font-medium ml-2">
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-bold mb-4">Nueva actividad</h2>
            <div className="flex flex-col gap-4">

              <div className="flex gap-2">
                <button
                  onClick={() => setActivityType('recurring')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${activityType === 'recurring' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600'}`}
                >
                  Recurrente
                </button>
                <button
                  onClick={() => setActivityType('unique')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${activityType === 'unique' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600'}`}
                >
                  Única
                </button>
              </div>

              <input
                type="text"
                placeholder="Título (ej: Inglés, Fútbol)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div>
                <p className="text-sm text-gray-500 mb-2">Menor(es) — máx. 2</p>
                <div className="flex gap-2 flex-wrap">
                  {minors.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => toggleMinor(m.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 ${selectedMinors.includes(m.id) ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-600'}`}
                      style={selectedMinors.includes(m.id) ? { backgroundColor: m.color, borderColor: m.color } : {}}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {activityType === 'recurring' ? (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Días de la semana</p>
                  <div className="flex gap-2 flex-wrap">
                    {DAYS.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => toggleDay(d.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 ${selectedDays.includes(d.value) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600'}`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Fecha</p>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border rounded-lg px-4 py-3 text-sm w-full outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-2">Hora de inicio</p>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="border rounded-lg px-4 py-3 text-sm w-full outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {selectedMinors.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Hora de salida por menor</p>
                  <div className="flex flex-col gap-2">
                    {selectedMinors.map((id) => {
                      const minor = minors.find((m) => m.id === id);
                      return (
                        <div key={id} className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: minor?.color ?? '#ccc' }}
                          >
                            {minor?.name[0]}
                          </div>
                          <span className="text-sm text-gray-700 flex-1">{minor?.name}</span>
                          <input
                            type="time"
                            value={endTimes[id] || ''}
                            onChange={(e) => setEndTime(id, e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <input
                type="text"
                placeholder="Lugar (opcional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                placeholder="Notas (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 rounded-lg py-3 text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={
                    saving ||
                    !title.trim() ||
                    selectedMinors.length === 0 ||
                    !startTime ||
                    !allEndTimesFilled() ||
                    (activityType === 'recurring' && selectedDays.length === 0) ||
                    (activityType === 'unique' && !date)
                  }
                  className="flex-1 bg-blue-600 text-white rounded-lg py-3 text-sm font-medium disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
