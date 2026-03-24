'use client';

import { useState } from 'react';
import { CalendarEvent } from '@/lib/types/event.types';
import { takeAssignment, releaseAssignment, markDone } from '@/lib/services/assignmentService';

interface Props {
  event: CalendarEvent;
  type: 'dropoff' | 'pickup';
  minorId?: string;         // solo para pickup
  minorName?: string;       // solo para pickup
  currentUserId: string;
  currentUserName: string;
  getUserName: (id: string) => string;
  onUpdate: () => void;
  isReadOnly?: boolean;
}

export default function AssignmentSection({
  event, type, minorId, minorName, currentUserId, currentUserName, getUserName, onUpdate, isReadOnly = false
}: Props) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Get assignment — for pickup it's per minor
  const assignment = type === 'pickup' && minorId
    ? (event.pickup as any)[minorId]
    : type === 'dropoff'
    ? event.dropoff
    : null;

  if (!assignment) return null;

  const isMe = assignment.assignedTo === currentUserId;
  const emoji = type === 'dropoff' ? '🚗' : '🏠';
  const label = type === 'dropoff'
    ? 'Llevar'
    : `Retirar a ${minorName}${assignment.endTime ? ` (${assignment.endTime})` : ''}`;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleTake() {
    setLoading(true);
    const result = await takeAssignment(event.id, event.title, event.date, type, currentUserId, currentUserName, minorId);
    if (result.success) onUpdate();
    else showToast(result.error === 'Ya fue asignado' ? 'Ya alguien lo tomó' : 'Error al asignar');
    setLoading(false);
  }

  async function handleRelease() {
    setLoading(true);
    const result = await releaseAssignment(event.id, event.title, event.date, type, currentUserId, currentUserName, minorId);
    if (result.success) onUpdate();
    else showToast('Error al liberar');
    setLoading(false);
  }

  async function handleDone() {
    setLoading(true);
    const result = await markDone(event.id, event.title, event.date, type, currentUserId, currentUserName, minorId);
    if (result.success) onUpdate();
    else showToast('Error al marcar como hecho');
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        {emoji} {label}
      </p>

      {isReadOnly && (
        <div className={`rounded-xl py-2.5 px-3 text-sm font-medium ${
          assignment.status === 'done' ? 'bg-green-50 text-green-700' :
          assignment.status === 'assigned' ? 'bg-blue-50 text-blue-700' :
          'bg-gray-50 text-gray-400'
        }`}>
          {assignment.status === 'done' && `✓ ${getUserName(assignment.assignedTo!)}`}
          {assignment.status === 'assigned' && `👤 ${getUserName(assignment.assignedTo!)}`}
          {assignment.status === 'pending' && 'Sin asignar'}
        </div>
      )}

      {!isReadOnly && (
        <>
          {assignment.status === 'pending' && (
            <button onClick={handleTake} disabled={loading}
              className="bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50">
              {loading ? 'Procesando...' : `Yo lo ${type === 'dropoff' ? 'llevo' : 'retiro'}`}
            </button>
          )}
          {assignment.status === 'assigned' && isMe && (
            <div className="flex gap-2">
              <button onClick={handleRelease} disabled={loading}
                className="flex-1 border border-red-300 text-red-500 rounded-xl py-2.5 text-sm font-medium disabled:opacity-50">
                No podré
              </button>
              <button onClick={handleDone} disabled={loading}
                className="flex-1 bg-green-600 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50">
                Ya lo hice ✓
              </button>
            </div>
          )}
          {assignment.status === 'assigned' && !isMe && (
            <div className="bg-blue-50 rounded-xl py-2.5 px-3 text-sm text-blue-700 font-medium">
              👤 {getUserName(assignment.assignedTo!)}
            </div>
          )}
          {assignment.status === 'done' && (
            <div className="bg-green-50 rounded-xl py-2.5 px-3 text-sm text-green-700 font-medium">
              ✓ {getUserName(assignment.assignedTo!)}
            </div>
          )}
        </>
      )}

      {toast && <p className="text-xs text-red-500 text-center">{toast}</p>}
    </div>
  );
}
