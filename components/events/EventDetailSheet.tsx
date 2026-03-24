'use client';

import { CalendarEvent } from '@/lib/types/event.types';
import { Minor } from '@/lib/types/minor.types';
import { User } from '@/lib/types/user.types';
import AssignmentSection from './AssignmentSection';

interface Props {
  event: CalendarEvent;
  minors: Minor[];
  users: User[];
  currentUser: User;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EventDetailSheet({ event, minors, users, currentUser, onClose, onUpdate }: Props) {
  const isReadOnly = currentUser.role === 'minor';
  const pickup = event.pickup as any;

  function getMinorName(id: string) {
    return minors.find((m) => m.id === id)?.name ?? id;
  }

  function getMinorColor(id: string) {
    return minors.find((m) => m.id === id)?.color ?? '#ccc';
  }

  function getUserName(id: string) {
    return users.find((u) => u.id === id)?.displayName ?? 'Alguien';
  }

  // Check if all minors have the same pickup endTime
  const endTimes = event.minorIds.map((id) => pickup[id]?.endTime ?? event.endTime);
  const allSameEndTime = endTimes.every((t) => t === endTimes[0]);
  const showSinglePickup = allSameEndTime || event.minorIds.length === 1;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
            <p className="text-gray-500 text-sm mt-1">{event.startTime}</p>
            {event.location && <p className="text-gray-400 text-sm">📍 {event.location}</p>}
          </div>
          <div className="flex gap-2">
            {event.minorIds.map((id) => (
              <div key={id} className="flex flex-col items-center gap-0.5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: getMinorColor(id) }}
                >
                  {getMinorName(id)[0]}
                </div>
                <span className="text-xs text-gray-500">{getMinorName(id)}</span>
              </div>
            ))}
          </div>
        </div>

        {event.notes && (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3 mb-5">
            📝 {event.notes}
          </p>
        )}

        <div className="border-t border-gray-100 mb-5" />

        <div className="flex flex-col gap-5">
          {/* Llevar — único para todos */}
          <AssignmentSection
            event={event}
            type="dropoff"
            currentUserId={currentUser.id}
            currentUserName={currentUser.displayName}
            getUserName={getUserName}
            onUpdate={onUpdate}
            isReadOnly={isReadOnly}
          />

          {/* Retirar — uno solo si mismo horario, uno por menor si horarios distintos */}
          {showSinglePickup ? (
            <AssignmentSection
              event={event}
              type="pickup"
              minorId={event.minorIds[0]}
              currentUserId={currentUser.id}
              currentUserName={currentUser.displayName}
              getUserName={getUserName}
              onUpdate={onUpdate}
              isReadOnly={isReadOnly}
            />
          ) : (
            event.minorIds.map((minorId) => (
              <AssignmentSection
                key={minorId}
                event={event}
                type="pickup"
                minorId={minorId}
                minorName={getMinorName(minorId)}
                currentUserId={currentUser.id}
                currentUserName={currentUser.displayName}
                getUserName={getUserName}
                onUpdate={onUpdate}
                isReadOnly={isReadOnly}
              />
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full border border-gray-200 rounded-xl py-3 text-sm text-gray-500 font-medium"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
