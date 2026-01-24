import { format, parseISO, formatISO } from 'date-fns';

export function toUTCString(date: Date): string {
  return formatISO(date);
}

export function fromUTCString(utcString: string): Date {
  return parseISO(utcString);
}

export function toLocalString(date: Date): string {
  return format(date, 'dd.MM.yyyy HH:mm');
}

export function fromLocalString(localString: string): Date {
  // Преобразование из локального времени в UTC
  // В реальном приложении здесь нужна более сложная логика
  return new Date(localString);
}