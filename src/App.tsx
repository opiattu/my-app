import React, { useState } from 'react';
import styles from './App.module.css';
import BookingsTable from './components/BookingsTable/BookingsTable';
import BookingForm from './components/BookingForm/BookingForm';
import AvailableRooms from './components/AvailableRooms/AvailableRooms';
import { useBookings } from './context/BookingContext';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'bookings' | 'settings'>('catalog');
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  const { 
    bookings,
    rooms,
    addBooking,
    deleteBooking
  } = useBookings();

  // Вычисляем статистику локально на основе доступных данных
  const availableRooms = rooms; // Все комнаты доступны по умолчанию
  const bookedRooms = rooms.filter(room => 
    bookings.some(booking => booking.roomId === room.id)
  );
  const maintenanceRooms = []; // Пустой массив, если нет данных об обслуживании
  const totalRooms = rooms.length;

  const handleCreateBooking = () => {
    setShowBookingForm(true);
  };

  const handleCloseForm = () => {
    setShowBookingForm(false);
  };

  const handleSubmitBooking = (data: any) => {
    try {
      addBooking(data);
      alert(`Бронирование создано!\nАудитория: ${data.roomName}\nДата: ${data.date}\nВремя: ${data.time}`);
      setShowBookingForm(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ошибка при создании бронирования');
    }
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.appHeader}>
        <div className={styles.appLogo}>
          <div className={styles.logoIcon}>RB</div>
          <h1 className={styles.appTitle}>Room Booking</h1>
        </div>
        
        <nav className={styles.appNav}>
          <button 
            className={`${styles.navBtn} ${activeTab === 'catalog' ? styles.active : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            Каталог аудиторий
          </button>
          <button 
            className={`${styles.navBtn} ${activeTab === 'bookings' ? styles.active : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Управление бронированием
          </button>
          <button 
            className={`${styles.navBtn} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Настройки
          </button>
        </nav>
        
        <div className={styles.headerRight}>
          <button className={styles.notificationBtn}></button>
          <div className={styles.userAvatar}>ИИ</div>
        </div>
      </header>

      <main className={styles.mainContent}>
        {activeTab === 'catalog' && (
          <>
            <h1 className={styles.pageTitle}>Каталог аудиторий</h1>
            <p className={styles.pageSubtitle}>Доступность аудиторий и оборудование.</p>
            
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{availableRooms.length}</div>
                <div className={styles.statLabel}>Доступны</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{bookedRooms.length}</div>
                <div className={styles.statLabel}>Забронированы</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{maintenanceRooms.length}</div>
                <div className={styles.statLabel}>Обслуживание</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{totalRooms}</div>
                <div className={styles.statLabel}>Всего</div>
              </div>
            </div>
            
            <div className={styles.actionButtons}>
              <button 
                className={styles.primaryBtn}
                onClick={handleCreateBooking}
              >
                <span>+</span> Создать бронирование
              </button>
              <button 
                className={styles.secondaryBtn}
                onClick={() => window.location.reload()}
              >
                Обновить
              </button>
            </div>
            
            <AvailableRooms />
          </>
        )}

        {activeTab === 'bookings' && (
          <>
            <h1 className={styles.pageTitle}>Управление бронированием</h1>
            <p className={styles.pageSubtitle}>Просмотр и управление бронированиями.</p>
            <BookingsTable 
              bookings={bookings}
              deleteBooking={deleteBooking}
            />
          </>
        )}

        {activeTab === 'settings' && (
          <>
            <h1 className={styles.pageTitle}>Настройки</h1>
            <p className={styles.pageSubtitle}>Настройки системы.</p>
            <div className={styles.noData}>
              Раздел в разработке
            </div>
          </>
        )}

        {showBookingForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <BookingForm 
                onClose={handleCloseForm}
                onSubmit={handleSubmitBooking}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;