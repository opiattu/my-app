import React, { useState, useEffect } from 'react';
import { useBookings } from '../../context/BookingContext';
import styles from './BookingForm.module.css';

interface BookingFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ onClose, onSubmit }) => {
  const { getAvailableRooms, rooms, addBooking, bookings } = useBookings();
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const [formData, setFormData] = useState({
    roomId: '',
    roomName: '',
    date: '',
    time: '',
    organizer: '',
    description: ''
  });

  useEffect(() => {
    try {
      const available = getAvailableRooms ? getAvailableRooms() : rooms;
      setAvailableRooms(available);
      
      if (available.length > 0 && !formData.roomId) {
        const firstRoom = available[0];
        setSelectedRoom(firstRoom);
        setFormData(prev => ({ 
          ...prev, 
          roomId: firstRoom.id,
          roomName: firstRoom.name
        }));
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
      setAvailableRooms(rooms);
    }
  }, []);

  // Функция проверки бронирования
  const validateBooking = (bookings: any[], newBooking: any): string | null => {
    // Проверка на дублирование
    const isDuplicate = bookings.some(booking => 
      booking.roomId === newBooking.roomId &&
      booking.date === newBooking.date &&
      booking.time === newBooking.time
    );
    
    if (isDuplicate) {
      return 'На это время и дату уже есть бронирование для выбранной аудитории!';
    }
    
    // Проверка на прошедшую дату
    const today = new Date().toISOString().split('T')[0];
    if (newBooking.date < today) {
      return 'Нельзя создать бронирование на прошедшую дату!';
    }
    
    return null;
  };

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roomId = e.target.value;
    const room = rooms.find(r => r.id === roomId);
    
    if (room) {
      setSelectedRoom(room);
      setFormData(prev => ({ 
        ...prev, 
        roomId: room.id,
        roomName: room.name
      }));
    }
    setErrorMessage('');
  };

  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, date }));
    setErrorMessage('');
  };

  const handleTimeChange = (time: string) => {
    setFormData(prev => ({ ...prev, time }));
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Проверка обязательных полей
    if (!formData.roomId || !formData.date || !formData.time || !formData.organizer) {
      setErrorMessage('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    // Валидация бронирования
    const validationError = validateBooking(bookings || [], formData);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    
    // Если все ок, создаем бронирование
    try {
      addBooking(formData);
      onSubmit(formData);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Произошла ошибка при создании бронирования');
    }
  };

  // Функция для проверки доступности времени
  const isTimeSlotAvailable = () => {
    if (!formData.roomId || !formData.date || !formData.time) return true;
    
    const currentBookings = bookings || [];
    return !currentBookings.some(booking => 
      booking.roomId === formData.roomId &&
      booking.date === formData.date &&
      booking.time === formData.time
    );
  };

  // Получаем список занятых времен для выбранной аудитории и даты
  const getBookedTimes = () => {
    if (!formData.roomId || !formData.date) return [];
    
    const currentBookings = bookings || [];
    return currentBookings
      .filter(booking => 
        booking.roomId === formData.roomId && 
        booking.date === formData.date
      )
      .map(booking => booking.time)
      .sort();
  };

  const bookedTimes = getBookedTimes();
  const isAvailable = isTimeSlotAvailable();

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Новое бронирование</h2>
      
      {/* Показываем сообщение об ошибке */}
      {errorMessage && (
        <div className={styles.errorAlert}>
          ⚠️ {errorMessage}
        </div>
      )}
      
      {/* Показываем предупреждение если время занято */}
      {!isAvailable && formData.roomId && formData.date && formData.time && (
        <div className={styles.warningAlert}>
          ⚠️ Это время уже занято! Выберите другое время.
        </div>
      )}
      
      {/* Показываем список занятых времен */}
      {bookedTimes.length > 0 && formData.roomId && formData.date && (
        <div className={styles.bookedTimes}>
          <p><strong>Занятые времена на {formData.date}:</strong></p>
          <div className={styles.timeChips}>
            {bookedTimes.map(time => (
              <span key={time} className={`${styles.timeChip} ${formData.time === time ? styles.timeChipSelected : ''}`}>
                {time}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Выберите аудиторию *</label>
        <select
          value={formData.roomId}
          onChange={handleRoomChange}
          required
          className={styles.select}
        >
          <option value="">-- Выберите аудиторию --</option>
          {availableRooms.map(room => (
            <option key={room.id} value={room.id}>
              {room.name} ({room.capacity} чел.)
            </option>
          ))}
        </select>
        
        {selectedRoom && (
          <div className={styles.roomDetails}>
            <p><strong>Выбрана:</strong> {selectedRoom.name}</p>
            <p><strong>Вместимость:</strong> {selectedRoom.capacity} человек</p>
            <p><strong>Оборудование:</strong> {selectedRoom.features?.join(', ') || 'Нет'}</p>
          </div>
        )}
        
        {availableRooms.length === 0 && (
          <p className={styles.errorMessage}>
            На данный момент нет доступных аудиторий для бронирования.
          </p>
        )}
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Дата *</label>
          <input 
            type="date" 
            value={formData.date}
            onChange={(e) => handleDateChange(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Время *</label>
          <input 
            type="time" 
            value={formData.time}
            onChange={(e) => handleTimeChange(e.target.value)}
            required
            className={`${styles.input} ${!isAvailable ? styles.inputError : ''}`}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Организатор *</label>
        <input 
          type="text" 
          value={formData.organizer}
          onChange={(e) => setFormData({...formData, organizer: e.target.value})}
          required
          placeholder="ФИО организатора"
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Описание мероприятия</label>
        <textarea 
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
          placeholder="Опишите цель мероприятия..."
          className={styles.textarea}
        />
      </div>

      <div className={styles.buttons}>
        <button 
          type="button" 
          onClick={onClose}
          className={styles.cancelBtn}
        >
          Отмена
        </button>
        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={availableRooms.length === 0 || !isAvailable}
        >
          Создать бронирование
        </button>
      </div>
    </form>
  );
};

export default BookingForm;