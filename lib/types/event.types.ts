export type EventType = 'recurring_instance' | 'unique' | 'exception';
export type AssignmentStatus = 'pending' | 'assigned' | 'done' | 'released';

export interface Assignment {
  assignedTo: string | null;
  assignedAt: Date | null;
  status: AssignmentStatus;
  doneAt: Date | null;
}

// pickup por menor: { [minorId]: Assignment & { endTime: string } }
export interface PickupByMinor {
  [minorId: string]: Assignment & { endTime: string };
}

export interface CalendarEvent {
  id: string;
  templateId: string | null;
  title: string;
  type: EventType;
  minorIds: string[];
  date: string;
  startTime: string;
  endTime: string;          // hora de salida del último menor (para referencia)
  location: string;
  notes: string | null;
  isActive: boolean;
  isCancelled: boolean;
  createdAt: Date;
  createdBy: string;
  dropoff: Assignment;
  pickup: PickupByMinor;    // un pickup por menor
}

export interface ActivityTemplate {
  id: string;
  title: string;
  minorIds: string[];
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  startTime: string;
  endTime: string;          // hora de salida del último menor
  endTimes?: { [minorId: string]: string }; // hora de salida por menor (opcional)
  location: string;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  validFrom: Date;
  validUntil: Date | null;
}
