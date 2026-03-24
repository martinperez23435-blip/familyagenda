export type EventType = 'recurring_instance' | 'unique' | 'exception';
export type AssignmentStatus = 'pending' | 'assigned' | 'done' | 'released';

export interface Assignment {
  assignedTo: string | null;
  assignedAt: Date | null;
  status: AssignmentStatus;
  doneAt: Date | null;
}

export interface CalendarEvent {
  id: string;
  templateId: string | null;
  title: string;
  type: EventType;
  minorIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string | null;
  isActive: boolean;
  isCancelled: boolean;
  createdAt: Date;
  createdBy: string;
  dropoff: Assignment;
  pickup: Assignment;
}

export interface ActivityTemplate {
  id: string;
  title: string;
  minorIds: string[];
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  startTime: string;
  endTime: string;
  location: string;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  validFrom: Date;
  validUntil: Date | null;
}