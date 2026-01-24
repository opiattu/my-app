import React from 'react';
import { useBookings } from '../../context/BookingContext';
import styles from './AvailableRooms.module.css';

const AvailableRooms: React.FC = () => {
  const { getAvailableRooms, getBookedRooms, getMaintenanceRooms } = useBookings();
  
  const availableRooms = getAvailableRooms();
  const bookedRooms = getBookedRooms();
  const maintenanceRooms = getMaintenanceRooms();

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>
        Доступные аудитории для бронирования
      </h3>
      
      <div className={styles.statsContainer}>
        <div className={`${styles.statCard} ${styles.statAvailable}`}>
          <div className={`${styles.statNumber} ${styles.statNumberAvailable}`}>
            {availableRooms.length}
          </div>
          <div className={`${styles.statLabel} ${styles.statLabelAvailable}`}>
            Доступны
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statBooked}`}>
          <div className={`${styles.statNumber} ${styles.statNumberBooked}`}>
            {bookedRooms.length}
          </div>
          <div className={`${styles.statLabel} ${styles.statLabelBooked}`}>
            Забронированы
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statMaintenance}`}>
          <div className={`${styles.statNumber} ${styles.statNumberMaintenance}`}>
            {maintenanceRooms.length}
          </div>
          <div className={`${styles.statLabel} ${styles.statLabelMaintenance}`}>
            Обслуживание
          </div>
        </div>
      </div>

      <div>
        <h4 className={styles.subtitle}>
          Список доступных аудиторий ({availableRooms.length}):
        </h4>
        
        {availableRooms.length === 0 ? (
          <div className={styles.noRooms}>
            <p>Нет доступных аудиторий</p>
            <p>Попробуйте выбрать другую дату или время</p>
          </div>
        ) : (
          <div className={styles.roomsGrid}>
            {availableRooms.map(room => (
              <div key={room.id} className={styles.roomCard}>
                <div className={styles.roomInfo}>
                  <h5 className={styles.roomName}>{room.name}</h5>
                  <p className={styles.roomCapacity}>
                    Вместимость: {room.capacity} чел.
                  </p>
                  <div className={styles.featuresList}>
                    {room.features.map((feature, index) => (
                      <span key={index} className={styles.featureTag}>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`${styles.statusBadge} ${styles.statusAvailable}`}>
                  Доступна
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableRooms;