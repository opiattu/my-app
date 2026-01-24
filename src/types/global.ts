// Добавьте или обновите интерфейсы:

export interface Booking {
  id: string;
  resourceId: string;          // ID аудитории или инвентаря
  resourceType: 'room' | 'asset'; // Тип ресурса
  resourceName?: string;       // Название ресурса (опционально)
  start: Date;                // Начало бронирования
  end: Date;                  // Конец бронирования
  organizer: string;          // Организатор
  title: string;              // Название мероприятия
  description?: string;       // Описание (вместо note)
  status?: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: Date;
}

// Для формы бронирования:
export interface NewBookingPayload {
  resourceId: string;
  resourceType: 'room' | 'asset';
  start: Date;
  end: Date;
  organizer: string;
  title: string;
  description?: string;
}

// Альтернативно, если хотите сохранить старые поля:
export interface BookingFormData {
  roomCode?: string;          // Устаревшее, лучше использовать resourceId
  roomName?: string;          // Устаревшее
  date?: Date;
  startTime?: string;
  endTime?: string;
  organizer: string;
  note?: string;
  resourceId: string;
  resourceType: 'room' | 'asset';
  title: string;
}

// Или объедините:
export type BookingInput = Partial<NewBookingPayload> & {
  date?: Date;
  startTime?: string;
  endTime?: string;
  note?: string;
};

