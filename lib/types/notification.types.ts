export type NotificationType =
  | 'dropoff_assigned'
  | 'dropoff_released'
  | 'dropoff_done'
  | 'pickup_assigned'
  | 'pickup_released'
  | 'pickup_done';

export interface Notification {
  id: string;
  toUserId: string;
  fromUserId: string;
  eventId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: Date;
  eventDate: string;
}