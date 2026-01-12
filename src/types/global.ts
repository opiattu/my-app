
export interface Room {
  id: string;
  code: string;
  name: string;
  capacity: number;
  equipment: string[];
  status: RoomStatus;
}

export type RoomStatus = 'available' | 'booked' | 'maintenance';

export interface RoomFormPayload {
  code: string;
  name: string;
  capacity: number;
  equipment: string[];
  status: RoomStatus;
}

export interface Booking {
  id: string;
  roomCode: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  organizer: string;
  note?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface NewBookingPayload {
  roomCode: string;
  roomName?: string;
  date: string;
  startTime: string;
  endTime: string;
  status?: BookingStatus;
  organizer: string;
  note?: string;
}