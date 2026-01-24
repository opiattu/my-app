export const isSlotAvailable = (bookings: Booking[], roomName: string, date: string, time: string): boolean => {
  return !bookings.some(booking => 
    booking.roomName === roomName &&
    booking.date === date &&
    booking.time === time
  );
};

export const getAvailableTimes = (bookings: Booking[], roomName: string, date: string, allTimes: string[]): string[] => {
  return allTimes.filter(time => 
    isSlotAvailable(bookings, roomName, date, time)
  );
};