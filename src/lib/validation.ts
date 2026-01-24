import { Booking, Conflict } from '../types/global';
import { format, parseISO, isBefore, isAfter, addMinutes, addHours } from 'date-fns';

export function validateBooking(booking: Omit<Booking, 'id'>): string | null {
  if (!booking.title?.trim()) {
    return 'Заголовок обязателен';
  }
  
  if (!booking.resourceType || !booking.resourceId) {
    return 'Не выбран ресурс';
  }
  
  const start = parseISO(booking.start);
  const end = parseISO(booking.end);
  
  if (!start || !end) {
    return 'Некорректный формат времени';
  }
  
  if (isAfter(start, end)) {
    return 'Время начала должно быть раньше времени окончания';
  }
  
  return null;
}

export function checkConflicts(
  newBooking: Omit<Booking, 'id'>,
  existingBookings: Booking[],
  excludeId?: string
): Conflict[] {
  const conflicts: Conflict[] = [];
  const newStart = parseISO(newBooking.start);
  const newEnd = parseISO(newBooking.end);
  
  for (const existing of existingBookings) {
    if (excludeId && existing.id === excludeId) continue;
    
    if (existing.resourceId !== newBooking.resourceId) continue;
    
    const existingStart = parseISO(existing.start);
    const existingEnd = parseISO(existing.end);
    
    // Проверка пересечения: new.start < existing.end && new.end > existing.start
    if (isBefore(newStart, existingEnd) && isAfter(newEnd, existingStart)) {
      conflicts.push({
        type: 'time',
        message: `Пересечение с бронированием "${existing.title}" (${format(existingStart, 'dd.MM.yyyy HH:mm')} - ${format(existingEnd, 'dd.MM.yyyy HH:mm')})`,
        booking: existing
      });
    }
  }
  
  return conflicts;
}

export function findAlternativeSlots(
  resourceBookings: Booking[],
  desiredStart: Date,
  desiredEnd: Date,
  durationMinutes: number
): { start: Date; end: Date }[] {
  const slots: { start: Date; end: Date }[] = [];
  
  // Сортируем бронирования по времени начала
  const sortedBookings = [...resourceBookings].sort((a, b) => 
    parseISO(a.start).getTime() - parseISO(b.start).getTime()
  );
  
  let currentTime = desiredStart;
  
  for (const booking of sortedBookings) {
    const bookingStart = parseISO(booking.start);
    const bookingEnd = parseISO(booking.end);
    
    // Проверяем есть ли окно перед текущим бронированием
    const windowStart = currentTime;
    const windowEnd = bookingStart;
    
    if (isBefore(addMinutes(windowStart, durationMinutes), windowEnd)) {
      slots.push({
        start: windowStart,
        end: addMinutes(windowStart, durationMinutes)
      });
    }
    
    currentTime = isAfter(bookingEnd, currentTime) ? bookingEnd : currentTime;
  }
  
  // Проверяем окно после всех бронирований
  const lastSlotStart = currentTime;
  if (isBefore(addMinutes(lastSlotStart, durationMinutes), addHours(desiredStart, 24))) {
    slots.push({
      start: lastSlotStart,
      end: addMinutes(lastSlotStart, durationMinutes)
    });
  }
  
  return slots.slice(0, 3); // Возвращаем не более 3 альтернатив
}

export const validateBooking = (bookings: Booking[], newBooking: Booking): string | null => {
  // Проверка на дублирование
  const isDuplicate = bookings.some(booking => 
    booking.roomName === newBooking.roomName &&
    booking.date === newBooking.date &&
    booking.time === newBooking.time
  );
  
  if (isDuplicate) {
    return 'На это время и дату уже есть бронирование!';
  }
  
  // Добавьте другие проверки при необходимости
  return null;
};