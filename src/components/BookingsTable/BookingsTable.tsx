import React from 'react';
import styles from './BookingsTable.module.css';

interface Booking {
  id: string;
  roomName: string;
  date: string;
  time: string;
  organizer: string;
  description?: string;
  createdAt: string;
}

interface BookingsTableProps {
  bookings: Booking[];
  deleteBooking: (id: string) => void;
}

const BookingsTable: React.FC<BookingsTableProps> = ({ bookings, deleteBooking }) => {
  const handleDelete = (id: string, roomName: string) => {
    if (window.confirm(`Удалить бронирование аудитории "${roomName}"?`)) {
      deleteBooking(id);
    }
  };

  if (bookings.length === 0) {
    return (
      <div className={styles.noData}>
        Нет активных бронирований
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.tableHeader}>
          <tr>
            <th className={styles.tableHeaderCell}>Аудитория</th>
            <th className={styles.tableHeaderCell}>Дата</th>
            <th className={styles.tableHeaderCell}>Время</th>
            <th className={styles.tableHeaderCell}>Организатор</th>
            <th className={styles.tableHeaderCell}>Описание</th>
            <th className={styles.tableHeaderCell}>Создано</th>
            <th className={styles.tableHeaderCell}>Действия</th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {bookings.map((booking) => (
            <tr key={booking.id} className={styles.tableRow}>
              <td className={styles.tableCell}>{booking.roomName}</td>
              <td className={styles.tableCell}>{booking.date}</td>
              <td className={styles.tableCell}>{booking.time}</td>
              <td className={styles.tableCell}>{booking.organizer}</td>
              <td className={styles.tableCell}>{booking.description || '-'}</td>
              <td className={styles.tableCell}>{booking.createdAt}</td>
              <td className={styles.tableCell}>
                <button 
                  onClick={() => handleDelete(booking.id, booking.roomName)}
                  className={styles.deleteButton}
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingsTable;
