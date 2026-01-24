import { Room, Asset, Booking, ImportExportData } from '../types/global';

const DB_NAME = 'RoomAssetsDB';
const DB_VERSION = 2;

class StorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('rooms')) {
          const roomStore = db.createObjectStore('rooms', { keyPath: 'id' });
          roomStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('assets')) {
          const assetStore = db.createObjectStore('assets', { keyPath: 'id' });
          assetStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('bookings')) {
          const bookingStore = db.createObjectStore('bookings', { keyPath: 'id' });
          bookingStore.createIndex('resourceId', 'resourceId', { unique: false });
          bookingStore.createIndex('start', 'start', { unique: false });
          bookingStore.createIndex('end', 'end', { unique: false });
        }
      };
    });
  }

  async saveRoom(room: Room): Promise<void> {
    return this.transaction('rooms', 'readwrite', (store) => store.put(room));
  }

  async getRooms(): Promise<Room[]> {
    return this.getAll('rooms');
  }

  async deleteRoom(id: string): Promise<void> {
    return this.transaction('rooms', 'readwrite', (store) => store.delete(id));
  }

  // Asset operations
  async saveAsset(asset: Asset): Promise<void> {
    return this.transaction('assets', 'readwrite', (store) => store.put(asset));
  }

  async getAssets(): Promise<Asset[]> {
    return this.getAll('assets');
  }

  async deleteAsset(id: string): Promise<void> {
    return this.transaction('assets', 'readwrite', (store) => store.delete(id));
  }

  // Booking operations
  async saveBooking(booking: Booking): Promise<void> {
    return this.transaction('bookings', 'readwrite', (store) => store.put(booking));
  }

  async getBookings(): Promise<Booking[]> {
    return this.getAll('bookings');
  }

  async deleteBooking(id: string): Promise<void> {
    return this.transaction('bookings', 'readwrite', (store) => store.delete(id));
  }

  async getBookingsByResource(resourceId: string): Promise<Booking[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database not initialized');
      
      const transaction = this.db.transaction(['bookings'], 'readonly');
      const store = transaction.objectStore('bookings');
      const index = store.index('resourceId');
      const request = index.getAll(resourceId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async exportData(): Promise<ImportExportData> {
    const [rooms, assets, bookings] = await Promise.all([
      this.getRooms(),
      this.getAssets(),
      this.getBookings()
    ]);

    return {
      rooms,
      assets,
      bookings,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }
    };
  }

  async importData(data: ImportExportData, replace: boolean = false): Promise<void> {
    if (replace) {
      await this.clearAll();
    }

    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction(['rooms', 'assets', 'bookings'], 'readwrite');
    
    const roomPromises = data.rooms.map(room => 
      tx.objectStore('rooms').put(room)
    );
    
    const assetPromises = data.assets.map(asset => 
      tx.objectStore('assets').put(asset)
    );
    
    const bookingPromises = data.bookings.map(booking => 
      tx.objectStore('bookings').put(booking)
    );

    await Promise.all([...roomPromises, ...assetPromises, ...bookingPromises]);
    await tx.done;
  }

  async clearAll(): Promise<void> {
    await Promise.all([
      this.clearStore('rooms'),
      this.clearStore('assets'),
      this.clearStore('bookings')
    ]);
  }

  private async clearStore(storeName: string): Promise<void> {
    return this.transaction(storeName, 'readwrite', (store) => store.clear());
  }

  private transaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => IDBRequest
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database not initialized');
      
      const transaction = this.db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      const request = callback(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database not initialized');
      
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const storage = new StorageService();