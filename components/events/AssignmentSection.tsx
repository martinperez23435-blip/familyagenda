'use client';

import { useState } from 'react';
import { CalendarEvent } from '@/lib/types/event.types';
import { takeAssignment, releaseAssignment, markDone } from '@/lib/services/assignmentService';

interface Props {
  event: CalendarEvent;
  type: 'dropoff' | 'pickup';
  currentUserId: string;
  getUserName: (id: string) => string;
  onUpdate: () => void;
}

export default function AssignmentSection({ event, type, currentUserId, getUserName, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const assignment = event[type];
  const isMe = assignment.assignedTo === currentUserId;
  const label = type === 'dropoff' ? 'Llevar' : 'Retirar';
  const emoji = type === 'dropoff' ? '🚗' : '🏠';

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleTake() {
    setLoading(true);
    const result = await takeAssignment(event.id, type, currentUserId);
    if (result.success) {
      onUpdate();
    } else {
      showToast(result.error === 'Ya fue asignado' ? 'Ya alguien lo tomó' : 'Error al asignar');
    }
    setLoading(false);
  }

  async function handleRelease() {
    setLoading(true);
    const result = await releaseAssignment(event.id, type, currentUserId);
    if (result.success) {
      onUpdate();
    } else {
      showToast('Error al liberar');
    }
    setLoading(false);
  }

  async function handleDone() {
    setLoading(true);
    const result = await markDone(event.id, type, currentUserId);
    if (result.success) {
      onUpdate();
    } else {
      showToast('Error al marcar como hecho');
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        {emoji} {label}
      </p>

      {assignment.status === 'pending' && (
        <button
          onClick={handleTake}
          disabled={loading}
          className="bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50 active:scale-95 transition-transform"
        >
          {loading ? 'Procesando...' : `Yo lo ${type === 'dropoff' ? 'llevo' : 'retiro'}`}
        </button>
      )}

      {assignment.status === 'assigned' && isMe && (
        <div className="flex gap-2">
          <button
            onClick={handleRelease}
            disabled={loading}
            className="flex-1 border border-red-300 text-red-500 rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
          >
            No podré
          </button>
          <button
            onClick={handleDone}
            disabled={loading}
            className="flex-1 bg-green-600 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
          >
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

      {toast && (
        <p className="text-xs text-red-500 text-center">{toast}</p>
      )}
    </div>
  );
}
