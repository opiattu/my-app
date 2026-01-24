import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Room {
  id: string;
  name: string;
  capacity: number;
  features: string[];
  status: 'available' | 'booked' | 'maintenance';
}

interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  organizer: string;
  description: string;
  createdAt: string; // Изменено с Date на string
}

interface BookingContextType {
  bookings: Booking[];
  rooms: Room[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  deleteBooking: (id: string) => void;
  getAvailableRooms: (date?: string, time?: string) => Room[];
  getBookedRooms: () => Room[];
  getMaintenanceRooms: () => Room[];
  getRoomById: (id: string) => Room | undefined;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within BookingProvider');
  }
  return context;
};

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  // Инициализация аудиторий
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: '1',
      name: 'Аудитория 101',
      capacity: 30,
      features: ['проектор', 'wi-fi', 'кондиционер'],
      status: 'available'
    },
    {
      id: '2', 
      name: 'Аудитория 205',
      capacity: 50,
      features: ['интерактивная доска', 'wi-fi', 'микрофон'],
      status: 'available'
    },
    {
      id: '3',
      name: 'Аудитория 310',
      capacity: 20,
      features: ['проектор', 'wi-fi'],
      status: 'available'
    },
    {
      id: '4',
      name: 'Конференц-зал',
      capacity: 100,
      features: ['проектор', 'wi-fi', 'кондиционер', 'микрофон', 'система видеоконференцсвязи'],
      status: 'available'
    },
    {
      id: '5',
      name: 'Аудитория 412',
      capacity: 40,
      features: ['проектор', 'интерактивная доска'],
      status: 'booked'
    },
    {
      id: '6',
      name: 'Лекторий А',
      capacity: 150,
      features: ['проектор', 'wi-fi', 'кондиционер', 'микрофон', 'система звукоусиления'],
      status: 'maintenance'
    }
  ]);

  // Инициализация бронирований - createdAt как строка
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      roomId: '5',
      roomName: 'Аудитория 412',
      date: '2026-01-25',
      time: '10:00',
      organizer: 'Иванов И.И.',
      description: 'Совещание отдела разработки',
      createdAt: '2026-01-24',
    },
    {
      id: '2',
      roomId: '2',
      roomName: 'Аудитория 205',
      date: '2026-01-26',
      time: '14:00',
      organizer: 'Петрова А.С.',
      description: 'Презентация нового проекта',
      createdAt: '2026-01-23',
    },
  ]);

  // Получение доступных аудиторий
  const getAvailableRooms = (date?: string, time?: string): Room[] => {
    // Базовая фильтрация по статусу
    let availableRooms = rooms.filter(room => room.status === 'available');
    
    // Дополнительная проверка по дате/времени (можно расширить)
    if (date && time) {
      const conflictingBookings = bookings.filter(
        booking => booking.date === date && booking.time === time
      );
      
      availableRooms = availableRooms.filter(
        room => !conflictingBookings.some(booking => booking.roomId === room.id)
      );
    }
    
    return availableRooms;
  };

  // Получение забронированных аудиторий
  const getBookedRooms = (): Room[] => {
    return rooms.filter(room => room.status === 'booked');
  };

  // Получение аудиторий на обслуживании
  const getMaintenanceRooms = (): Room[] => {
    return rooms.filter(room => room.status === 'maintenance');
  };

  // Поиск аудитории по ID
  const getRoomById = (id: string): Room | undefined => {
    return rooms.find(room => room.id === id);
  };

  // Добавление нового бронирования
  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    // Проверка на дублирование
    const isDuplicate = bookings.some(b => 
      b.roomId === bookingData.roomId &&
      b.date === bookingData.date &&
      b.time === bookingData.time
    );
    
    if (isDuplicate) {
      throw new Error('На это время уже есть бронирование для выбранной аудитории!');
    }
    
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      createdAt: new Date().toLocaleDateString('ru-RU')
    };
    
    // Обновляем статус комнаты
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === bookingData.roomId ? { ...room, status: 'booked' } : room
      )
    );
    
    setBookings([...bookings, newBooking]);
  };

  // Удаление бронирования
  const deleteBooking = (id: string) => {
    const bookingToDelete = bookings.find(booking => booking.id === id);
    
    if (bookingToDelete) {
      // Возвращаем аудиторию в статус "доступна"
      setRooms(prevRooms =>
        prevRooms.map(room =>
          room.id === bookingToDelete.roomId ? { ...room, status: 'available' } : room
        )
      );
    }
    
    setBookings(prev => prev.filter(booking => booking.id !== id));
  };

  const value: BookingContextType = {
    bookings,
    rooms,
    addBooking,
    deleteBooking,
    getAvailableRooms,
    getBookedRooms,
    getMaintenanceRooms,
    getRoomById
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};