import React from "react";
import type { Booking } from "../../types/global";

interface BookingsScheduleProps {
  bookings: Booking[];
}

export const BookingsSchedule: React.FC<BookingsScheduleProps> = ({ bookings }) => {
  return (
    <div>
      <h3>Расписание бронирований</h3>
      {bookings.length === 0 ? (
        <p>Нет бронирований</p>
      ) : (
        <ul>
          {bookings.map(booking => (
            <li key={booking.id}>
              {booking.roomName} - {booking.date} {booking.startTime}-{booking.endTime}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
